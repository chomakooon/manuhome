export async function sendContactNotification(supabase: any, contact: any, fetcher = fetch): Promise<string> {
    const url = Deno.env.get('CONTACT_WEBHOOK_URL');
    const type = Deno.env.get('CONTACT_WEBHOOK_TYPE') || 'discord';
    let status = 'disabled';
    if (url) {
        const text = ['お問い合わせを受け付けました', `受付ID: ${contact.id}`, `送信元: ${contact.source}`,
            `お名前: ${contact.name}`, `メール: ${contact.email}`, contact.phone ? `電話: ${contact.phone}` : '',
            contact.message, '詳細・添付画像は管理画面で確認してください。'].filter(Boolean).join('\n').slice(0, 1800);
        try {
            const response = await fetcher(url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(type === 'slack'
                    ? { blocks: [{ type: 'section', text: { type: 'plain_text', text } }] }
                    : { content: text, allowed_mentions: { parse: [] } }),
                signal: AbortSignal.timeout(10_000),
            });
            status = response.ok ? 'sent' : 'failed';
        } catch { status = 'failed'; }
    }
    const { error } = await supabase.from('contacts').update({
        notification_status: status,
        notification_attempts: (contact.notification_attempts || 0) + (url ? 1 : 0),
        notified_at: status === 'sent' ? new Date().toISOString() : null,
    }).eq('id', contact.id);
    if (error) console.error('Contact notification status update failed');
    return status;
}
