import { AnimatePresence, motion } from "motion/react";

import React from "react";

import { useSerifBox, type AnimationStartedAt } from "@/hooks/useSerifBox";
import type { ElementRect } from "@/hooks/useElementRect";

const transformOriginMap = {
    top: "50% 0%",
    bottom: "50% 100%",
    left: "0% 50%",
    right: "100% 50%",
} as const;

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
    targetRect?: ElementRect;
    // sizeが設定されている場合は、SerifBoxの幅と高さをそれに合わせる。設定されていない場合は内容に合わせる
    drawingArea?: {
        width?: number;
        height?: number;
    };
    animationStartedAt: AnimationStartedAt;
    messageBox?: React.ReactNode;
};

// このコンポーネントは枠だけ準備して、jsxを子コンポーネントとして実装しています。
// そのため、子コンポーネントで起こったエラー用のmessageBoxをpropsで受け取るようにしています。
export default function SerifBox({
    children,
    setIsOpenModal,
    isOpen,
    disableClose = false,
    title,
    position,
    targetRect,
    drawingArea,
    animationStartedAt,
    messageBox,
}: Props) {
    const {
        boxRef,
        boxPosition,
        isDragging,
        isTailStored,
        tailPath,
        tailRevealRadius,
        maskId: tailMaskId,
        dragHandleProps,
    } = useSerifBox({
        anchor: { x: position.left, y: position.top },
        targetRect,
        animationStartedAt,
    });
    const transformOrigin = transformOriginMap[animationStartedAt];

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
                <defs>
                    <mask
                        id={tailMaskId}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                    >
                        <motion.circle
                            cx={tailPath?.attachment.x ?? 0}
                            cy={tailPath?.attachment.y ?? 0}
                            initial={false}
                            animate={{
                                r: isOpen && !isTailStored ? tailRevealRadius : 0,
                            }}
                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                            fill="white"
                        />
                    </mask>
                </defs>
                <g mask={`url(#${tailMaskId})`}>
                    <path d={tailPath?.fill ?? ""} fill="white" />
                    <path
                        d={tailPath?.outline ?? ""}
                        fill="none"
                        stroke="#E3E3E3"
                        strokeWidth="1"
                        strokeLinejoin="round"
                    />
                </g>
            </motion.svg>

            <motion.div
                ref={boxRef}
                className={`fixed z-20 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                style={{
                    top: boxPosition.y,
                    left: boxPosition.x,
                    transformOrigin,
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
                    style={{ transformOrigin }}
                    initial={{ filter: "blur(1px)" }}
                    animate={{
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
                            {...dragHandleProps}
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
                                    transformOrigin,
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
