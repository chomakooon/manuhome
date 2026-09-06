import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader, RotateCcw } from 'lucide-react';
import './AiChatWidget.css';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// 会話履歴の保持（sessionStorage）。同一タブ内のページ遷移で履歴を維持する。
const CHAT_STORAGE_KEY = 'katachi_aichat_messages';
const CHAT_OPEN_KEY = 'katachi_aichat_open';
const INITIAL_MESSAGE = { role: 'assistant', content: 'こんにちは！注文フォームでお悩みですか？\n入力内容や制作について、お気軽にご質問ください。' };

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
        const isInternal = new URL(url).hostname === 'katachi-lab.creative-own.com';
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
    const [open, setOpen] = useState(() => {
        try { return sessionStorage.getItem(CHAT_OPEN_KEY) === '1'; } catch { return false; }
    });
    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const valid = parsed.filter(message => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string' && message.content.length <= 10000);
                    if (valid.length) return valid.slice(-100);
                }
            }
        } catch { /* ignore */ }
        return [INITIAL_MESSAGE];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const sendingRef = useRef(false);
    const generationRef = useRef(0);
    useEffect(() => () => { generationRef.current += 1; }, []);

    // 会話履歴・開閉状態をsessionStorageに保存（ページ遷移しても保持）
    useEffect(() => {
        try { sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    }, [messages]);
    useEffect(() => {
        try { sessionStorage.setItem(CHAT_OPEN_KEY, open ? '1' : '0'); } catch { /* ignore */ }
    }, [open]);
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
        if (!text || text.length > 2000 || sendingRef.current) return;
        sendingRef.current = true;
        const generation = generationRef.current;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            if (!isSupabaseConfigured) throw new Error('AI is unavailable');
            // Keep recent context within the server's byte and message limits.
            const apiMessages = [];
            let bytes = 0;
            let characters = 0;
            for (const message of [...messages, userMsg].slice(-20).reverse()) {
                if (message.error) continue;
                const item = { role: message.role, content: message.content.slice(0, 2000) };
                const itemBytes = new TextEncoder().encode(JSON.stringify(item)).length;
                if (bytes + itemBytes > 30000 || characters + item.content.length > 12000) break;
                bytes += itemBytes;
                characters += item.content.length;
                apiMessages.unshift(item);
            }
            const { data, error } = await supabase.functions.invoke('ai-chat', {
                body: { messages: apiMessages },
            });
            if (error) throw error;
            if (generationRef.current !== generation) return;
            const reply = data?.reply;
            if (typeof reply !== 'string' || !reply.trim() || reply.length > 10000) throw new Error('Invalid AI reply');

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            if (generationRef.current !== generation) return;
            setMessages(prev => [...prev, {
                role: 'assistant',
                error: true,
                content: 'AIの応答を取得できませんでした。しばらくしてからお試しいただくか、制作相談からお問い合わせください。'
            }]);
        } finally {
            if (generationRef.current === generation) {
                sendingRef.current = false;
                setLoading(false);
            }
        }
    };

    const handleReset = () => {
        generationRef.current += 1;
        sendingRef.current = false;
        setLoading(false);
        setMessages([INITIAL_MESSAGE]);
        setInput('');
        try { sessionStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
                        <div className="ai-chat-header__actions">
                            <button className="ai-chat-close" onClick={handleReset} title="会話をリセット" aria-label="会話をリセット">
                                <RotateCcw size={16} />
                            </button>
                            <button className="ai-chat-close" onClick={() => setOpen(false)} aria-label="閉じる">
                                <X size={18} />
                            </button>
                        </div>
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
                            maxLength={2000}
                            aria-label="AIへの質問"
                            className="ai-chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="質問を入力..."
                            disabled={loading}
                        />
                        <button aria-label="質問を送信" className="ai-chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
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
