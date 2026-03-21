import { useState, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useVoiceInput({ lang = 'ja-JP', onResult } = {}) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    const isSupported = !!SpeechRecognition;

    const start = useCallback(() => {
        if (!SpeechRecognition || isListening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult?.(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [lang, isListening, onResult]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    const toggle = useCallback(() => {
        isListening ? stop() : start();
    }, [isListening, start, stop]);

    return { isListening, isSupported, toggle };
}
