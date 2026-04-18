import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type FocusEvent,
    type FormEvent,
    type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { IoSearch } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { isIncludeType } from "@/util/typeGuards";

// types
import type { InputTextBoxProps, InputTextButtonProps } from "@/types/parts";

type props = {
    inputList: InputTextBoxProps[];
    buttonList: InputTextButtonProps[];
};

type ActiveTooltip = {
    anchorEl: HTMLButtonElement;
    message: string;
};

// アイコンの種類を定義。別ファイルで型定義としても使用するので、配列としてもエクスポートする
export const iconTypes = ["search", "clear", "swap"] as const;

const defaultButtonColors = [
    {
        color: "var(--color-turquoise)",
        disabledColor: "#666666",
    },
    {
        color: "#E7B84A",
        disabledColor: "#8F8F8F",
    },
    {
        color: "#DC3131",
        disabledColor: "#C1C1C1",
    },
] as const;

const iconMap = {
    search: <IoSearch />,
    clear: <RxCross2 />,
    swap: <LiaExchangeAltSolid className="rotate-90" />,
} satisfies Record<typeof iconTypes[number], React.ReactNode>;

function TooltipPortal({ anchorEl, message }: ActiveTooltip) {
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{
        top: number;
        left: number;
        visible: boolean;
        placement: "top" | "bottom"; // Extractした型にすることも考えたが、文脈的にあちらと共有していないので、これで
    }>({
        top: 0,
        left: 0,
        visible: false,
        placement: "top",
    });

    useLayoutEffect(() => {
        function updatePosition() {
            const tooltipEl: HTMLDivElement | null = tooltipRef.current;

            if (tooltipEl === null) {
                return;
            }

            const anchorRect: DOMRect = anchorEl.getBoundingClientRect();
            const tooltipRect: DOMRect = tooltipEl.getBoundingClientRect();
            const gap: number = 8;
            const viewportPadding: number = 8;
            const canShowAbove: boolean = anchorRect.top >= tooltipRect.height + gap + viewportPadding;
            const canShowBelow: boolean =
                window.innerHeight - anchorRect.bottom >= tooltipRect.height + gap + viewportPadding;
            const placement: "top" | "bottom" = canShowAbove ? "top" : "bottom";
            const rawTop: number = placement === "top"
                ? anchorRect.top - tooltipRect.height - gap
                : anchorRect.bottom + gap;
            const top: number = canShowAbove || canShowBelow
                ? rawTop
                : Math.min(
                    Math.max(rawTop, viewportPadding),
                    window.innerHeight - tooltipRect.height - viewportPadding,
                );
            const minLeft: number = viewportPadding;
            const maxLeft: number = window.innerWidth - tooltipRect.width - viewportPadding;
            const centeredLeft: number = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;
            const left: number = Math.min(Math.max(centeredLeft, minLeft), Math.max(minLeft, maxLeft));

            setPosition({
                top,
                left,
                visible: true,
                placement,
            });
        }

        updatePosition();

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [anchorEl, message]);

    if (typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            ref={tooltipRef}
            style={{
                top: position.top,
                left: position.left,
                visibility: position.visible ? "visible" : "hidden",
            }}
            className={`pointer-events-none fixed z-9999 flex items-center ${position.placement === "top" ? "flex-col-reverse" : "flex-col"}`}
        >
            <span
                className={`block h-1.5 w-2 bg-(--color-dark-bg) ${position.placement === "top"
                    ? "[clip-path:polygon(50%_100%,0%_0%,100%_0%)]"
                    : "[clip-path:polygon(50%_0%,0%_100%,100%_100%)]"
                    }`}
            ></span>
            <span className="rounded bg-(--color-dark-bg) px-2 py-1 text-xs whitespace-nowrap text-white shadow-md">
                {message}
            </span>
        </div>,
        document.body,
    );
}

export default function TextInputBox({ inputList, buttonList }: props) {
    const baseId = useId();
    const [fallbackValues, setFallbackValues] = useState<string[]>(() =>
        inputList.map((input) => input.value ?? ""),
    );
    const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);

    const submitButton = buttonList.find((button) => button.isSubmit);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!submitButton?.disabled) {
            submitButton?.onClick();
        }
    }

    function handleInputChange(index: number, value: string) {
        setFallbackValues((current) =>
            current.map((item, itemIndex) => {
                if (itemIndex === index) {
                    return value;
                }

                return item;
            }),
        );

        inputList[index]?.onChange?.(value);
    }

    function handleButtonClick(button: InputTextButtonProps) {
        if (button.disabled) {
            return;
        }

        button.onClick();

        if (button.isSubmit) {
            return;
        }

        setFallbackValues((current) => current.map(() => ""));
        inputList.forEach((input) => input.onChange?.(""));
    }

    function openTooltip(
        event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
        message?: string,
    ) {
        if (message === undefined || message.trim() === "") {
            return;
        }

        setActiveTooltip({
            anchorEl: event.currentTarget,
            message,
        });
    }

    function closeTooltip() {
        setActiveTooltip(null);
    }

    useEffect(() => {
        if (activeTooltip === null) {
            return;
        }

        if (!document.body.contains(activeTooltip.anchorEl)) {
            setActiveTooltip(null);
        }
    }, [activeTooltip]);

    return (
        <>
            <div className="rounded-full border border-[#9B9B9B] bg-white max-w-3xl w-full">
                <form className="flex gap-3" onSubmit={handleSubmit}>
                    <div className="flex w-full">
                        {/* 配列を元に入力欄を生成 */}
                        {inputList.map((input, index) => {
                            const inputId = `${baseId}-input-${index}`;
                            const value = input.value ?? fallbackValues[index] ?? "";
                            const isFirst = index === 0;
                            const isLast = index === inputList.length - 1;

                            return (
                                <div
                                    className={`flex-1 ${!isFirst ? "border-l border-[#D0D0D0]" : ""}`}
                                    key={inputId}
                                >
                                    <label htmlFor={inputId} className="sr-only">
                                        {input.placeholder ?? `input-${index + 1}`}
                                    </label>
                                    <input
                                        id={inputId}
                                        type={input.type}
                                        required={input.required}
                                        value={value}
                                        onChange={(event) =>
                                            handleInputChange(index, event.target.value)
                                        }
                                        className={`w-full px-4 py-2 outline-none min-w-52 h-full ${isFirst ? "rounded-l-full" : ""} ${isLast && buttonList.length === 0 ? "rounded-r-full" : ""}`}
                                        placeholder={input.placeholder}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex p-1">
                        {buttonList.map((button, index) => {
                            const isFirstButton = index === 0;
                            const hasLeadingOverlap = index > 0;
                            const defaultColors = defaultButtonColors[index] ?? defaultButtonColors[0];
                            const backgroundColor = button.disabled
                                ? (button.disabledColor ?? defaultColors.disabledColor)
                                : (button.color ?? defaultColors.color);

                            return (
                                <button
                                    key={`${button.label}-${index}`}
                                    onClick={
                                        button.isSubmit ? undefined : () => handleButtonClick(button)
                                    }
                                    onMouseEnter={(event) => openTooltip(event, button.hoverMessage)}
                                    onMouseLeave={closeTooltip}
                                    onFocus={(event) => openTooltip(event, button.hoverMessage)}
                                    onBlur={closeTooltip}
                                    type={button.isSubmit ? "submit" : "button"}
                                    disabled={button.disabled}
                                    style={{ backgroundColor, zIndex: buttonList.length - index }}
                                    className={[
                                        "group relative py-2 pr-4 text-white transition-colors duration-200",
                                        "rounded-r-full",
                                        hasLeadingOverlap ? "pl-6" : "",
                                    ].join(" ")}
                                >
                                    {isFirstButton ? (
                                        <div className="overflow-hidden h-full aspect-square absolute -translate-x-full top-0">
                                            <span
                                                style={{ backgroundColor }}
                                                className="inset-0 h-[200%] aspect-square rounded-full transition-colors duration-200 block"
                                            ></span>
                                        </div>
                                    ) : null}
                                    {hasLeadingOverlap ? (
                                        <div className="pointer-events-none absolute left-0 top-0 h-full aspect-square -translate-x-1/2 overflow-hidden">
                                            <span
                                                style={{ backgroundColor }}
                                                className="block h-full aspect-square transition-colors duration-200"
                                            ></span>
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-1 relative">
                                        {isIncludeType(button.icon, iconTypes) ? iconMap[button.icon] : button.icon}

                                        {button.label && (
                                            <p className="mr-2 whitespace-nowrap text-[14px]">
                                                {button.label}
                                            </p>
                                        )}
                                        {button.sabLabel && (
                                            <span className="whitespace-nowrap text-[10px]">{button.sabLabel}</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </form>
            </div>
            {activeTooltip !== null ? <TooltipPortal {...activeTooltip} /> : null}
        </>
    );
}
