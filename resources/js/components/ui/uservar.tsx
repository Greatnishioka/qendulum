import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { FiLogIn } from "react-icons/fi";

import SerifBox from "../parts/serifBox";
import TextInputBox from "../parts/textInputBox";
import MessageBox from "../parts/messageBox";

type PageProps = {
    auth: {
        user: {
            public_uuid: string | null;
        } | null;
    };
};

// types
import { type InputTextBoxProps, InputTextButtonProps } from "@/types/parts";

export default function UserVar() {

    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // ログインしている場合はユーザー情報を表示するUIを出す
    if (user && user.public_uuid) {

        return (
            <div className="sticky top-19.5 flex-1 self-start border-l border-(--color-dark)">
                <div className="p-4 bg-(--color-light)">
                    <div className="p-3 border-stripes border border-(--color-dark)">
                        <div className="px-3 py-12 bg-white border border-(--color-dark)">
                            <h3>ログイン中</h3>
                            <p>{user.public_uuid}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const animationMs = 250;
    const swipeAnimation = {
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
    } as const;
    const formSwipeVariants = {
        initial: (isRegisterForm: boolean) => ({
            opacity: 0,
            y: isRegisterForm ? "-24%" : "24%",
        }),
        animate: {
            opacity: 1,
            y: "0%",
        },
        exit: (isRegisterForm: boolean) => ({
            opacity: 0,
            y: isRegisterForm ? "24%" : "-24%",
        }),
    };
    const [isOpenLoginModal, setIsOpenLoginModal] = useState<boolean>(false);
    const [isRenderedLoginModal, setIsRenderedLoginModal] = useState<boolean>(false);
    const [isRegisterForm, setIsRegisterForm] = useState<boolean>(false);
    const [loginModalPosition, setLoginModalPosition] = useState({ top: 0, left: 0 });
    const loginButtonRef = useRef<HTMLButtonElement | null>(null);
    const innerContainerRef = useRef<HTMLDivElement | null>(null);
    const form = useForm({
        email: "",
        password: "",
    });
    const loginErrorMessage = typeof form.errors.email === "string" ? form.errors.email : null;

    useEffect(() => {
        function updateLoginModalPosition() {
            if (!loginButtonRef.current) {
                return;
            }

            const rect = loginButtonRef.current.getBoundingClientRect();

            setLoginModalPosition({
                top: rect.top + rect.height / 2,
                // SerifBoxの尻尾をボタン左端の中央へ接続する
                left: rect.left,
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

    const LoginTextBoxProps: InputTextBoxProps[] = [
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

    const toggleForm = () => {
        setIsRegisterForm((prev) => !prev);
    };

    const LoginTextButtonProps: InputTextButtonProps[] = [
        {
            label: "ログイン",
            sabLabel: null,
            onClick: () => {
                form.clearErrors("email");

                form.post("/login", {
                    preserveState: true,
                    replace: true,
                    onSuccess: () => {
                        setIsOpenLoginModal(false);
                        form.reset("password");
                        form.clearErrors();
                    },
                    onError: (errors) => {
                        console.log("login error", errors);
                    },
                });
            },
            hoverMessage: "Login",
            isSubmit: true,
            disabled: form.processing,
            icon: <FiLogIn />,
        },
        {
            label: null,
            sabLabel: null,
            onClick: toggleForm,
            hoverMessage: "新規登録に切り替え",
            isSubmit: false,
            disabled: form.processing,
            icon: "swap",
        },
    ];

    const RegisterTextBoxProps: InputTextBoxProps[] = [
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

    const RegisterTextButtonProps: InputTextButtonProps[] = [
        {
            label: "新規登録",
            sabLabel: null,
            onClick: () =>
                form.post("/register", {
                    preserveState: true,
                    replace: true,
                    onSuccess: () => {
                        console.log("register success");
                    },
                }),
            hoverMessage: "Register",
            color: "#E47C48",
            isSubmit: true,
            icon: <FiLogIn />,
        },
        {
            label: null,
            sabLabel: null,
            onClick: toggleForm,
            hoverMessage: "ログインに切り替え",
            isSubmit: false,
            icon: "swap",
        },
    ];
    const currentForm =
        !isRegisterForm
            ? {
                key: "login",
                inputList: LoginTextBoxProps,
                buttonList: LoginTextButtonProps,
            }
            : {
                key: "register",
                inputList: RegisterTextBoxProps,
                buttonList: RegisterTextButtonProps,
            };

    return (
        <div className="sticky top-19.5 flex-1 self-start border-l border-(--color-dark)">
            <div className="p-4 bg-(--color-light)">
                <div className="p-3 border-stripes border border-(--color-dark)">
                    <div className="px-3 py-12 bg-white border border-(--color-dark) min-h-56 flex flex-col items-center justify-center gap-9">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <h3 className="text-2xl font-bold text-[#BDBECA]">
                                ログインしていません
                            </h3>
                            <p className="font-semibold text-[#90919C] text-sm">
                                お気に入り登録・ブックマーク・コメントなどを行う場合はログインしてください。
                            </p>
                        </div>
                        <div className="relative mt-4 w-full">
                            <button
                                ref={loginButtonRef}
                                className="bg-(--color-turquoise) text-white py-4 px-4 rounded-full w-full"
                                onClick={() => {
                                    form.clearErrors();
                                    setIsOpenLoginModal(true);
                                }}
                            >
                                ログイン
                            </button>
                            {isRenderedLoginModal ? (
                                <div className={isOpenLoginModal ? "" : "pointer-events-none"}>
                                    <SerifBox
                                        setIsOpenModal={setIsOpenLoginModal}
                                        position={loginModalPosition}
                                        isOpen={isOpenLoginModal}
                                        disableClose={form.processing}
                                        title={isRegisterForm ? "Register" : "Login"}
                                        animationStartedAt="right"
                                        messageBox={
                                            loginErrorMessage ? (
                                                <MessageBox
                                                    messageType="error"
                                                    message={loginErrorMessage}
                                                />
                                            ) : null
                                        }
                                    >
                                        <div ref={innerContainerRef} className="relative">
                                            <AnimatePresence
                                                custom={isRegisterForm}
                                                initial={false}
                                                mode="wait"
                                            >
                                                <motion.div
                                                    key={currentForm.key}
                                                    custom={isRegisterForm}
                                                    variants={formSwipeVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                    transition={{
                                                        opacity: { duration: 0.18 },
                                                        y: swipeAnimation,
                                                    }}
                                                    className="w-full"
                                                >
                                                    <TextInputBox
                                                        inputList={currentForm.inputList}
                                                        buttonList={currentForm.buttonList}
                                                    />
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </SerifBox>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
