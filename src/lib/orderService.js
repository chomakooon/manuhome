import { supabase } from './supabase';

/**
 * Validates order data and submits a new record to the Supabase `orders` table.
 * 
 * @param {Object} rawData Form data from the Order page
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function submitOrder(rawData) {
    try {
        // 1. Basic Validation
        if (!rawData.name?.trim()) throw new Error('お名前は必須です。');
        if (!rawData.email?.trim()) throw new Error('メールアドレスは必須です。');
        if (!rawData.category?.trim()) throw new Error('依頼カテゴリは必須です。');
        
        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(rawData.email.trim())) {
            throw new Error('有効なメールアドレスを入力してください。');
        }

        // 2. Map fields to DB Schema
        const payload = {
            customer_name: rawData.name.trim(),
            customer_email: rawData.email.trim(),
            sns_link: rawData.sns?.trim() || null,
            category: rawData.category.trim(),
            usage: rawData.usage?.trim() || null,
            details: rawData.details?.trim() || null,
            deadline: rawData.deadline || null,
            status: 'new', // Default status for admin dashboard
            created_at: new Date().toISOString()
        };

        // Note: For reference images, typically you upload to Supabase Storage first,
        // get the public URL, and save that URL in the row. Since Storage isn't 
        // fully configured in this phase, we skip the file payload or log it.

        // 3. Insert into Supabase
        const { error } = await supabase
            .from('orders')
            .insert([payload]);

        if (error) {
            console.error("Supabase Insert Error:", error);
            throw new Error('データベースへの保存に失敗しました。');
        }

        return { success: true };
    } catch (err) {
        return { 
            success: false, 
            error: err.message || '予期せぬエラーが発生しました。' 
        };
    }
}
