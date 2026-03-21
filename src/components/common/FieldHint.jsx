import { useState, useRef, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import './FieldHint.css';

const HOVER_DELAY = 1500; // ms

export default function FieldHint({ hint, children }) {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);
    const [dismissed, setDismissed] = useState(false);

    const startTimer = () => {
        if (dismissed || !hint) return;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(true), HOVER_DELAY);
    };

    const cancelTimer = () => {
        clearTimeout(timerRef.current);
    };

    const hideAndCancel = () => {
        cancelTimer();
        setVisible(false);
    };

    const dismiss = (e) => {
        e.stopPropagation();
        setVisible(false);
        setDismissed(true);
    };

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    useEffect(() => {
        setDismissed(false);
    }, [hint]);

    if (!hint) return children;

    return (
        <div
            className="field-hint-wrap"
            onMouseEnter={startTimer}
            onMouseLeave={hideAndCancel}
            onFocusCapture={startTimer}
            onBlurCapture={hideAndCancel}
            onClickCapture={startTimer}
        >
            {children}
            {visible && (
                <div className="field-hint-bubble" onMouseEnter={cancelTimer}>
                    <div className="field-hint-bubble__header">
                        <Lightbulb size={14} />
                        <span>入力のヒント</span>
                    </div>
                    <p className="field-hint-bubble__text">{hint}</p>
                    <button className="field-hint-bubble__close" onClick={dismiss}>OK</button>
                </div>
            )}
        </div>
    );
}
