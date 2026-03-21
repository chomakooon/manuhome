import { supabase, isSupabaseConfigured } from './supabase';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_ID = 'google/gemini-3.1-flash-image-preview';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Demo placeholder SVG for when API is not configured
function createPlaceholderSvg(label) {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];
    const colorIndex = label.charCodeAt(label.length - 1) % colors.length;
    const color = colors[colorIndex];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
        <rect width="400" height="560" rx="12" fill="#f8f9fa" stroke="${color}" stroke-width="2"/>
        <text x="200" y="40" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="${color}">パターン${label}</text>
        ${[0, 1, 2, 3].map(i => `
            <rect x="20" y="${60 + i * 125}" width="360" height="115" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
            <text x="200" y="${125 + i * 125}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#9ca3af">${['起（導入）', '承（展開）', '転（転換）', '結（結末）'][i]}</text>
            <circle cx="60" cy="${110 + i * 125}" r="20" fill="${color}20" stroke="${color}" stroke-width="1"/>
            <rect x="100" y="${100 + i * 125}" width="120" height="10" rx="4" fill="#e5e7eb"/>
            <rect x="100" y="${118 + i * 125}" width="80" height="10" rx="4" fill="#f3f4f6"/>
        `).join('')}
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function buildPrompt(hearingData, patternIndex) {
    const styleVariants = [
        'シンプルでポップな線画スタイル、明るい色使い',
        'ビジネス書籍風の落ち着いたイラスト、青・グレー系',
        'コミカルでデフォルメの強いカートゥーン調',
        'スタイリッシュでモダンなフラットデザイン風',
    ];

    const toneMap = { comic: 'コミカルで楽しい', serious: '真面目でプロフェッショナル', emotional: '感動的で心に響く' };
    const charMap = { auto: 'おまかせ', human: '人物キャラクター', animal: '動物キャラクター', custom: 'オリジナルキャラクター' };

    const product = hearingData.product_service || '商品・サービス';
    const target = hearingData.target_audience || 'ビジネスパーソン';
    const message = hearingData.message || '商品の魅力を伝える';
    const tone = toneMap[hearingData.tone] || toneMap.comic;
    const character = charMap[hearingData.character_pref] || charMap.auto;

    return `あなたはビジネス4コマ漫画のラフイメージを生成するイラストレーターです。
以下の【必須条件】をすべて厳守して、4コマ漫画のラフスケッチ画像を1枚生成してください。
条件に反する要素は一切含めないでください。

【必須条件】※すべて必ず反映すること

1. 紹介する商品・サービス: 「${product}」
   → 4コマのストーリーはこの商品・サービスの魅力を伝える内容にすること

2. ターゲット層: 「${target}」
   → 登場人物や場面設定はこのターゲット層に合わせること

3. 伝えたいメッセージ: 「${message}」
   → このメッセージがオチ（結）で伝わるストーリー構成にすること

4. キャラクタースタイル: 「${character}」
   → 必ずこのタイプのキャラクターを使用すること。他のタイプに変更しないこと

5. トーン・雰囲気: 「${tone}」
   → 漫画全体の表現をこのトーンに統一すること。トーンを逸脱しないこと

6. 画風: 「${styleVariants[patternIndex]}」
   → この画風で描くこと

【レイアウト・形式の指定】
- 4コマを縦に並べた1枚の画像として生成（起承転結の構成）
- 各コマに吹き出しを入れ、日本語のセリフを入れること
- ラフスケッチ・コンセプト画として描くこと（完成画ではない）
- 各コマの内容が上記の必須条件と矛盾しないこと`;
}

/**
 * Call OpenRouter API directly (for local dev with VITE_OPENROUTER_API_KEY)
 */
async function callOpenRouterDirect(hearingData) {
    const imagePromises = Array.from({ length: 4 }, (_, i) => {
        const prompt = buildPrompt(hearingData, i);
        return fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages: [{ role: 'user', content: prompt }],
            }),
        }).then(res => res.json());
    });

    const results = await Promise.allSettled(imagePromises);
    const images = [];

    for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const msg = result.value?.choices?.[0]?.message;
        if (!msg) continue;

        // Image generation models return images in message.images array
        if (msg.images && msg.images.length > 0) {
            for (const img of msg.images) {
                const url = img?.image_url?.url || img?.url;
                if (url) images.push(url);
            }
        }
    }

    return images;
}

/**
 * Generate manga preview images from hearing data.
 * Priority: 1) Local API key → direct call  2) Edge Function  3) Placeholder
 */
export async function generateMangaPreview(hearingData) {
    // 1) ローカル: .envにAPIキーがあれば直接呼び出し
    if (OPENROUTER_API_KEY) {
        try {
            const images = await callOpenRouterDirect(hearingData);
            if (images.length > 0) return { images };
            return { images: [], error: 'AIからの応答がありませんでした' };
        } catch (err) {
            console.error('OpenRouter direct call error:', err);
            return { images: [], error: err.message || 'AI画像生成中にエラーが発生しました' };
        }
    }

    // 2) 本番: Supabase Edge Function経由
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabase.functions.invoke('generate-manga-preview', {
                body: { hearingData, patternCount: 4 },
            });
            if (error) throw error;
            if (data?.images?.length > 0) return { images: data.images };
            return { images: [], error: 'AIからの応答がありませんでした' };
        } catch (err) {
            console.error('Edge function error:', err);
        }
    }

    // 3) フォールバック: プレースホルダー
    await new Promise(resolve => setTimeout(resolve, 1500));
    const labels = ['A', 'B', 'C', 'D'];
    return { images: labels.map(label => createPlaceholderSvg(label)) };
}
