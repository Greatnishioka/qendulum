import { useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import SerifBox from "../parts/serifBox";
import TextInputBox from "../parts/textInputBox";

// types
import { type InputTextBoxProps, InputTextButtonProps } from "@/types/parts";

type props = {};

export default function SideVar({}: props) {
    const animationMs = 250;
    const [isOpenLoginModal, setIsOpenLoginModal] = useState<boolean>(false);
    const [isRenderedLoginModal, setIsRenderedLoginModal] = useState<boolean>(false);
    const [loginModalPosition, setLoginModalPosition] = useState({ top: 0, left: 0 });
    const loginButtonRef = useRef<HTMLButtonElement | null>(null);
    const form = useForm({
        email: "",
        password: "",
    });

    useEffect(() => {
        function updateLoginModalPosition() {
            if (!loginButtonRef.current) {
                return;
            }

            const rect = loginButtonRef.current.getBoundingClientRect();

            setLoginModalPosition({
                top: rect.top + rect.height / 2,
                left: rect.left - 16,
            });
        }

        updateLoginModalPosition();

        window.addEventListener("resize", updateLoginModalPosition);
        window.addEventListener("scroll", updateLoginModalPosition, true);

        return () => {
            window.removeEventListener("resize", updateLoginModalPosition);
            window.removeEventListener("scroll", updateLoginModalPosition, true);
        };
    }, []);

    useEffect(() => {
        if (isOpenLoginModal) {
            setIsRenderedLoginModal(true);
            return;
        }

        const timer = window.setTimeout(() => {
            setIsRenderedLoginModal(false);
        }, animationMs);

        return () => window.clearTimeout(timer);
    }, [isOpenLoginModal]);

    const InputTextBoxProps: InputTextBoxProps[] = [
        {
            value: form.data.email,
            placeholder: "user@example.com",
            type: "email",
            required: true,
            onChange: (value) => form.setData("email", value),
        },
        {
            value: form.data.password,
            placeholder: "password",
            type: "password",
            required: true,
            onChange: (value) => form.setData("password", value),
        },
    ];

    const InputTextButtonProps: InputTextButtonProps[] = [
        {
            label: "ログイン",
            onClick: () =>
                form.post("/login", {
                    preserveState: true,
                    replace: true,
                    onSuccess: () => {
                        console.log("login success");
                    },
                }),
            isSubmit: true,
        },
    ];

    return (
        <div className="flex-1 sticky border-l border-(--color-dark)">
            <div className="">
                <div className="p-4 bg-(--color-light)">
                    <div className="p-3 border-stripes border border-(--color-dark)">
                        <div className="px-3 py-12 bg-white border border-(--color-dark) min-h-56 flex flex-col items-center justify-center gap-9">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <h3 className="text-2xl font-bold text-[#BDBECA]">
                                    ログインしていません
                                </h3>
                                <p className="font-semibold text-[#90919C]">
                                    お気に入り登録・ブックマーク・コメントなどを行う場合はログインしてください。
                                </p>
                            </div>
                            <div className="relative mt-4 w-full">
                                <button
                                    ref={loginButtonRef}
                                    className="bg-(--color-turquoise) text-white py-4 px-4 rounded-full w-full"
                                    onClick={() => setIsOpenLoginModal(true)}
                                >
                                    ログイン
                                </button>
                                {isRenderedLoginModal ? (
                                    <div
                                        className={`${isOpenLoginModal ? "opacity-100" : "pointer-events-none opacity-0"}`}
                                    >
                                        <SerifBox
                                            setIsOpenModal={setIsOpenLoginModal}
                                            position={loginModalPosition}
                                            isOpen={isOpenLoginModal}
                                        >
                                            <TextInputBox
                                                inputList={InputTextBoxProps}
                                                buttonList={InputTextButtonProps}
                                            />
                                        </SerifBox>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
