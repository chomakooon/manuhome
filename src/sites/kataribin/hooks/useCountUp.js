/**
 * @file src/sites/kataribin/hooks/useCountUp.js
 *
 * 「数字で見るカタチ便」セクション用のカウントアップ hook（Phase 14）。
 *
 * 使い方:
 *   const { ref, display } = useCountUp('100+');
 *   <span ref={ref}>{display}</span>
 *
 * 仕様:
 *   - 入力例: "100+", "70", "8", "3"
 *   - 先頭の数値部分のみアニメーション、残りの記号（"+" 等）は保持
 *   - viewport に入ったタイミングで 1 度だけ実行
 *   - duration: 1.5s, easing: easeOutCubic
 *   - prefers-reduced-motion が有効なら最終値を即座に表示
 */

import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 1500;
// easeOutCubic
const ease = (t) => 1 - Math.pow(1 - t, 3);

/**
 * "100+" → { num: 100, suffix: "+" }
 * "70"   → { num: 70,  suffix: "" }
 */
const parseValue = (value) => {
    const str = String(value);
    const match = str.match(/^(\d+)(.*)$/);
    if (!match) return { num: NaN, suffix: str };
    return { num: parseInt(match[1], 10), suffix: match[2] };
};

const format = (n, suffix) => `${Math.round(n)}${suffix}`;

/**
 * 初期表示値を決定する（render に間に合わせる lazy initializer）:
 *   - 数値解析に失敗 → 入力値そのまま
 *   - prefers-reduced-motion / IntersectionObserver 非対応 → 最終値を即表示
 *   - それ以外 → "0<suffix>" から開始してカウントアップ
 */
const getInitialDisplay = (num, suffix, fallback) => {
    if (!Number.isFinite(num)) return String(fallback);
    const skipAnimation =
        typeof window !== 'undefined' &&
        (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
            typeof IntersectionObserver === 'undefined');
    return skipAnimation ? format(num, suffix) : `0${suffix}`;
};

export default function useCountUp(target) {
    const ref = useRef(null);
    const { num, suffix } = parseValue(target);
    const started = useRef(false);
    const [display, setDisplay] = useState(() =>
        getInitialDisplay(num, suffix, target)
    );

    useEffect(() => {
        const el = ref.current;
        if (!el || !Number.isFinite(num)) return;

        // 初期化時点でアニメーション省略を決めているため、ここに来た時点で
        // 観測可能・モーション尊重可能。observer を仕掛けるだけで OK。
        if (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            typeof IntersectionObserver === 'undefined'
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting || started.current) continue;
                    started.current = true;
                    observer.unobserve(entry.target);

                    const startTs = performance.now();
                    const tick = (now) => {
                        const elapsed = now - startTs;
                        const t = Math.min(1, elapsed / DURATION_MS);
                        const current = num * ease(t);
                        setDisplay(format(current, suffix));
                        if (t < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [num, suffix]);

    return { ref, display };
}
