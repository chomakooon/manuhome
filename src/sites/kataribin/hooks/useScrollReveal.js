/**
 * @file src/sites/kataribin/hooks/useScrollReveal.js
 *
 * IntersectionObserver でセクションを 1 度だけフェードイン表示する hook（Phase 14）。
 *
 * 使い方:
 *   const ref = useScrollReveal();
 *   <section ref={ref} className="reveal">...</section>
 *
 *   // しきい値を変える: useScrollReveal({ threshold: 0.3 })
 *   // 余白を変える:   useScrollReveal({ rootMargin: '0px 0px -10% 0px' })
 *
 * 仕様:
 *   - viewport に入ったタイミングで `reveal--in` クラスを付与
 *   - 1 度発火したら observer を切断（再観測しない）
 *   - prefers-reduced-motion が有効な場合は即座に reveal--in を付与し observer を作らない
 */

import { useEffect, useRef } from 'react';

const DEFAULT_OPTIONS = {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px',
};

export default function useScrollReveal(options = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;
        if (prefersReduced) {
            el.classList.add('reveal--in');
            return;
        }

        // IntersectionObserver 非対応環境ではフォールバックで即表示
        if (typeof IntersectionObserver === 'undefined') {
            el.classList.add('reveal--in');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal--in');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { ...DEFAULT_OPTIONS, ...options }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [options]);

    return ref;
}
