import { useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import type { ArxivFeed } from "@/types/arxivArticlestype";

type HomeProps = {
  query: string;
  feed: ArxivFeed | null;
};

function paperLink(feedEntry: ArxivFeed["entries"][number]): string {
  return (
    feedEntry.links.find((link) => link.title === "pdf")?.href ??
    feedEntry.id
  );
}

export default function Home({ query, feed }: HomeProps) {
  const form = useForm({
    query,
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    form.get("/", {
      preserveState: true,
      replace: true,
    });
  }

  return (
    <AppLayout>
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold">arXiv Search</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Query is submitted to Laravel, then Laravel fetches and parses arXiv.
        </p>

        <form className="mt-8 flex gap-3" onSubmit={submit}>
          <input
            type="text"
            value={form.data.query}
            onChange={(event) => form.setData("query", event.target.value)}
            className="w-full rounded border border-zinc-300 px-4 py-2"
            placeholder="electron"
          />
          <button
            type="submit"
            disabled={form.processing}
            className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            Search
          </button>
        </form>

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
