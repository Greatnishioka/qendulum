import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';

type Props = {
    children: React.ReactNode;
}

// 全ページで使いたい内容をこうやって定義したいね。
export default function AppLayout({ children }: Props) {
    return (
        <div className="">
            <Header />
            <main className="">
                {children}
            </main>
            <Footer />
        </div>
    );
}