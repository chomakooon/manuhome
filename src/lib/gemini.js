import { supabase, isSupabaseConfigured } from './supabase';

export async function generateMangaPreview(hearingData) {
    if (!isSupabaseConfigured) return { images: [], error: '画像生成は現在利用できません。' };
    try {
        const { data, error } = await supabase.functions.invoke('generate-manga-preview', {
            body: { hearingData, patternCount: 4 },
        });
        if (error || !data?.images?.length) throw new Error('画像生成に失敗しました。管理者権限と設定をご確認ください。');
        return { images: data.images };
    } catch (error) {
        return { images: [], error: error.message || '画像生成に失敗しました。' };
    }
}
