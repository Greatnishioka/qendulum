import { useId, useState, type FormEvent } from "react";
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

function getDefaultButtonColors(index: number) {
    if (index === 0) {
        return {
            color: "var(--color-turquoise)",
            disabledColor: "#666666",
        };
    }

    if (index === 1) {
        return {
            color: "#E7B84A",
            disabledColor: "#8F8F8F",
        };
    }

    if (index === 2) {
        return {
            color: "#DC3131",
            disabledColor: "#C1C1C1",
        };
    }

    return {
        color: "var(--color-turquoise)",
        disabledColor: "#666666",
    };
}

// アイコンの種類を定義。別ファイルで型定義としても使用するので、配列としてもエクスポートする
export const iconTypes = ["search", "clear", "swap"] as const;

// アイコンをアイコン名で引けるように
function renderIcon(icon: typeof iconTypes[number]): React.ReactNode {
    if (!iconTypes.includes(icon as typeof iconTypes[number])) return (<></>);

    switch (icon) {
        case iconTypes[0]: // "search"
            return (<IoSearch />);
        case iconTypes[1]: // "clear"
            return (<RxCross2 />);
        case iconTypes[2]: // "swap"
            return (<LiaExchangeAltSolid className="rotate-90" />);
        default:
            return <></>;
    }
}

export default function TextInputBox({ inputList, buttonList }: props) {
    const baseId = useId();
    const [fallbackValues, setFallbackValues] = useState<string[]>(() =>
        inputList.map((input) => input.value ?? ""),
    );

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

    return (
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
                {/* todo: この実装はきしょいので要修正 */}
                <div className="flex p-1">
                    {buttonList.map((button, index) => {
                        const isFirstButton = index === 0;
                        const hasLeadingOverlap = index > 0;
                        const defaultColors = getDefaultButtonColors(index);
                        const backgroundColor = button.disabled
                            ? (button.disabledColor ?? defaultColors.disabledColor)
                            : (button.color ?? defaultColors.color);

                        return (
                            <button
                                key={`${button.label}-${index}`}
                                onClick={
                                    button.isSubmit ? undefined : () => handleButtonClick(button)
                                }
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
                                    {isIncludeType(button.icon, iconTypes) ? renderIcon(button.icon) : button.icon}

                                    {button.hoverMassege && (
                                        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            {button.hoverMassege}
                                        </span>
                                    )}

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
    );
}
