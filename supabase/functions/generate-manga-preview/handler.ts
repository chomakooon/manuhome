import { corsResponse, enforceRateLimit, HttpError, jsonResponse, readJson, respondError } from '../_shared/http.ts';

export const MANGA_MODEL = 'google/gemini-3.1-flash-image-preview';

function buildPrompt(hearingData: Record<string, string>, patternIndex: number): string {
    const styleVariants = [
        'シンプルでポップな線画スタイル、明るい色使い',
        'ビジネス書籍風の落ち着いたイラスト、青・グレー系',
        'コミカルでデフォルメの強いカートゥーン調',
        'スタイリッシュでモダンなフラットデザイン風',
    ];

    const product = hearingData.product_service || '商品・サービス';
    const target = hearingData.target_audience || 'ビジネスパーソン';
    const message = hearingData.message || '';
    const characterPref = hearingData.character_pref || 'auto';
    const tone = hearingData.tone || 'comic';

    const toneMap: Record<string, string> = {
        comic: 'コミカルで楽しい',
        serious: '真面目でプロフェッショナル',
        emotional: '感動的で心に響く',
    };

    const charMap: Record<string, string> = {
        auto: 'おまかせ（シーンに合ったキャラクター）',
        human: '人物キャラクター',
        animal: '動物キャラクター',
        custom: 'ユニークなオリジナルキャラクター',
    };

    const character = charMap[characterPref] || charMap.auto;
    const toneLabel = toneMap[tone] || toneMap.comic;

    return `あなたはビジネス4コマ漫画のラフイメージを生成するイラストレーターです。
以下の【必須条件】をすべて厳守して、4コマ漫画のラフスケッチ画像を1枚生成してください。
条件に反する要素は一切含めないでください。

【必須条件】※すべて必ず反映すること

1. 紹介する商品・サービス: 「${product}」
   → 4コマのストーリーはこの商品・サービスの魅力を伝える内容にすること

2. ターゲット層: 「${target}」
   → 登場人物や場面設定はこのターゲット層に合わせること

3. 伝えたいメッセージ: 「${message || '商品の魅力を伝える'}」
   → このメッセージがオチ（結）で伝わるストーリー構成にすること

4. キャラクタースタイル: 「${character}」
   → 必ずこのタイプのキャラクターを使用すること。他のタイプに変更しないこと

5. トーン・雰囲気: 「${toneLabel}」
   → 漫画全体の表現をこのトーンに統一すること。トーンを逸脱しないこと

6. 画風: 「${styleVariants[patternIndex]}」
   → この画風で描くこと

【レイアウト・形式の指定】
- 4コマを縦に並べた1枚の画像として生成（起承転結の構成）
- 各コマに吹き出しを入れ、日本語のセリフを入れること
- ラフスケッチ・コンセプト画として描くこと（完成画ではない）
- 各コマの内容が上記の必須条件と矛盾しないこと`;
}

export function createMangaPreviewHandler({ supabase, apiKey, fetcher = fetch }: {
    supabase: any; apiKey: string | undefined; fetcher?: typeof fetch;
}) {
    return async (req: Request): Promise<Response> => {
        try {
            const preflight = corsResponse(req);
            if (preflight) return preflight;
            const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
            if (!token) throw new HttpError(401, 'ログインしてください。');
            const auth = await supabase.auth.getUser(token);
            if (auth.error || !auth.data.user) throw new HttpError(401, 'ログインし直してください。');
            const profile = await supabase.from('profiles').select('role').eq('id', auth.data.user.id).single();
            if (profile.error || profile.data?.role !== 'creator') throw new HttpError(403, '画像生成は管理者だけが利用できます。');
            if (!apiKey) throw new HttpError(503, '画像生成の設定を確認してください。');
            await enforceRateLimit(req, supabase, 'image-day', { limit: 4, windowSeconds: 86400, globalLimit: 8 });
            const { hearingData, patternCount = 4 } = await readJson(req, 8192);
            if (!hearingData || typeof hearingData !== 'object' || Array.isArray(hearingData) ||
                !Number.isInteger(patternCount) || patternCount < 1 || patternCount > 4) throw new HttpError(400, '生成内容を確認してください。');
            const fields: Record<string, string> = {};
            for (const key of ['product_service', 'target_audience', 'message', 'character_pref', 'tone']) {
                const value = hearingData[key] ?? '';
                if (typeof value !== 'string' || value.length > 1000) throw new HttpError(400, '入力内容は各1000文字以内にしてください。');
                fields[key] = value;
            }
            // One deadline covers all variants, below the hosted gateway's 150s
            // idle timeout. Cancel sibling calls when any variant cannot complete.
            const deadline = AbortSignal.timeout(60_000);
            const cancellation = new AbortController();
            const signal = AbortSignal.any([deadline, cancellation.signal]);
            let images: string[];
            try {
                images = await Promise.all(Array.from({ length: patternCount }, async (_, index) => {
                    const response = await fetcher('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ model: MANGA_MODEL, modalities: ['image', 'text'], max_tokens: 1024, messages: [{ role: 'user', content: buildPrompt(fields, index) }] }),
                        signal,
                    });
                    if (!response.ok) throw new HttpError(502, '画像生成に失敗しました。');
                    const data = await response.json();
                    const generated = data?.choices?.[0]?.message?.images;
                    if (!Array.isArray(generated)) throw new HttpError(502, '生成画像を取得できませんでした。');
                    const image = generated.map((item: any) => item?.image_url?.url || item?.url)
                        .find((url: unknown) => typeof url === 'string' && /^(https:\/\/|data:image\/)/.test(url));
                    if (!image) throw new HttpError(502, '生成画像を取得できませんでした。');
                    return image;
                }));
            } catch (error) {
                cancellation.abort();
                if (error instanceof HttpError) throw error;
                if (deadline.aborted) throw new HttpError(504, '画像生成に時間がかかっています。時間をおいて再度お試しください。');
                throw new HttpError(502, '画像生成に失敗しました。時間をおいて再度お試しください。');
            }
            return jsonResponse(req, { images });
        } catch (error) { return respondError(req, error); }
    };
}
