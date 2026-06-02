import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader } from 'lucide-react';
import './AiChatWidget.css';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const CHAT_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = `あなたは「カタチらぼ」というイラスト制作サービスの注文アシスタントです。
お客様の質問に親切に答え、適切なページへ案内してください。

対応できるサービス：
- SNSアイコン制作（¥5,000〜）
- ビジネス4コマ漫画制作（¥15,000〜）
- 似顔絵制作（¥8,000〜）
- 図解イラスト制作（¥10,000〜）
- ペットイラスト・グッズ制作（¥5,000〜、Tシャツ・アクリルスタンド・ステッカー・マグカップ対応）

【案内できるページURL】※質問内容に応じて必ず該当URLを回答に含めること
- 制作相談・お問い合わせ: https://katachi-lab.creative-own.com/intake
- 料金プラン: https://katachi-lab.creative-own.com/pricing
- 制作の流れ: https://katachi-lab.creative-own.com/flow
- 制作事例・ポートフォリオ: https://katachi-lab.creative-own.com/portfolio
- ビジュアル診断（おすすめプラン提案）: https://katachi-lab.creative-own.com/diagnostic
- カタチらぼについて: https://katachi-lab.creative-own.com/about
- ペットイラスト・グッズ（もふらぼ）: https://katachi-lab.creative-own.com/pet
- ペットグッズの注文: https://katachi-lab.creative-own.com/pet/order

回答のルール：
- 簡潔に、2〜3文で答える
- 絵文字は控えめに使う
- 【最重要】注文・依頼・問い合わせ・申し込みに関する質問には、必ず該当ページの
  完全なURL（https://から始まる上記URL）をそのまま本文に記載して案内する。
  「フォームから」等の曖昧な表現で済ませず、必ずクリックできるURLを書くこと。
- 料金の質問には料金プランURL、制作事例の質問にはポートフォリオURLを添える
- 迷ったら制作相談ページ（https://katachi-lab.creative-own.com/intake）を案内する
- 料金の詳細な見積もりは出さず、目安としてプラン価格を案内する`;

// 本文中のURL（プレーン / Markdown [label](url) 両対応）をクリック可能なリンクに変換する。
// カタチらぼ自サイトのURLは同タブ遷移、外部は別タブ。
function renderWithLinks(text) {
    if (!text) return text;
    // [label](url) と 素のURL の両方を1つの正規表現で検出
    const RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s）」、。]+)/g;
    const out = [];
    let last = 0;
    let m;
    while ((m = RE.exec(text)) !== null) {
        if (m.index > last) out.push(text.slice(last, m.index));
        const url = m[2] || m[3];
        const label = m[1] || url;
        const isInternal = url.includes('katachi-lab.creative-own.com');
        out.push(
            <a
                key={m.index}
                href={url}
                className="ai-chat-link"
                {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
                {label}
            </a>
        );
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

export default function AiChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'こんにちは！注文フォームでお悩みですか？\n入力内容や制作について、お気軽にご質問ください。' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    // 吹き出し表示制御:
    //   - 初回ロード後 3 秒だけ表示
    //   - その後はマスコット (FAB) hover/focus 中のみ再表示
    const [bubbleVisible, setBubbleVisible] = useState(true);
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setBubbleVisible(false), 3000);
        return () => clearTimeout(t);
    }, []);
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

        // バックエンド未設定なら静的応答
        if (!isSupabaseConfigured) {
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

            // OpenRouterへはサーバー(ai-chat Edge Function)経由。APIキーをフロントに出さない。
            const { data, error } = await supabase.functions.invoke('ai-chat', {
                body: { model: CHAT_MODEL, messages: apiMessages, max_tokens: 300 },
            });
            if (error) throw error;
            const reply = data?.reply || 'すみません、うまく応答できませんでした。';

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
                                <p>{renderWithLinks(msg.content)}</p>
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

            {/* FAB Button (閉じている時はマスコット猫を表示、開いている時は X アイコン) */}
            <div className="ai-chat-fab-wrap">
                {/* 吹き出し: 初回 3 秒 + hover/focus 中のみ */}
                {!open && (bubbleVisible || hovering) && (
                    <span className="ai-chat-fab__bubble" role="tooltip">
                        困ったら話しかけてね！
                    </span>
                )}
                <button
                    className={`ai-chat-fab ${open ? 'ai-chat-fab--open' : 'ai-chat-fab--mascot'}`}
                    onClick={() => setOpen(!open)}
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    onFocus={() => setHovering(true)}
                    onBlur={() => setHovering(false)}
                    aria-label={open ? 'AIアシスタントを閉じる' : 'AIアシスタントに相談する'}
                >
                    {open ? (
                        <X size={24} />
                    ) : (
                        <img
                            src="/mascot/chat-mascot.webp"
                            alt=""
                            className="ai-chat-fab__mascot-img"
                            aria-hidden="true"
                        />
                    )}
                </button>
            </div>
        </>
    );
}
