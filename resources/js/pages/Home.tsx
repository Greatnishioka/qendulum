import AppLayout from "@/layouts/AppLayout";
import type { ArxivFeed } from "@/types/arxivArticlestype";

// components
import ValuableBookCard from "@/components/ui/vb/valuableBookCard";

type props = {
    feed: ArxivFeed | null;
};

export default function Home({ feed }: props) {
    return (
        <AppLayout>
            <section className="mx-auto max-w-4xl">
                {feed ? (
                    <section className="">
                        {feed.entries.map((entry) => (
                            <ValuableBookCard key={entry.id} entry={entry} />
                        ))}
                    </section>
                ) :
                    <section className="">

                    </section>
                }
            </section>
        </AppLayout>
    );
}
