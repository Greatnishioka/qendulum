import { useId, useState, type FormEvent } from "react";

// types
import type { InputTextBoxProps, InputTextButtonProps } from "@/types/parts";

type props = {
    inputList: InputTextBoxProps[];
    buttonList: InputTextButtonProps[];
};

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
                        const isSearchButton = index === 0;
                        const isFuzzyButton = index === 1;
                        const isClearButton = index === 2;

                        return (
                            <button
                                key={`${button.label}-${index}`}
                                onClick={
                                    button.isSubmit ? undefined : () => handleButtonClick(button)
                                }
                                type={button.isSubmit ? "submit" : "button"}
                                disabled={button.disabled}
                                className={[
                                    "group relative py-2 pr-4 text-white transition-colors duration-200",
                                    isSearchButton
                                        ? "z-40 rounded-r-full bg-(--color-turquoise) disabled:bg-[#666666]"
                                        : "",
                                    isFuzzyButton
                                        ? "z-30 rounded-r-full bg-[#E7B84A] pl-6 disabled:bg-[#8F8F8F]"
                                        : "",
                                    isClearButton
                                        ? "z-20 rounded-r-full bg-[#DC3131] pl-6 disabled:bg-[#C1C1C1]"
                                        : "",
                                ].join(" ")}
                            >
                                {isSearchButton ? (
                                    <div className="overflow-hidden h-full aspect-square absolute -translate-x-full top-0">
                                        <span className=" inset-0 h-[200%] aspect-square rounded-full bg-(--color-turquoise) group-disabled:bg-[#666666] transition-colors duration-200 block"></span>
                                    </div>
                                ) : null}
                                {isFuzzyButton || isClearButton ? (
                                    <div className="pointer-events-none absolute left-0 top-0 h-full aspect-square -translate-x-1/2 overflow-hidden">
                                        <span
                                            className={`block h-full aspect-square transition-colors duration-200 ${isFuzzyButton ? "bg-[#E7B84A] group-disabled:bg-[#8F8F8F]" : "bg-[#DC3131] group-disabled:bg-[#C1C1C1]"}`}
                                        ></span>
                                    </div>
                                ) : null}
                                <div className="flex items-center">
                                    {isSearchButton ? (
                                        <svg
                                            className="mr-1"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M11.0667 12L6.86667 7.8C6.53333 8.06667 6.15 8.27778 5.71667 8.43333C5.28333 8.58889 4.82222 8.66667 4.33333 8.66667C3.12222 8.66667 2.09722 8.24722 1.25833 7.40833C0.419445 6.56944 0 5.54444 0 4.33333C0 3.12222 0.419445 2.09722 1.25833 1.25833C2.09722 0.419445 3.12222 0 4.33333 0C5.54444 0 6.56944 0.419445 7.40833 1.25833C8.24722 2.09722 8.66667 3.12222 8.66667 4.33333C8.66667 4.82222 8.58889 5.28333 8.43333 5.71667C8.27778 6.15 8.06667 6.53333 7.8 6.86667L12 11.0667L11.0667 12ZM4.33333 7.33333C5.16667 7.33333 5.875 7.04167 6.45833 6.45833C7.04167 5.875 7.33333 5.16667 7.33333 4.33333C7.33333 3.5 7.04167 2.79167 6.45833 2.20833C5.875 1.625 5.16667 1.33333 4.33333 1.33333C3.5 1.33333 2.79167 1.625 2.20833 2.20833C1.625 2.79167 1.33333 3.5 1.33333 4.33333C1.33333 5.16667 1.625 5.875 2.20833 6.45833C2.79167 7.04167 3.5 7.33333 4.33333 7.33333Z"
                                                fill="white"
                                            />
                                        </svg>
                                    ) : null}
                                    <p
                                        className={`text-[14px] ${isClearButton ? "" : "mr-2"} whitespace-nowrap`}
                                    >
                                        {button.label}
                                    </p>
                                    {isSearchButton ? (
                                        <span className="whitespace-nowrap text-[10px]">検索</span>
                                    ) : null}
                                    {isFuzzyButton ? (
                                        <span className="whitespace-nowrap text-[10px]">
                                            あいまい検索
                                        </span>
                                    ) : null}
                                    {isClearButton ? (
                                        <svg
                                            width="11"
                                            height="10"
                                            viewBox="0 0 11 10"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10.1924 0.707031L5.80273 5.0957L9.89941 9.19238L9.19238 9.89941L5.0957 5.80273L1 9.89941L0.292969 9.19238L4.38867 5.0957L0 0.707031L0.707031 0L5.0957 4.38867L9.48535 0L10.1924 0.707031Z"
                                                fill="white"
                                            />
                                        </svg>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </form>
        </div>
    );
}
