import { corsResponse, enforceRateLimit, HttpError, jsonResponse, readJson, respondError } from '../_shared/http.ts';

export const CHAT_MODEL = 'google/gemini-2.5-flash';
const SYSTEM_PROMPT = `あなたは「カタチらぼ」の制作相談アシスタントです。イラスト・漫画・似顔絵・図解・ペットグッズの相談に日本語で2〜3文で回答してください。価格や納期を断定せず、料金は https://katachi-lab.creative-own.com/pricing を案内してください。相談・依頼は https://katachi-lab.creative-own.com/contact 、ペットグッズは https://katachi-lab.creative-own.com/pet/order 、制作事例は https://katachi-lab.creative-own.com/portfolio 、制作の流れは https://katachi-lab.creative-own.com/flow を使ってください。URLはこのリストのものだけを回答に含め、注文・決済を完了したと主張しないでください。`;

export function createAiChatHandler({ supabase, apiKey, fetcher = fetch }: { supabase: any; apiKey: string | undefined; fetcher?: typeof fetch }) {
    return async (req: Request): Promise<Response> => {
        try {
            const preflight = corsResponse(req);
            if (preflight) return preflight;
            if (!apiKey) throw new HttpError(503, 'AIアシスタントの受付を準備しています。お問い合わせページをご利用ください。');
            await enforceRateLimit(req, supabase, 'ai-minute', { limit: 8, windowSeconds: 60, globalLimit: 40 });
            await enforceRateLimit(req, supabase, 'ai-day', { limit: 40, windowSeconds: 86400, globalLimit: 500 });
            const body = await readJson(req, 32 * 1024);
            if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 21) throw new HttpError(400, '会話が長くなりました。会話をリセットしてお試しください。');
            // The system instruction and provider budget are owned by the server.
            const messages = body.messages.filter((m: any) => m?.role !== 'system');
            let total = 0;
            for (const message of messages) {
                if (!['user', 'assistant'].includes(message?.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 2000) throw new HttpError(400, '質問は2000文字以内で入力してください。');
                total += message.content.length;
            }
            if (!messages.length || messages.at(-1).role !== 'user' || total > 12_000) throw new HttpError(400, '会話が長くなりました。会話をリセットしてお試しください。');
            const response = await fetcher('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: CHAT_MODEL, max_tokens: 300, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.map(({ role, content }: any) => ({ role, content }))] }),
                signal: AbortSignal.timeout(25_000),
            });
            if (!response.ok) throw new HttpError(502, 'AIの応答を取得できませんでした。しばらくしてからお試しください。');
            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (typeof reply !== 'string' || !reply.trim() || reply.length > 10_000) throw new HttpError(502, 'AIの応答を取得できませんでした。');
            return jsonResponse(req, { reply });
        } catch (error) { return respondError(req, error); }
    };
}
