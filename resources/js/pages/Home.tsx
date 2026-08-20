import AppLayout from "@/layouts/AppLayout";
import type { ArxivFeed } from "@/types/arxivArticlestype";

// components
import ValuableBookCard from "@/components/ui/vb/valuableBookCard";

type props = {
    // フィードを取得していない場合は空配列が渡ってくる
    feed: ArxivFeed | [];
};

export default function Home({ feed }: props) {
    const entries = Array.isArray(feed) ? [] : feed.entries;

    return (
        <AppLayout>
            <section className="mx-auto max-w-4xl">
                {entries.length > 0 ? (
                    <section className="">
                        {entries.map((entry) => (
                            <ValuableBookCard key={entry.id} entry={entry} />
                        ))}
                    </section>
                ) : (
                    <section className="w-full"></section>
                )}
            </section>
        </AppLayout>
    );
}
