import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import './AiChatWidget.css';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const CHAT_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = `あなたは「かたち便」というイラスト制作サービスの注文アシスタントです。
お客様がフォーム入力で迷っている際に、親切にサポートしてください。

対応できるサービス：
- SNSアイコン制作（¥5,000〜）
- ビジネス4コマ漫画制作（¥15,000〜）
- 似顔絵制作（¥8,000〜）
- 図解イラスト制作（¥10,000〜）
- ペットイラスト・グッズ制作（¥5,000〜、Tシャツ・アクリルスタンド・ステッカー・マグカップ対応）

回答のルール：
- 簡潔に、2〜3文で答える
- 絵文字は控えめに使う
- 具体的な入力例を提示する
- わからないことは「制作相談フォームから詳しくご相談ください」と案内する
- 料金の詳細な見積もりは出さず、目安としてプラン価格を案内する`;

export default function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'こんにちは！注文フォームでお悩みですか？\n入力内容や制作について、お気軽にご質問ください。' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // If no API key, return a static response
        if (!OPENROUTER_API_KEY) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'ただいまAIアシスタント機能は準備中です。制作に関するご相談は「制作相談」ボタンからお問い合わせください。'
                }]);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const apiMessages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: text },
            ];

            const res = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: CHAT_MODEL,
                    messages: apiMessages,
                    max_tokens: 300,
                }),
            });

            const data = await res.json();
            const reply = data?.choices?.[0]?.message?.content || 'すみません、うまく応答できませんでした。';

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '通信エラーが発生しました。しばらくしてからお試しください。'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {open && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <span>AIアシスタント</span>
                        <button className="ai-chat-close" onClick={() => setOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="ai-chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`ai-chat-msg ai-chat-msg--${msg.role}`}>
                                <p>{msg.content}</p>
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-chat-msg ai-chat-msg--assistant">
                                <Loader size={16} className="spin" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="ai-chat-input-area">
                        <input
                            ref={inputRef}
                            type="text"
                            className="ai-chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="質問を入力..."
                            disabled={loading}
                        />
                        <button className="ai-chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <button
                className={`ai-chat-fab ${open ? 'ai-chat-fab--open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-label="AIアシスタント"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </>
    );
}
