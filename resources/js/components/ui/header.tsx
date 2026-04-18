import { useForm } from "@inertiajs/react";

// components
import TextInputBox from "@/components/parts/textInputBox";

// types
import { type InputTextBoxProps, InputTextButtonProps } from "@/types/parts";

type props = {
    query?: string;
};

export default function Header({ query = "" }: props) {
    const form = useForm({
        query,
    });

    const buttonDisabled = form.processing || form.data.query.trim() === "";
    const InputTextBoxProps: InputTextBoxProps[] = [
        {
            value: form.data.query,
            placeholder: "searching ....",
            type: "text",
            required: true,
            onChange: (value) => form.setData("query", value),
        },
    ];

    const buttonList: InputTextButtonProps[] = [
        {
            label: "Search",
            sabLabel: "検索",
            onClick: () =>
                form.get("/search", {
                    preserveState: true,
                    replace: true,
                }),
            isSubmit: true,
            hoverMessage: "Enter",
            disabled: buttonDisabled,
            icon: "search"
        },
        {
            label: "Fuzzy search",
            sabLabel: "あいまい検索",
            onClick: () =>
                form.get("/search", {
                    preserveState: true,
                    replace: true,
                }),
            isSubmit: true,
            hoverMessage: "Ctrl + Enter",
            disabled: buttonDisabled,
            icon: ""
        },
        {
            label: null,
            sabLabel: null,
            onClick: () => form.setData("query", ""),
            isSubmit: false,
            hoverMessage: "Ctrl + Backspace",
            disabled: buttonDisabled,
            icon: "clear"
        },
    ];

    return (
        <header className="sticky top-0 w-full border-b border-(--color-dark) border-stripes px-20">
            <div className="rounded-b-full border border-(--color-dark) bg-(--color-light) pt-4 pb-3 h-full flex items-center justify-center">
                <TextInputBox inputList={InputTextBoxProps} buttonList={buttonList} />
            </div>
        </header>
    );
}
