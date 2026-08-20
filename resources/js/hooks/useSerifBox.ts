import {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";

import type { ElementRect } from "./useElementRect";
import {
    createTailPath,
    defaultTailOptions,
    doRectsOverlap,
    getInitialBoxPosition,
    type AnimationStartedAt,
    type Point,
    type Size,
    type TailOptions,
} from "./serifBoxGeometry";

export type { AnimationStartedAt, Point, TailOptions } from "./serifBoxGeometry";

export type UseSerifBoxOptions = {
    anchor: Point;
    targetRect?: ElementRect;
    animationStartedAt: AnimationStartedAt;
    tail?: Partial<TailOptions>;
};

export function useSerifBox({
    anchor: anchorInput,
    targetRect,
    animationStartedAt,
    tail,
}: UseSerifBoxOptions) {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const dragStartRef = useRef({ pointer: { x: 0, y: 0 }, offset: { x: 0, y: 0 } });
    const dragFrameRef = useRef<number | null>(null);
    const pendingOffsetRef = useRef<Point | null>(null);
    const [boxSize, setBoxSize] = useState<Size>({ width: 0, height: 0 });
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // 以下の値はすべて createTailPath の入力になる。参照が変わるとその都度
    // 二分探索を含む幾何計算が走り直すので、値が同じ限り参照を保つようにしている。
    const options = useMemo<TailOptions>(
        () => ({ ...defaultTailOptions, ...tail }),
        [
            tail?.length,
            tail?.halfWidth,
            tail?.seamOverlap,
            tail?.tipRoundLength,
            tail?.boxCornerRadius,
        ],
    );
    const anchor = useMemo(
        () => ({ x: anchorInput.x, y: anchorInput.y }),
        [anchorInput.x, anchorInput.y],
    );

    useEffect(() => {
        const box = boxRef.current;
        if (!box) {
            return;
        }

        const updateSize = () => {
            setBoxSize((prev) =>
                prev.width === box.offsetWidth && prev.height === box.offsetHeight
                    ? prev
                    : { width: box.offsetWidth, height: box.offsetHeight },
            );
        };
        const observer = new ResizeObserver(updateSize);

        updateSize();
        observer.observe(box);

        return () => observer.disconnect();
    }, []);

    const boxPosition = useMemo(() => {
        const initialBoxPosition = getInitialBoxPosition(
            anchor,
            boxSize,
            animationStartedAt,
            options.length,
            targetRect,
        );

        return {
            x: initialBoxPosition.x + dragOffset.x,
            y: initialBoxPosition.y + dragOffset.y,
        };
    }, [anchor, boxSize, animationStartedAt, options.length, targetRect, dragOffset]);
    const isTailStored = doRectsOverlap(boxPosition, boxSize, targetRect);
    const tailPath = useMemo(
        () => createTailPath(boxPosition, boxSize, anchor, options),
        [boxPosition, boxSize, anchor, options],
    );

    // useIdの戻り値はReactのバージョンによって記号を含むため、id属性に使える文字だけ残す
    const instanceId = useId();
    const maskId = useMemo(
        () => `serif-box-tail-mask-${instanceId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
        [instanceId],
    );

    // 待機中のドラッグ位置を反映する。pointermoveはフレームより高頻度で発火するため、
    // 直接setStateせずrequestAnimationFrameで1フレーム1回にまとめている。
    const flushDragOffset = useCallback(() => {
        dragFrameRef.current = null;

        const pending = pendingOffsetRef.current;
        if (!pending) {
            return;
        }

        pendingOffsetRef.current = null;
        setDragOffset((prev) => (prev.x === pending.x && prev.y === pending.y ? prev : pending));
    }, []);

    useEffect(
        () => () => {
            if (dragFrameRef.current !== null) {
                window.cancelAnimationFrame(dragFrameRef.current);
            }
        },
        [],
    );

    const onPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLDivElement>) => {
            if (event.button !== 0) {
                return;
            }

            event.currentTarget.setPointerCapture(event.pointerId);
            dragStartRef.current = {
                pointer: { x: event.clientX, y: event.clientY },
                offset: dragOffset,
            };
            setIsDragging(true);
        },
        [dragOffset],
    );

    const onPointerMove = useCallback(
        (event: ReactPointerEvent<HTMLDivElement>) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                return;
            }

            pendingOffsetRef.current = {
                x: dragStartRef.current.offset.x + event.clientX - dragStartRef.current.pointer.x,
                y: dragStartRef.current.offset.y + event.clientY - dragStartRef.current.pointer.y,
            };

            if (dragFrameRef.current === null) {
                dragFrameRef.current = window.requestAnimationFrame(flushDragOffset);
            }
        },
        [flushDragOffset],
    );

    const stopDragging = useCallback(
        (event: ReactPointerEvent<HTMLDivElement>) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }

            // 最後のpointermoveを取りこぼさないよう、待機中の位置を反映してから終了する
            if (dragFrameRef.current !== null) {
                window.cancelAnimationFrame(dragFrameRef.current);
            }
            flushDragOffset();
            setIsDragging(false);
        },
        [flushDragOffset],
    );

    return {
        boxRef,
        boxPosition,
        isDragging,
        isTailStored,
        tailPath,
        tailRevealRadius: options.length + 2,
        maskId,
        dragHandleProps: {
            onPointerDown,
            onPointerMove,
            onPointerUp: stopDragging,
            onPointerCancel: stopDragging,
        },
    };
}
