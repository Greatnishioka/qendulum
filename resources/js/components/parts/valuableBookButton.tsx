import { router, usePage } from "@inertiajs/react";
import type { ArxivFeed } from "@/types/arxivArticlestype";

type props = {
    entry: ArxivFeed["entries"][number];
    count: number;
};

export default function ValuableBookButton({ entry, count }: props) {
    const { auth } = usePage<{
        auth: {
            user: {
                public_uuid: string | null;
            } | null;
        };
    }>().props;

    function handleFavorite() {
        console.log("お気に入り登録");
        router.post("/favorites", {
            user_id: auth.user?.public_uuid,
            valuable_book: entry,
        });
    }

    return (
        <li className="flex items-center gap-4" onClick={() => handleFavorite()}>
            <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <mask
                    id="mask0_140_660"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="17"
                    height="17"
                >
                    <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_140_660)">
                    <path
                        d="M4.15083 9.68465H12.452V8.30113H4.15083V9.68465ZM4.15083 7.60936H12.452V6.22584H4.15083V7.60936ZM4.15083 5.53408H12.452V4.15056H4.15083V5.53408ZM15.219 15.2187L12.452 12.4517H2.76731C2.38684 12.4517 2.06114 12.3162 1.7902 12.0453C1.51926 11.7743 1.38379 11.4486 1.38379 11.0682V2.76704C1.38379 2.38657 1.51926 2.06086 1.7902 1.78992C2.06114 1.51898 2.38684 1.38351 2.76731 1.38351H13.8355C14.216 1.38351 14.5417 1.51898 14.8126 1.78992C15.0835 2.06086 15.219 2.38657 15.219 2.76704V15.2187ZM2.76731 11.0682H13.04L13.8355 11.8464V2.76704H2.76731V11.0682Z"
                        fill="#B3B3B3"
                    />
                </g>
            </svg>
            <span className="text-sm text-[#B3B3B3]">{count}</span>
        </li>
    );
}
