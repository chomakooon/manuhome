import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, ArrowRight } from 'lucide-react';
import './AiAssistant.css';

const FAQ_ITEMS = [
    { q: 'ペットイラストの注文方法は？', a: 'ペットイラストは「注文する」ページから簡単に注文できます。写真をアップロードし、スタイルを選んで、お支払いするだけです。', action: '/order', actionLabel: '注文ページへ' },
    { q: '料金はいくらですか？', a: '1匹 ¥15,000、2匹 ¥25,000、3匹以上 ¥35,000（税込）です。スタイルによる追加料金はありません。', action: '/order', actionLabel: '料金を確認' },
    { q: '納期はどのくらい？', a: '通常2〜4週間でお届けします。お急ぎの場合はご相談ください。' },
    { q: 'どんなスタイルがある？', a: 'リアル風、かわいい系、水彩風、シンプルの4スタイルからお選びいただけます。', action: '/order', actionLabel: 'スタイルを見る' },
    { q: '修正はできますか？', a: '基本プランで2回の修正を含んでいます。大幅な変更でなければ柔軟に対応します。' },
    { q: 'ポートフォリオを見たい', a: '制作実績はポートフォリオページでご覧いただけます。', action: '/portfolio', actionLabel: 'ポートフォリオへ' },
    { q: 'その他の問い合わせ', a: 'お気軽にお問い合わせフォームからご連絡ください。24時間以内にご返信します。', action: '/intake', actionLabel: 'お問い合わせへ' },
];

export default function AiAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'こんにちは！カタチ便のAIアシスタントです。ご質問があればお気軽にどうぞ。' },
    ]);
    const [showFaq, setShowFaq] = useState(true);
    const bottomRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`ai-toggle ${open ? 'ai-toggle--open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-label="AIアシスタント"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>

            {/* Chat Window */}
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

                    {!showFaq && (
                        <div className="ai-window__input-area">
                            <button
                                className="ai-window__show-faq"
                                onClick={() => setShowFaq(true)}
                            >
                                質問一覧を表示
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
