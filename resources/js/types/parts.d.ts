export type InputTextBoxProps = {
    value?: string;
    placeholder?: string;
    type: "email" | "password" | "text";
    required?: boolean;
    onChange?: (value: string) => void;
};

export type InputTextButtonProps = {
    label: string;
    onClick: () => void;
    isSubmit: boolean;
    disabled?: boolean;
};
