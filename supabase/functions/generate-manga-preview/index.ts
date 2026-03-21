import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_ID = 'google/gemini-3.1-flash-image-preview';

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

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const apiKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { hearingData, patternCount = 4 } = await req.json();

        if (!hearingData) {
            return new Response(
                JSON.stringify({ error: 'hearingData is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const count = Math.min(patternCount, 4);
        const imagePromises = Array.from({ length: count }, (_, i) => {
            const prompt = buildPrompt(hearingData, i);
            return fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://manuhome.com',
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                }),
            }).then(res => res.json());
        });

        const results = await Promise.allSettled(imagePromises);

        const images: string[] = [];
        for (const result of results) {
            if (result.status !== 'fulfilled') continue;
            const msg = result.value?.choices?.[0]?.message;
            if (!msg) continue;

            if (msg.images && msg.images.length > 0) {
                for (const img of msg.images) {
                    const url = img?.image_url?.url || img?.url;
                    if (url) images.push(url);
                }
            }
        }

        return new Response(
            JSON.stringify({ images }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
