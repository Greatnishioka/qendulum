import { iconTypes } from "@/components/parts/textInputBox";

export type InputTextBoxProps = {
    value?: string;
    placeholder?: string;
    type: "email" | "password" | "text";
    required?: boolean;
    onChange?: (value: string) => void;
};

export type InputTextButtonProps = {
    label: string | null;
    sabLabel: string | null;
    onClick: () => void;
    isSubmit: boolean;
    disabled?: boolean;
    // SVGやImageコンポーネントによるアイコン + アイコンタイプ
    icon: React.ReactNode | typeof iconTypes[number];
};
