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
const tailHalfWidth = 7;
const tailSeamOverlap = 4;
const tailTipRoundLength = 10;
const boxCornerRadius = 16;

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

function getPointAwayFromTip(tip: Point, endpoint: Point, distance: number): Point {
    const direction = {
        x: endpoint.x - tip.x,
        y: endpoint.y - tip.y,
    };
    const length = Math.hypot(direction.x, direction.y);

    return {
        x: tip.x + (direction.x / length) * distance,
        y: tip.y + (direction.y / length) * distance,
    };
}

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

function getRoundedRectSignedDistance(
    point: Point,
    boxPosition: Point,
    boxSize: Size,
    radius: number,
) {
    const center = {
        x: boxPosition.x + boxSize.width / 2,
        y: boxPosition.y + boxSize.height / 2,
    };
    const q = {
        x: Math.abs(point.x - center.x) - (boxSize.width / 2 - radius),
        y: Math.abs(point.y - center.y) - (boxSize.height / 2 - radius),
    };

    return (
        Math.hypot(Math.max(q.x, 0), Math.max(q.y, 0)) + Math.min(Math.max(q.x, q.y), 0) - radius
    );
}

/** 本体内部の点から外部の点へ向かう線分と、角丸外周との交点を返す。 */
function getRoundedRectExitPoint(
    insidePoint: Point,
    outsidePoint: Point,
    boxPosition: Point,
    boxSize: Size,
): Point {
    const radius = Math.min(boxCornerRadius, boxSize.width / 2, boxSize.height / 2);
    let insideRatio = 0;
    let outsideRatio = 1;

    for (let index = 0; index < 24; index += 1) {
        const ratio = (insideRatio + outsideRatio) / 2;
        const point = {
            x: insidePoint.x + (outsidePoint.x - insidePoint.x) * ratio,
            y: insidePoint.y + (outsidePoint.y - insidePoint.y) * ratio,
        };

        if (getRoundedRectSignedDistance(point, boxPosition, boxSize, radius) > 0) {
            outsideRatio = ratio;
        } else {
            insideRatio = ratio;
        }
    }

    return {
        x: insidePoint.x + (outsidePoint.x - insidePoint.x) * outsideRatio,
        y: insidePoint.y + (outsidePoint.y - insidePoint.y) * outsideRatio,
    };
}

