import type { ArxivFeed } from "@/types/arxivArticlestype";

type props = {
    entry: ArxivFeed["entries"][number];
};

export default function ValuableBookCard({ entry }: props) {

    function paperLink(feedEntry: ArxivFeed["entries"][number]): string {
        return (
            feedEntry.links.find((link) => link.title === "pdf")?.href ??
            feedEntry.id
        );
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
                        <p className="mt-3 text-sm leading-6 text-zinc-800">
                            {entry.summary}
                        </p>
                    </div>
                </div>
                <div className="border-b border-(--color-dark)">
                    <div className="p-6">
                        <p className="text-sm text-zinc-600">
                            {entry.authors.map((author) => author.name).join(", ")}
                        </p>
                    </div>
                </div>
                <div className="">
                    <div className="p-6">
                        <ul className="flex justify-between">
                            <li className="flex items-center gap-4">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_140_660" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="17">
                                        <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_140_660)">
                                        <path d="M4.15083 9.68465H12.452V8.30113H4.15083V9.68465ZM4.15083 7.60936H12.452V6.22584H4.15083V7.60936ZM4.15083 5.53408H12.452V4.15056H4.15083V5.53408ZM15.219 15.2187L12.452 12.4517H2.76731C2.38684 12.4517 2.06114 12.3162 1.7902 12.0453C1.51926 11.7743 1.38379 11.4486 1.38379 11.0682V2.76704C1.38379 2.38657 1.51926 2.06086 1.7902 1.78992C2.06114 1.51898 2.38684 1.38351 2.76731 1.38351H13.8355C14.216 1.38351 14.5417 1.51898 14.8126 1.78992C15.0835 2.06086 15.219 2.38657 15.219 2.76704V15.2187ZM2.76731 11.0682H13.04L13.8355 11.8464V2.76704H2.76731V11.0682Z" fill="#B3B3B3" />
                                    </g>
                                </svg>
                                <span className="text-sm text-[#B3B3B3]">
                                    48
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_140_667" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="17">
                                        <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_140_667)">
                                        <path d="M8.3014 14.527L7.29835 13.6277C6.13388 12.5785 5.17118 11.6735 4.41024 10.9126C3.64931 10.1516 3.04402 9.4685 2.59437 8.86321C2.14473 8.25792 1.83055 7.70163 1.65185 7.19434C1.47314 6.68705 1.38379 6.16823 1.38379 5.63788C1.38379 4.55412 1.74696 3.64906 2.47331 2.92271C3.19966 2.19637 4.10472 1.83319 5.18848 1.83319C5.788 1.83319 6.3587 1.96001 6.90058 2.21366C7.44246 2.46731 7.9094 2.82472 8.3014 3.28589C8.6934 2.82472 9.16034 2.46731 9.70222 2.21366C10.2441 1.96001 10.8148 1.83319 11.4143 1.83319C12.4981 1.83319 13.4031 2.19637 14.1295 2.92271C14.8558 3.64906 15.219 4.55412 15.219 5.63788C15.219 6.16823 15.1297 6.68705 14.951 7.19434C14.7723 7.70163 14.4581 8.25792 14.0084 8.86321C13.5588 9.4685 12.9535 10.1516 12.1926 10.9126C11.4316 11.6735 10.4689 12.5785 9.30445 13.6277L8.3014 14.527ZM8.3014 12.6593C9.40822 11.6677 10.319 10.8174 11.0339 10.1084C11.7487 9.39933 12.3136 8.78251 12.7287 8.25792C13.1437 7.73334 13.432 7.2664 13.5934 6.85711C13.7548 6.44781 13.8355 6.0414 13.8355 5.63788C13.8355 4.94612 13.6049 4.36965 13.1437 3.90847C12.6826 3.4473 12.1061 3.21671 11.4143 3.21671C10.8724 3.21671 10.3709 3.36948 9.90975 3.67501C9.44857 3.98053 9.13151 4.36965 8.95857 4.84235H7.64423C7.47129 4.36965 7.15423 3.98053 6.69306 3.67501C6.23188 3.36948 5.73035 3.21671 5.18848 3.21671C4.49671 3.21671 3.92025 3.4473 3.45907 3.90847C2.9979 4.36965 2.76731 4.94612 2.76731 5.63788C2.76731 6.0414 2.84802 6.44781 3.00943 6.85711C3.17084 7.2664 3.45907 7.73334 3.87413 8.25792C4.28919 8.78251 4.85412 9.39933 5.56894 10.1084C6.28376 10.8174 7.19458 11.6677 8.3014 12.6593Z" fill="#B3B3B3" />
                                    </g>
                                </svg>

                                <span className="text-sm text-[#B3B3B3]">
                                    48
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_140_673" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="17">
                                        <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_140_673)">
                                        <path d="M3.45898 14.527V3.45881C3.45898 3.07834 3.59445 2.75264 3.86539 2.4817C4.13633 2.21076 4.46204 2.07529 4.84251 2.07529H11.7601C12.1406 2.07529 12.4663 2.21076 12.7372 2.4817C13.0082 2.75264 13.1436 3.07834 13.1436 3.45881V14.527L8.30131 12.4517L3.45898 14.527ZM4.84251 12.4171L8.30131 10.9298L11.7601 12.4171V3.45881H4.84251V12.4171Z" fill="#B3B3B3" />
                                    </g>
                                </svg>
                                <span className="text-sm text-[#B3B3B3]">
                                    48
                                </span>
                            </li>
                            <li className="flex items-center gap-4">
                                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_140_677" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="17">
                                        <rect width="16.6023" height="16.6023" fill="#D9D9D9" />
                                    </mask>
                                    <g mask="url(#mask0_140_677)">
                                        <path d="M7.60942 11.0682V5.43034L5.81084 7.22892L4.84237 6.22586L8.30118 2.76706L11.76 6.22586L10.7915 7.22892L8.99294 5.43034V11.0682H7.60942ZM4.15061 13.8352C3.77014 13.8352 3.44444 13.6998 3.1735 13.4288C2.90256 13.1579 2.76709 12.8322 2.76709 12.4517V10.3764H4.15061V12.4517H12.4517V10.3764H13.8353V12.4517C13.8353 12.8322 13.6998 13.1579 13.4289 13.4288C13.1579 13.6998 12.8322 13.8352 12.4517 13.8352H4.15061Z" fill="#B3B3B3" />
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