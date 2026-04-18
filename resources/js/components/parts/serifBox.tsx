import { AnimatePresence, motion } from "motion/react";

type animationStartedAt = "top" | "bottom" | "left" | "right";

const transformOriginMap: Record<animationStartedAt, string> = {
    top: "50% 0%",
    bottom: "50% 100%",
    left: "0% 50%",
    right: "100% 50%",
};

type props = {
    children: React.ReactNode;
    setIsOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
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
    animationStartedAt: animationStartedAt;
};

export default function SerifBox({ children, setIsOpenModal, isOpen, title, position, drawingArea, animationStartedAt }: props) {

    return (
        <div
            className={`fixed z-50 ${isOpen ? "" : "pointer-events-none"}`}
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex -translate-x-full -translate-y-1/2 justify-center items-center">
                <motion.div
                    className={`flex justify-center items-center ${animationStartedAt === "left" && "flex-row-reverse"}`}
                    style={{ transformOrigin: transformOriginMap[animationStartedAt] }}
                    initial={{
                        opacity: 0,
                        y: 0,
                        scale: 0.001,
                    }}
                    animate={{
                        opacity: isOpen ? 1 : 0,
                        y: 0,
                        scale: isOpen ? [0.08, 1.02, 1] : 0.001,
                    }}
                    transition={{
                        opacity: { duration: 0.18, ease: "easeOut" },
                        scale: {
                            duration: 0.45,
                            times: [0, 0.5, 1],
                            ease: [0.16, 1, 0.3, 1]
                        },
                    }}
                >
                    <motion.div
                        className="
                        relative overflow-hidden rounded-2xl border border-(--color-dark) qendulum-shadow
                    "
                        style={{ transformOrigin: transformOriginMap[animationStartedAt] }}
                        initial={{
                            x: 8,
                            filter: "blur(1px)",
                        }}
                        animate={{
                            x: isOpen ? 0 : 8,
                            filter: isOpen ? "blur(0px)" : "blur(1px)",
                        }}
                        transition={{
                            duration: 0.44,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                    >
                        <div className="relative z-20 py-1.5 px-5 flex justify-between border-b border-(--color-dark) bg-white">
                            <div className="relative min-w-20 h-4.5">

                                {/* コンポーネント内のタイトル */}
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
                            <button type="button" onClick={() => setIsOpenModal(false)} className="">
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
                                    style={{ width: drawingArea?.width, height: drawingArea?.height, ...{ transformOrigin: transformOriginMap[animationStartedAt] } }}
                                    className={`overflow-hidden ${animationStartedAt === "left" && "rotate-180"}`}
                                    initial={{ opacity: 0.45 }}
                                    animate={{ opacity: isOpen ? 1 : 0.45 }}
                                    transition={{ duration: isOpen ? 0.2 : 0.12, ease: "easeOut" }}
                                >
                                    {children}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.svg
                        className="relative z-20 -left-0.5"
                        width="29"
                        height="14"
                        viewBox="0 0 29 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transformOrigin: transformOriginMap[animationStartedAt] }}
                        initial={{
                            scale: 0.08,
                            x: 2,
                            opacity: 0,
                        }}
                        animate={{
                            scale: isOpen ? 1 : 0.08,
                            x: isOpen ? 0 : 2,
                            opacity: isOpen ? 1 : 0,
                        }}
                        transition={{
                            duration: isOpen ? 0.42 : 0.24,
                            ease: isOpen ? [0.16, 1, 0.3, 1] : [0.4, 0, 1, 1],
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
                    </motion.svg>
                </motion.div>
            </div>
        </div>
    );
}
