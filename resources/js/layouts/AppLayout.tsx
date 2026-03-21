import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Sidevar from "@/components/ui/sidevar";
import Uservar from "@/components/ui/uservar";

import { type sidevarPropaty } from "@/types/sidevar";

type Props = {
    children: React.ReactNode;
};

// 全ページで使いたい内容をこうやって定義したいね。
export default function AppLayout({ children }: Props) {
    const sidevarPropaties: sidevarPropaty[] = [
        {
            link: "",
            label: "トップ",
        },
        {
            link: "",
            label: "フォーラム",
        },
        {
            link: "",
            label: "お気に入り",
        },
        {
            link: "",
            label: "ブックマーク",
        },
    ];

    return (
        <div className="">
            <Header />
            <div className="flex justify-between">
                <Sidevar propaties={sidevarPropaties} />
                <main className="">{children}</main>
                <Uservar />
            </div>
            <Footer />
        </div>
    );
}
