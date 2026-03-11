import { useForm } from "@inertiajs/react";
import type { FormEvent } from "react";

type props = {
    query?: string;
};

export default function Header({ query = "" }: props) {

    const form = useForm({
        query,
    });
    
    const buttonDisabled = form.processing || form.data.query.trim() === "";

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.get("/search", {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <header className="fixed w-full bg-[repeating-linear-gradient(45deg,#E3E3E3_0px,#E3E3E3_1px,#FFFFFF_1px,#FFFFFE_4px)] px-20">
            <div className="rounded-b-full border border-(--color-dark) bg-(--color-light) pt-4 pb-3 h-full flex items-center justify-center">
                <div className="rounded-full border border-[#9B9B9B] bg-white p-1 max-w-3xl w-full">
                    <label htmlFor="query" className="sr-only">

                    </label>
                    <form className="flex gap-3" onSubmit={submit}>
                        <input
                            id="query"
                            type="text"
                            value={form.data.query}
                            onChange={(event) => form.setData("query", event.target.value)}
                            className="w-full rounded-l-full px-4 py-2 outline-none"
                            placeholder="searching ...."
                        />
                        <div className="flex">
                            <button
                                type="submit"
                                disabled={buttonDisabled}
                                className="group rounded-r-full bg-(--color-turquoise) pr-4 py-2 text-white disabled:bg-[#666666] transition-colors duration-200 relative z-40"
                            >
                                <div className="overflow-hidden h-full aspect-square absolute -translate-x-full top-0">
                                    <span className=" inset-0 h-[200%] aspect-square rounded-full bg-(--color-turquoise) group-disabled:bg-[#666666] transition-colors duration-200 block"></span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="mr-1" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.0667 12L6.86667 7.8C6.53333 8.06667 6.15 8.27778 5.71667 8.43333C5.28333 8.58889 4.82222 8.66667 4.33333 8.66667C3.12222 8.66667 2.09722 8.24722 1.25833 7.40833C0.419445 6.56944 0 5.54444 0 4.33333C0 3.12222 0.419445 2.09722 1.25833 1.25833C2.09722 0.419445 3.12222 0 4.33333 0C5.54444 0 6.56944 0.419445 7.40833 1.25833C8.24722 2.09722 8.66667 3.12222 8.66667 4.33333C8.66667 4.82222 8.58889 5.28333 8.43333 5.71667C8.27778 6.15 8.06667 6.53333 7.8 6.86667L12 11.0667L11.0667 12ZM4.33333 7.33333C5.16667 7.33333 5.875 7.04167 6.45833 6.45833C7.04167 5.875 7.33333 5.16667 7.33333 4.33333C7.33333 3.5 7.04167 2.79167 6.45833 2.20833C5.875 1.625 5.16667 1.33333 4.33333 1.33333C3.5 1.33333 2.79167 1.625 2.20833 2.20833C1.625 2.79167 1.33333 3.5 1.33333 4.33333C1.33333 5.16667 1.625 5.875 2.20833 6.45833C2.79167 7.04167 3.5 7.33333 4.33333 7.33333Z" fill="white" />
                                    </svg>
                                    <p className="text-[14px] mr-2">
                                        Search
                                    </p>
                                    <span className="whitespace-nowrap text-[10px]">
                                        検索
                                    </span>
                                </div>
                            </button>
                            {/* あいまい検索はまだまだ実装先そう */}
                            {/* あいまい検索は自前で育てたAIを使用した多言語 & あいまい検索 */}
                            <button
                                type="submit"
                                disabled={buttonDisabled}
                                className="group relative rounded-r-full bg-[#E7B84A] pl-6 pr-4 py-2 text-white disabled:bg-[#8F8F8F] transition-colors duration-200 z-30"
                            >
                                <div className="pointer-events-none absolute left-0 top-0 h-full aspect-square -translate-x-1/2 overflow-hidden">
                                    <span className="block h-full aspect-square bg-[#E7B84A] group-disabled:bg-[#8F8F8F] transition-colors duration-200"></span>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-[14px] mr-2 whitespace-nowrap">
                                        Fuzzy search
                                    </p>
                                    <span className="whitespace-nowrap text-[10px]">
                                        あいまい検索
                                    </span>
                                </div>
                            </button>
                            <button
                                onClick={() => form.setData("query", "")}
                                type="button"
                                disabled={buttonDisabled}
                                className="group relative rounded-r-full bg-[#DC3131] pl-6 pr-4 py-2 text-white disabled:bg-[#C1C1C1] transition-colors duration-200 z-20"
                            >
                                <div className="pointer-events-none absolute left-0 top-0 h-full aspect-square -translate-x-1/2 overflow-hidden">
                                    <span className="block h-full aspect-square bg-[#DC3131] group-disabled:bg-[#C1C1C1] transition-colors duration-200"></span>
                                </div>
                                <div className="flex items-center">
                                    <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.1924 0.707031L5.80273 5.0957L9.89941 9.19238L9.19238 9.89941L5.0957 5.80273L1 9.89941L0.292969 9.19238L4.38867 5.0957L0 0.707031L0.707031 0L5.0957 4.38867L9.48535 0L10.1924 0.707031Z" fill="white" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
}
