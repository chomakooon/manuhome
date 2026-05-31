// お問い合わせ受付 Edge Function
// 1) contacts テーブルへ保存（service role）
// 2) Discord / Slack Webhook へ通知
//
// 必要な secrets:
//   - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（Supabaseが自動注入）
//   - CONTACT_WEBHOOK_URL（Discord または Slack のIncoming Webhook URL。任意）
//   - CONTACT_WEBHOOK_TYPE（'discord' | 'slack'。省略時は 'discord'）

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const {
            source = 'contact',
            name = '',
            email = '',
            phone = '',
            message = '',
            metadata = {},
        } = body ?? {};

        // 最低限のバリデーション
        if (!message && !email && !name) {
            return new Response(
                JSON.stringify({ error: '入力内容が空です' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 1) Supabase に保存
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        );

        const { data: saved, error: dbError } = await supabaseAdmin
            .from('contacts')
            .insert({ source, name, email, phone, message, metadata })
            .select()
            .single();

        if (dbError) {
            console.error('contacts insert error:', dbError);
            // 保存に失敗しても通知は試みる（取りこぼし防止）
        }

        // 2) Webhook 通知（設定があれば）
        const webhookUrl = Deno.env.get('CONTACT_WEBHOOK_URL');
        const webhookType = (Deno.env.get('CONTACT_WEBHOOK_TYPE') || 'discord').toLowerCase();

        if (webhookUrl) {
            const sourceLabel: Record<string, string> = {
                'kataribin-contact': 'カタチ便 お問い合わせ',
                'intake': 'カタチ便 制作相談',
                'pawspress-contact': 'もふらぼ お問い合わせ',
                'contact': 'お問い合わせ',
            };
            const title = `📩 ${sourceLabel[source] || source}`;
            const lines = [
                `**送信元**: ${source}`,
                name ? `**お名前**: ${name}` : '',
                email ? `**メール**: ${email}` : '',
                phone ? `**電話**: ${phone}` : '',
                message ? `**内容**:\n${message}` : '',
            ].filter(Boolean);

            const metaKeys = Object.keys(metadata || {});
            if (metaKeys.length > 0) {
                lines.push(`**付随情報**: ${JSON.stringify(metadata)}`);
            }
            const text = `${title}\n${lines.join('\n')}`;

            try {
                const payload = webhookType === 'slack'
                    ? { text }
                    : { content: text.slice(0, 1900) }; // Discordは2000字制限
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } catch (notifyErr) {
                console.error('webhook notify error:', notifyErr);
            }
        }

        return new Response(
            JSON.stringify({ ok: true, id: saved?.id ?? null }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        console.error('submit-contact error:', err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
