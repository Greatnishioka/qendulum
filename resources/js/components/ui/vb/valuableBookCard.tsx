import type { ArxivFeed } from "@/types/arxivArticlestype";
import ValuableBookButton from "@/components/parts/valuableBookButton";
import { truncate } from "@/util/util";

type props = {
    entry: ArxivFeed["entries"][number];
};

export default function ValuableBookCard({ entry }: props) {
    function paperLink(feedEntry: ArxivFeed["entries"][number]): string {
        return feedEntry.links.find((link) => link.title === "pdf")?.href ?? feedEntry.id;
    }

    return (
        <article key={entry.id} className="bg-(--color-light) p-4 border-b border-(--color-dark)">
            <div className="bg-white rounded-xl border border-[#F0F0F0]">
                <div className="border-b border-(--color-dark)">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-(--color-turquoise) line-clamp-2">
                            <a href={paperLink(entry)} target="_blank" rel="noreferrer">
                                {entry.title}
                            </a>
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-800">{truncate(entry.summary, 720)}</p>
                    </div>
                </div>
                <div className="border-b border-(--color-dark)">
                    <div className="p-6">
                        <p className="text-sm text-zinc-600">
                            {truncate(entry.authors.map((author) => author.name).join(", "), 240)}
                        </p>
                    </div>
                </div>
                <div className="">
                    <div className="p-6">
                        <ul className="flex justify-between">
                            {/* コメントの数 */}
                            <li className="flex items-center gap-4">
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
                                <span className="text-sm text-[#B3B3B3]">48</span>
                            </li>
                            {/* お気に入りの数 */}
                            <ValuableBookButton entry={entry} count={48} />
                            {/* ブックマークの数 */}
                            <li className="flex items-center gap-4">
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 17 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <mask
                                        id="mask0_140_673"
                                        style={{ maskType: "alpha" }}
                                        maskUnits="userSpaceOnUse"
                                        x="0"
                                        y="0"
                                        width="17"
                                        height="17"
                                    >
                                        <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_140_673)">
                                        <path
                                            d="M3.45898 14.527V3.45881C3.45898 3.07834 3.59445 2.75264 3.86539 2.4817C4.13633 2.21076 4.46204 2.07529 4.84251 2.07529H11.7601C12.1406 2.07529 12.4663 2.21076 12.7372 2.4817C13.0082 2.75264 13.1436 3.07834 13.1436 3.45881V14.527L8.30131 12.4517L3.45898 14.527ZM4.84251 12.4171L8.30131 10.9298L11.7601 12.4171V3.45881H4.84251V12.4171Z"
                                            fill="#B3B3B3"
                                        />
                                    </g>
                                </svg>
                                <span className="text-sm text-[#B3B3B3]">48</span>
                            </li>
                            {/* 共有ボタン */}
                            <li className="flex items-center gap-4">
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 17 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <mask
                                        id="mask0_140_677"
                                        style={{ maskType: "alpha" }}
                                        maskUnits="userSpaceOnUse"
                                        x="0"
                                        y="0"
                                        width="17"
                                        height="17"
                                    >
                                        <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_140_677)">
                                        <path
                                            d="M7.60942 11.0682V5.43034L5.81084 7.22892L4.84237 6.22586L8.30118 2.76706L11.76 6.22586L10.7915 7.22892L8.99294 5.43034V11.0682H7.60942ZM4.15061 13.8352C3.77014 13.8352 3.44444 13.6998 3.1735 13.4288C2.90256 13.1579 2.76709 12.8322 2.76709 12.4517V10.3764H4.15061V12.4517H12.4517V10.3764H13.8353V12.4517C13.8353 12.8322 13.6998 13.1579 13.4289 13.4288C13.1579 13.6998 12.8322 13.8352 12.4517 13.8352H4.15061Z"
                                            fill="#B3B3B3"
                                        />
                                    </g>
                                </svg>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </article>
    );
}
