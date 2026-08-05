import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

// ============ config ============

const transformOriginMap = {
    top: "50% 0%",
    bottom: "50% 100%",
    left: "0% 50%",
    right: "100% 50%",
} as const;

const tailLength = 29;

// ============ type ============

type AnimationStartedAt = keyof typeof transformOriginMap;

type Point = {
    x: number;
    y: number;
};

type Size = {
    width: number;
    height: number;
};

type Props = {
    children: React.ReactNode;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    disableClose?: boolean;
    title: string;
    position: {
        top: number;
        left: number;
    };
    // sizeが設定されている場合は、SerifBoxの幅と高さをそれに合わせる。設定されていない場合は内容に合わせる
    drawingArea?: {
        width?: number;
        height?: number;
    };
    animationStartedAt: AnimationStartedAt;
    messageBox?: React.ReactNode;
};

function getInitialBoxPosition(
    anchor: Point,
    boxSize: Size,
    animationStartedAt: AnimationStartedAt,
): Point {
    switch (animationStartedAt) {
        case "left":
            return { x: anchor.x + tailLength, y: anchor.y - boxSize.height / 2 };
        case "top":
            return { x: anchor.x - boxSize.width / 2, y: anchor.y + tailLength };
        case "bottom":
            return {
                x: anchor.x - boxSize.width / 2,
                y: anchor.y - tailLength - boxSize.height,
            };
        case "right":
        default:
            return {
                x: anchor.x - tailLength - boxSize.width,
                y: anchor.y - boxSize.height / 2,
            };
    }
}

/** 本体の中心からアンカーへ伸ばした線と、本体の外周との交点を返す。 */
function getTailBase(boxPosition: Point, boxSize: Size, anchor: Point) {
    const center = {
        x: boxPosition.x + boxSize.width / 2,
        y: boxPosition.y + boxSize.height / 2,
    };
    let direction = {
        x: anchor.x - center.x,
        y: anchor.y - center.y,
    };
    // 本体の中心とアンカーが完全に重なった場合も計算結果を有限値に保つ。
    if (direction.x === 0 && direction.y === 0) {
        direction = { x: 0, y: -1 };
    }
    const halfWidth = boxSize.width / 2;
    const halfHeight = boxSize.height / 2;
    const scale = Math.min(
        direction.x === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(direction.x),
        direction.y === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(direction.y),
    );

    return {
        center: {
            x: center.x + direction.x * scale,
            y: center.y + direction.y * scale,
        },
        direction,
    };
}

