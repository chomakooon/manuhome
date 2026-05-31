import { supabase, isSupabaseConfigured } from './supabase';

/**
 * お問い合わせを submit-contact Edge Function 経由で送信する。
 * contacts テーブルへの保存 + Discord/Slack 通知を行う。
 *
 * @param {Object} params
 * @param {string} params.source  - 'kataribin-contact' | 'intake' | 'pawspress-contact'
 * @param {string} [params.name]
 * @param {string} [params.email]
 * @param {string} [params.phone]
 * @param {string} [params.message]
 * @param {Object} [params.metadata] - 添付ファイル名・カテゴリ・プラン等の付随情報
 * @returns {Promise<{ok: true, id: string|null}>}
 * @throws バックエンド未設定時やエラー時は throw（呼び出し側で error 状態にする）
 */
export async function submitContact({ source = 'contact', name = '', email = '', phone = '', message = '', metadata = {} }) {
    if (!isSupabaseConfigured) {
        throw new Error('BACKEND_NOT_CONFIGURED');
    }

    const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: { source, name, email, phone, message, metadata },
    });

    if (error) throw error;
    return data;
}
