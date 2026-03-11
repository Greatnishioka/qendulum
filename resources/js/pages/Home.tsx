import { useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import type { ArxivFeed } from "@/types/arxivArticlestype";

type props = {
  feed: ArxivFeed | null;
};

function paperLink(feedEntry: ArxivFeed["entries"][number]): string {
  return (
    feedEntry.links.find((link) => link.title === "pdf")?.href ??
    feedEntry.id
  );
}

export default function Home({ feed }: props) {

  return (
    <AppLayout>
      <section className="mx-auto max-w-4xl px-6 py-12">
        {feed && (
          <section className="mt-8 space-y-4">
            <p className="text-sm text-zinc-600">
              {feed.totalResults} results
            </p>

            {feed.entries.map((entry) => (
              <article key={entry.id} className="rounded border border-zinc-200 p-4">
                <h2 className="text-lg font-semibold">
                  <a href={paperLink(entry)} target="_blank" rel="noreferrer">
                    {entry.title}
                  </a>
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  {entry.authors.map((author) => author.name).join(", ")}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-800">
                  {entry.summary}
                </p>
              </article>
            ))}
          </section>
        )}
      </section>
    </AppLayout>
  );
}
