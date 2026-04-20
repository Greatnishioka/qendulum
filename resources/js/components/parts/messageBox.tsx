import { motion } from "motion/react";
import { useEffect, useState } from "react";

type props = {
    messageType: "error" | "success" | "info";
    message: string;
    className?: string;
};

type MessageBoxTheme = {
    bg: string;
    border: string;
    text: string;
    fill: string;
    lightFill: string;
};

const backgroundColorMap: Record<props["messageType"], MessageBoxTheme> = {
    error: {
        bg: "bg-(--color-error-light)",
        border: "border-(--color-error)",
        text: "text-(--color-error)",
        fill: "fill-(--color-error)",
        lightFill: "fill-(--color-error-light)",
    },
    success: {
        bg: "bg-(--color-success-light)",
        border: "border-(--color-success)",
        text: "text-(--color-success)",
        fill: "fill-(--color-success)",
        lightFill: "fill-(--color-success-light)",
    },
    info: {
        bg: "bg-(--color-info-light)",
        border: "border-(--color-info)",
        text: "text-(--color-info)",
        fill: "fill-(--color-info)",
        lightFill: "fill-(--color-info-light)",
    },
};

export default function MessageBox({ messageType, message, className }: props) {
    const theme = backgroundColorMap[messageType];
    const [isVisible, setIsVisible] = useState(true);
    const [isRendered, setIsRendered] = useState(true);

    useEffect(() => {
        setIsVisible(true);
        setIsRendered(true);

        const fadeTimer = window.setTimeout(() => {
            setIsVisible(false);
        }, 5000);
        const removeTimer = window.setTimeout(() => {
            setIsRendered(false);
        }, 5480);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(removeTimer);
        };
    }, [message, messageType]);

    if (!isRendered) {
        return null;
    }

    return (
        <motion.div
            style={{ transformOrigin: "50% 100%" }}
            initial={{ opacity: 0, scale: 0.001 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? [0.08, 1.02, 1] : [1, 1.02, 0.001],
            }}
            transition={{
                opacity: isVisible
                    ? { duration: 0.18, ease: "easeOut" }
                    : { duration: 0.16, delay: 0.26, ease: "easeOut" },
                scale: {
                    duration: isVisible ? 0.45 : 0.42,
                    times: [0, 0.5, 1],
                    ease: isVisible ? [0.16, 1, 0.3, 1] : [0.4, 0, 1, 1],
                },
            }}
            className={`flex flex-col items-center justify-center ${className ?? ""}`}
        >
            <motion.div
                initial={{ y: 8, filter: "blur(1px)" }}
                animate={{
                    y: isVisible ? 0 : 8,
                    filter: isVisible ? "blur(0px)" : "blur(1px)",
                }}
                transition={{
                    duration: isVisible ? 0.44 : 0.26,
                    ease: isVisible ? [0.16, 1, 0.3, 1] : [0.4, 0, 1, 1],
                }}
                className={`px-4 border-stripes-${messageType} border ${theme.border} ${theme.bg} rounded-md`}
            >
                <div className={`min-w-75 ${theme.bg} border-x ${theme.border} px-4 py-2`}>
                    <p className={`text-xs ${theme.text} font-semibold text-center`}>
                        {message}
                    </p>
                </div>
            </motion.div>
            <motion.svg
                className="relative -top-0.5"
                width="21"
                height="17"
                viewBox="0 0 21 17"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transformOrigin: "50% 0%" }}
                initial={{ scale: 0.08, y: -2, opacity: 0 }}
                animate={{
                    scale: isVisible ? 1 : 0.08,
                    y: isVisible ? 0 : -2,
                    opacity: isVisible ? 1 : 0,
                }}
                transition={{
                    duration: isVisible ? 0.42 : 0.24,
                    ease: isVisible ? [0.16, 1, 0.3, 1] : [0.4, 0, 1, 1],
                }}
            >
                <path className={theme.lightFill} d="M0 0L9.52628 16.5C9.91118 17.1667 10.8734 17.1667 11.2583 16.5L20.7846 0H0Z" />
                <path className={theme.fill} d="M0.577148 1L9.52567 16.5C9.91057 17.1667 10.8732 17.1667 11.2581 16.5L20.2066 1H19.0525L10.3919 16L1.73127 1H0.577148Z" />
            </motion.svg>
        </motion.div>
    );
}