/** 本体中心からアンカーへ向かう線と、角丸長方形の外周との交点・法線を返す。 */
function getRoundedRectAttachment(boxPosition: Point, boxSize: Size, anchor: Point) {
    const center = {
        x: boxPosition.x + boxSize.width / 2,
        y: boxPosition.y + boxSize.height / 2,
    };
    const radius = Math.min(boxCornerRadius, boxSize.width / 2, boxSize.height / 2);
    const innerHalfSize = {
        x: boxSize.width / 2 - radius,
        y: boxSize.height / 2 - radius,
    };
    const relativeAnchor = {
        x: anchor.x - center.x,
        y: anchor.y - center.y,
    };
    const closestInnerPoint = {
        x: Math.min(innerHalfSize.x, Math.max(-innerHalfSize.x, relativeAnchor.x)),
        y: Math.min(innerHalfSize.y, Math.max(-innerHalfSize.y, relativeAnchor.y)),
    };
    const fromInnerPoint = {
        x: relativeAnchor.x - closestInnerPoint.x,
        y: relativeAnchor.y - closestInnerPoint.y,
    };
    const distanceFromInnerPoint = Math.hypot(fromInnerPoint.x, fromInnerPoint.y);

    // アンカーが外側にある通常時は、そのアンカーから角丸長方形への最短点を使う。
    // 尻尾方向と外周の法線が一致するため、斜めでも三角形の高さが潰れない。
    if (distanceFromInnerPoint > radius) {
        const normal = {
            x: fromInnerPoint.x / distanceFromInnerPoint,
            y: fromInnerPoint.y / distanceFromInnerPoint,
        };

        return {
            attachment: {
                x: center.x + closestInnerPoint.x + normal.x * radius,
                y: center.y + closestInnerPoint.y + normal.y * radius,
            },
            normal,
        };
    }

    // ドラッグでアンカーと本体が重なった場合は、中心から外周への交点を使う。
    let direction = {
        x: anchor.x - center.x,
        y: anchor.y - center.y,
    };
    if (direction.x === 0 && direction.y === 0) {
        direction = { x: 0, y: -1 };
    }
    const directionLength = Math.hypot(direction.x, direction.y);
    const unitDirection = {
        x: direction.x / directionLength,
        y: direction.y / directionLength,
    };

    // SDFを使った二分探索で、直線部分と円弧部分を共通の計算で求める。
    let insideDistance = 0;
    let outsideDistance = Math.hypot(boxSize.width, boxSize.height);
    for (let index = 0; index < 32; index += 1) {
        const distance = (insideDistance + outsideDistance) / 2;
        const point = {
            x: center.x + unitDirection.x * distance,
            y: center.y + unitDirection.y * distance,
        };
        if (getRoundedRectSignedDistance(point, boxPosition, boxSize, radius) > 0) {
            outsideDistance = distance;
        } else {
            insideDistance = distance;
        }
    }

    const attachment = {
        x: center.x + unitDirection.x * outsideDistance,
        y: center.y + unitDirection.y * outsideDistance,
    };
    const epsilon = 0.01;
    const normalGradient = {
        x:
            getRoundedRectSignedDistance(
                { x: attachment.x + epsilon, y: attachment.y },
                boxPosition,
                boxSize,
                radius,
            ) -
            getRoundedRectSignedDistance(
                { x: attachment.x - epsilon, y: attachment.y },
                boxPosition,
                boxSize,
                radius,
            ),
        y:
            getRoundedRectSignedDistance(
                { x: attachment.x, y: attachment.y + epsilon },
                boxPosition,
                boxSize,
                radius,
            ) -
            getRoundedRectSignedDistance(
                { x: attachment.x, y: attachment.y - epsilon },
                boxPosition,
                boxSize,
                radius,
            ),
    };
    const normalLength = Math.hypot(normalGradient.x, normalGradient.y);

    return {
        attachment,
        normal: {
            x: normalGradient.x / normalLength,
            y: normalGradient.y / normalLength,
        },
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

    const tailPath = useMemo(() => {
        if (!boxSize.width || !boxSize.height) {
            return null;
        }

        const { attachment, normal } = getRoundedRectAttachment(boxPosition, boxSize, anchor);

        let direction = {
            x: anchor.x - attachment.x,
            y: anchor.y - attachment.y,
        };
        if (direction.x === 0 && direction.y === 0) {
            direction = normal;
        }

        const distance = Math.hypot(direction.x, direction.y);
        const unitDirection = {
            x: direction.x / distance,
            y: direction.y / distance,
        };
        const baseCenter = {
            x: attachment.x - normal.x * tailSeamOverlap,
            y: attachment.y - normal.y * tailSeamOverlap,
        };
        const tangent = { x: -normal.y, y: normal.x };
        const first = {
            x: baseCenter.x + tangent.x * tailHalfWidth,
            y: baseCenter.y + tangent.y * tailHalfWidth,
        };
        const second = {
            x: baseCenter.x - tangent.x * tailHalfWidth,
            y: baseCenter.y - tangent.y * tailHalfWidth,
        };
        const tip = {
            x: attachment.x + unitDirection.x * tailLength,
            y: attachment.y + unitDirection.y * tailLength,
        };
        const firstTipCurvePoint = getPointAwayFromTip(tip, first, tailTipRoundLength);
        const secondTipCurvePoint = getPointAwayFromTip(tip, second, tailTipRoundLength);
        const fillPath =
            `M ${first.x} ${first.y} ` +
            `L ${firstTipCurvePoint.x} ${firstTipCurvePoint.y} ` +
            `Q ${tip.x} ${tip.y} ${secondTipCurvePoint.x} ${secondTipCurvePoint.y} ` +
            `L ${second.x} ${second.y}`;
        const firstOutlinePoint = getRoundedRectExitPoint(first, tip, boxPosition, boxSize);
        const secondOutlinePoint = getRoundedRectExitPoint(second, tip, boxPosition, boxSize);
        const outlinePath =
            `M ${firstOutlinePoint.x} ${firstOutlinePoint.y} ` +
            `L ${firstTipCurvePoint.x} ${firstTipCurvePoint.y} ` +
            `Q ${tip.x} ${tip.y} ${secondTipCurvePoint.x} ${secondTipCurvePoint.y} ` +
            `L ${secondOutlinePoint.x} ${secondOutlinePoint.y}`;

        return {
            fill: `${fillPath} Z`,
            outline: outlinePath,
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
            <motion.svg
                aria-hidden="true"
                className="fixed inset-0 z-30 size-full overflow-visible pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen && tailPath ? 1 : 0 }}
                transition={{
                    duration: isOpen ? 0.3 : 0.18,
                    ease: "easeOut",
                }}
            >
                <path d={tailPath?.fill ?? ""} fill="white" />
                <path
                    d={tailPath?.outline ?? ""}
                    fill="none"
                    stroke="#E3E3E3"
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
            </motion.svg>

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
