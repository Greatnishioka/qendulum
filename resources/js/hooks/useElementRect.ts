import { useEffect, useMemo, useRef, useState } from "react";

export type ElementRect = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export type ElementAnchor = {
    top: number;
    left: number;
};

export function useElementRect<T extends HTMLElement>() {
    const elementRef = useRef<T | null>(null);
    const [rect, setRect] = useState<ElementRect | null>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) {
            return;
        }

        let frame: number | null = null;

        // TODO: 本音を言うと関数内に無い値を触らせたくないって思ったけど、ResizeObserverに私てるからそれは無理だな
        const readRect = () => {
            frame = null;

            // DOMの中の相対座標を取得
            const nextRect = element.getBoundingClientRect();

            // 値が変わっていなければ同じ参照を返し、下流の再レンダーと再計算を止める
            setRect((prev) =>
                prev &&
                prev.top === nextRect.top &&
                prev.left === nextRect.left &&
                prev.width === nextRect.width &&
                prev.height === nextRect.height
                    ? prev
                    : {
                          top: nextRect.top,
                          left: nextRect.left,
                          width: nextRect.width,
                          height: nextRect.height,
                      },
            );
        };

        // getBoundingClientRect()は同期レイアウトを強制するので、呼ぶ回数がそのまま負荷になる。
        // scrollやresizeはフレームより高頻度で発火しうるため、1フレーム1回に間引く。
        const scheduleUpdate = () => {
            if (frame === null) {
                frame = window.requestAnimationFrame(readRect);
            }
        };
        const resizeObserver = new ResizeObserver(scheduleUpdate);

        readRect();
        resizeObserver.observe(element);
        window.addEventListener("resize", scheduleUpdate);
        window.addEventListener("scroll", scheduleUpdate, { capture: true, passive: true });

        return () => {
            if (frame !== null) {
                window.cancelAnimationFrame(frame);
            }
            resizeObserver.disconnect();
            window.removeEventListener("resize", scheduleUpdate);
            window.removeEventListener("scroll", scheduleUpdate, true);
        };
    }, []);

    const center = useMemo<ElementAnchor | null>(
        () =>
            rect
                ? {
                      top: rect.top + rect.height / 2,
                      left: rect.left + rect.width / 2,
                  }
                : null,
        [rect],
    );

    return { elementRef, rect, center };
}
