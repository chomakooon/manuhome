import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, ArrowRight, Loader } from 'lucide-react';
import './AiAssistant.css';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const CHAT_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = `あなたは「かたち便」というイラスト制作サービスのAIアシスタントです。
お客様の質問に親切に答え、注文の手助けをしてください。

対応サービス：
- SNSアイコン制作（¥5,000〜）
- ビジネス4コマ漫画制作（¥15,000〜）
- 似顔絵制作（¥8,000〜）
- 図解イラスト制作（¥10,000〜）
- ペットイラスト・グッズ制作（¥5,000〜、Tシャツ・アクリルスタンド・ステッカー・マグカップ対応）

回答ルール：
- 簡潔に2〜3文で答える
- フォーム入力で迷っている場合は具体的な入力例を提示する
- わからないことは「制作相談フォームから詳しくご相談ください」と案内
- 料金の詳細な見積もりは出さず、目安としてプラン価格を案内`;

const FAQ_ITEMS = [
    { q: 'どんなサービスがありますか？', a: 'SNSアイコン、ビジネス4コマ、似顔絵、図解イラスト、ペットイラスト・グッズの制作に対応しています。', action: '/order', actionLabel: '注文ページへ' },
    { q: '料金はいくらですか？', a: 'SNSアイコン ¥5,000〜、似顔絵 ¥8,000〜、図解 ¥10,000〜、ビジネス4コマ ¥15,000〜、ペットイラスト ¥5,000〜です。', action: '/order', actionLabel: '料金を確認' },
    { q: '納期はどのくらい？', a: '内容により5日〜3週間程度です。お急ぎ納品オプションもあります。' },
    { q: 'ポートフォリオを見たい', a: '制作実績はポートフォリオページでご覧いただけます。', action: '/portfolio', actionLabel: 'ポートフォリオへ' },
    { q: '入力内容に迷っている', a: '各フォーム欄にカーソルを合わせるとヒントが表示されます。具体的な内容はこちらでご相談いただけます！' },
    { q: 'その他のお問い合わせ', a: 'お気軽にお問い合わせフォームからご連絡ください。', action: '/intake', actionLabel: 'お問い合わせへ' },
];

export default function AiAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'こんにちは！かたち便のAIアシスタントです。ご質問やフォーム入力のご相談、お気軽にどうぞ。' },
    ]);
    const [showFaq, setShowFaq] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open && !showFaq) inputRef.current?.focus();
    }, [open, showFaq]);

    const handleFaqClick = (item) => {
        setShowFaq(false);
        setMessages(prev => [
            ...prev,
            { role: 'user', content: item.q },
            { role: 'assistant', content: item.a, action: item.action, actionLabel: item.actionLabel },
        ]);
    };

    const handleAction = (path) => {
        setOpen(false);
        navigate(path);
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        if (!OPENROUTER_API_KEY) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'AI相談機能は現在準備中です。「質問一覧」からよくある質問をご確認いただくか、制作相談フォームからお問い合わせください。',
                    action: '/intake',
                    actionLabel: 'お問い合わせへ',
                }]);
                setLoading(false);
            }, 500);
            return;
        }

        try {
            const apiMessages = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages.filter(m => !m.action).map(m => ({ role: m.role, content: m.content })),
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
                content: '通信エラーが発生しました。しばらくしてからお試しください。',
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
            <button
                className={`ai-toggle ${open ? 'ai-toggle--open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-label="AIアシスタント"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {open && (
                <div className="ai-window">
                    <div className="ai-window__header">
                        <Bot size={18} />
                        <span>AIアシスタント</span>
                    </div>

                    <div className="ai-window__messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`ai-msg ai-msg--${msg.role}`}>
                                <p>{msg.content}</p>
                                {msg.action && (
                                    <button
                                        className="ai-msg__action"
                                        onClick={() => handleAction(msg.action)}
                                    >
                                        {msg.actionLabel} <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-msg ai-msg--assistant">
                                <Loader size={16} className="ai-spin" />
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {showFaq && (
                        <div className="ai-window__faq">
                            <p className="ai-window__faq-label">よくある質問:</p>
                            <div className="ai-window__faq-list">
                                {FAQ_ITEMS.map((item, i) => (
                                    <button
                                        key={i}
                                        className="ai-window__faq-btn"
                                        onClick={() => handleFaqClick(item)}
                                    >
                                        {item.q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="ai-window__input-area">
                        <div className="ai-window__input-row">
                            <input
                                ref={inputRef}
                                type="text"
                                className="ai-window__input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="質問を入力..."
                                disabled={loading}
                            />
                            <button
                                className="ai-window__send"
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        {!showFaq && (
                            <button
                                className="ai-window__show-faq"
                                onClick={() => setShowFaq(true)}
                            >
                                質問一覧を表示
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
