import { AnimatePresence, motion } from "motion/react";

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
};

export default function SerifBox({ children, setIsOpenModal, isOpen, title, position, drawingArea }: props) {
    return (
        <motion.div
            className={`fixed z-50 flex -translate-x-full -translate-y-1/2 justify-center items-center ${isOpen ? "" : "pointer-events-none"}`}
            style={{ top: position.top, left: position.left }}
            initial={false}
            animate={{
                opacity: isOpen ? 1 : 0,
                y: isOpen ? 0 : 10,
            }}
            transition={{
                opacity: { duration: 0.16, ease: "easeOut" },
                y: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }}
        >
            <motion.div
                className="
                relative overflow-hidden rounded-2xl border border-(--color-dark) qendulum-shadow
            "
                style={{ transformOrigin: "100% 50%" }}
                initial={false}
                animate={{
                    scaleX: isOpen ? 1 : 0.08,
                    scaleY: isOpen ? 1 : 0.18,
                    x: isOpen ? 0 : 22,
                    skewY: isOpen ? 0 : -7,
                    filter: isOpen ? "blur(0px)" : "blur(1.5px)",
                }}
                transition={{
                    duration: isOpen ? 0.42 : 0.28,
                    ease: isOpen ? [0.16, 1, 0.3, 1] : [0.4, 0, 1, 1],
                }}
            >
                <div className="relative z-20 py-1.5 px-5 flex justify-between border-b border-(--color-dark) bg-white">
                    <div className="relative min-w-20 h-4.5">
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
                            style={{ width: drawingArea?.width, height: drawingArea?.height }}
                            className="overflow-hidden"
                            initial={false}
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
                style={{ transformOrigin: "100% 50%" }}
                initial={false}
                animate={{
                    scaleX: isOpen ? 1 : 0.14,
                    scaleY: isOpen ? 1 : 0.4,
                    x: isOpen ? 0 : 10,
                    opacity: isOpen ? 1 : 0,
                }}
                transition={{
                    duration: isOpen ? 0.34 : 0.22,
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
    );
}