// このコンポーネントは枠だけ準備して、jsxを子コンポーネントとして実装しています。
// そのため、子コンポーネントで起こったエラー用のmessageBoxをpropsで受け取るようにしています。
export default function SerifBox({
    children,
    setIsOpenModal,
    isOpen,
    disableClose = false,
    title,
    position,
    drawingArea,
    animationStartedAt,
    messageBox,
}: Props) {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const dragStartRef = useRef({ pointer: { x: 0, y: 0 }, offset: { x: 0, y: 0 } });
    const [boxSize, setBoxSize] = useState<Size>({ width: 0, height: 0 });
    const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const box = boxRef.current;
        if (!box) {
            return;
        }

        const updateSize = () => {
            setBoxSize({ width: box.offsetWidth, height: box.offsetHeight });
        };
        const observer = new ResizeObserver(updateSize);

        updateSize();
        observer.observe(box);

        return () => observer.disconnect();
    }, []);

    const anchor = useMemo(
        () => ({ x: position.left, y: position.top }),
        [position.left, position.top],
    );
    const initialBoxPosition = getInitialBoxPosition(anchor, boxSize, animationStartedAt);
    const boxPosition = {
        x: initialBoxPosition.x + dragOffset.x,
        y: initialBoxPosition.y + dragOffset.y,
    };

    const tailPosition = useMemo(() => {
        if (!boxSize.width || !boxSize.height) {
            return null;
        }

        const base = getTailBase(boxPosition, boxSize, anchor);

        return {
            left: base.center.x,
            top: base.center.y - 7,
            angle: (Math.atan2(base.direction.y, base.direction.x) * 180) / Math.PI,
        };
    }, [anchor, boxPosition, boxSize]);

    const startDragging = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStartRef.current = {
            pointer: { x: event.clientX, y: event.clientY },
            offset: dragOffset,
        };
        setIsDragging(true);
    };

    const drag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            return;
        }

        setDragOffset({
            x: dragStartRef.current.offset.x + event.clientX - dragStartRef.current.pointer.x,
            y: dragStartRef.current.offset.y + event.clientY - dragStartRef.current.pointer.y,
        });
    };

    const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        setIsDragging(false);
    };

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <motion.div
                aria-hidden="true"
                className="fixed z-30 size-0 overflow-visible pointer-events-none"
                style={{
                    left: tailPosition?.left ?? 0,
                    top: (tailPosition?.top ?? 0) + 7,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen && tailPosition ? 1 : 0 }}
                transition={{
                    duration: isOpen ? 0.3 : 0.18,
                    ease: "easeOut",
                }}
            >
                <svg
                    className="absolute left-0 -top-[7px] max-w-none overflow-visible"
                    width="29"
                    height="14"
                    viewBox="0 0 29 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        transform: `rotate(${tailPosition?.angle ?? 0}deg)`,
                        transformOrigin: "0px 7px",
                    }}
                >
                    <path
                        d="M0.000148773 -1.26082e-06L27.1755 4.56428C29.4005 4.93797 29.4005 8.13533 27.1755 8.50902L0.000148202 13.0733L0.000148773 -1.26082e-06Z"
                        fill="white"
                    />
                    <path
                        d="M0.918945 0.154052L27.1757 4.56414C29.4004 4.93795 29.4004 8.13564 27.1757 8.50945L0.918945 12.9195L0.918945 11.9055L27.0096 7.52312C28.1221 7.33628 28.1221 5.73732 27.0096 5.55047L0.918945 1.16811L0.918945 0.154052Z"
                        fill="#E3E3E3"
                    />
                </svg>
            </motion.div>

            <motion.div
                ref={boxRef}
                className={`fixed z-20 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                style={{
                    top: boxPosition.y,
                    left: boxPosition.x,
                    transformOrigin: transformOriginMap[animationStartedAt],
                }}
                initial={{ opacity: 0, scale: 0.001 }}
                animate={{
                    opacity: isOpen ? 1 : 0,
                    scale: isOpen ? [0.08, 1.02, 1] : 0.001,
                }}
                transition={{
                    opacity: { duration: 0.18, ease: "easeOut" },
                    scale: {
                        duration: 0.45,
                        times: [0, 0.5, 1],
                        ease: [0.16, 1, 0.3, 1],
                    },
                }}
            >
                <div className="absolute -top-8 z-10">{messageBox}</div>
                <motion.div
                    className="relative overflow-hidden rounded-2xl border border-(--color-dark) qendulum-shadow"
                    style={{ transformOrigin: transformOriginMap[animationStartedAt] }}
                    initial={{ x: 8, filter: "blur(1px)" }}
                    animate={{
                        x: isOpen ? 0 : 8,
                        filter: isOpen ? "blur(0px)" : "blur(1px)",
                    }}
                    transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="relative z-20 py-1.5 px-5 flex items-center border-b border-(--color-dark) bg-white">
                        <div className="relative min-w-20 h-4.5 shrink-0">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.h3
                                    key={title}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                    className="absolute inset-0 text-(--color-turquoise) text-xs font-bold"
                                >
                                    {title}
                                </motion.h3>
                            </AnimatePresence>
                        </div>

                        <div
                            role="separator"
                            aria-label="ダイアログを移動"
                            className={`h-4.5 flex-1 touch-none select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                            onPointerDown={startDragging}
                            onPointerMove={drag}
                            onPointerUp={stopDragging}
                            onPointerCancel={stopDragging}
                        />

                        <button
                            type="button"
                            onClick={() => setIsOpenModal(false)}
                            disabled={disableClose}
                            className={`shrink-0 ${disableClose ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect width="14" height="14" rx="7" fill="#DF4646" />
                                <path
                                    d="M10.1182 4.70703L7.8252 7L10.2363 9.41113L9.5293 10.1182L7.11816 7.70703L4.70703 10.1182L4 9.41113L6.41113 7L4.11816 4.70703L4.8252 4L7.11816 6.29297L9.41113 4L10.1182 4.70703Z"
                                    fill="white"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="relative z-10 p-1 bg-white">
                        <div className="rounded-b-2xl rounded-t-sm py-1.5 bg-[#EDEDED] flex items-start justify-center px-8">
                            <motion.div
                                style={{
                                    width: drawingArea?.width,
                                    height: drawingArea?.height,
                                    transformOrigin: transformOriginMap[animationStartedAt],
                                }}
                                className={`overflow-hidden ${animationStartedAt === "left" ? "rotate-180" : ""}`}
                                initial={{ opacity: 0.45 }}
                                animate={{ opacity: isOpen ? 1 : 0.45 }}
                                transition={{
                                    duration: isOpen ? 0.2 : 0.12,
                                    ease: "easeOut",
                                }}
                            >
                                {children}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
