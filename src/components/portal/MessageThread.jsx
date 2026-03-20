import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import './MessageThread.css';

export default function MessageThread({ messages = [], onSend, currentUserId, loading = false }) {
    const [newMessage, setNewMessage] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSend(newMessage.trim());
        setNewMessage('');
    };

    return (
        <div className="msg-thread">
            <div className="msg-thread__messages">
                {messages.length === 0 ? (
                    <div className="msg-thread__empty">
                        <p>メッセージはまだありません</p>
                        <p>こちらからメッセージを送信できます</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`msg-bubble ${isMe ? 'msg-bubble--me' : 'msg-bubble--other'}`}
                            >
                                <div className="msg-bubble__header">
                                    <span className="msg-bubble__name">
                                        {msg.profiles?.full_name || (isMe ? 'あなた' : 'クリエイター')}
                                    </span>
                                    <span className="msg-bubble__role">
                                        {msg.profiles?.role === 'creator' ? 'クリエイター' : 'お客様'}
                                    </span>
                                </div>
                                <div className="msg-bubble__content">{msg.content}</div>
                                <div className="msg-bubble__time">
                                    {new Date(msg.created_at).toLocaleString('ja-JP', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <form className="msg-thread__input" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="form-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn btn-primary msg-thread__send"
                    disabled={!newMessage.trim() || loading}
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
