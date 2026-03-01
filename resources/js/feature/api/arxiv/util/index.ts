import { ArxivFeed, ArxivEntry } from "@/types/arxivArticlestype";

function textOf(parent: ParentNode, selector: string): string {
  return parent.querySelector(selector)?.textContent?.trim() ?? "";
}

function attrOf(element: Element, name: string): string | undefined {
  return element.getAttribute(name) ?? undefined;
}

export function parseArxivFeed(xmlText: string): ArxivFeed {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");

  const parserError = xml.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid XML response");
  }

  const entries = [...xml.querySelectorAll("entry")].map<ArxivEntry>((entry) => {
    const authors = [...entry.querySelectorAll("author")].map((author) => ({
      name: textOf(author, "name"),
    }));

    const links = [...entry.querySelectorAll("link")].map((link) => ({
      href: attrOf(link, "href") ?? "",
      rel: attrOf(link, "rel"),
      type: attrOf(link, "type"),
      title: attrOf(link, "title"),
    }));

    const categories = [...entry.querySelectorAll("category")].map((category) => ({
      term: attrOf(category, "term") ?? "",
      scheme: attrOf(category, "scheme"),
    }));

    const primaryCategoryEl =
      entry.getElementsByTagName("arxiv:primary_category")[0] ??
      entry.getElementsByTagName("primary_category")[0];

    const commentEl =
      entry.getElementsByTagName("arxiv:comment")[0] ??
      entry.getElementsByTagName("comment")[0];

    const journalRefEl =
      entry.getElementsByTagName("arxiv:journal_ref")[0] ??
      entry.getElementsByTagName("journal_ref")[0];

    const doiEl =
      entry.getElementsByTagName("arxiv:doi")[0] ??
      entry.getElementsByTagName("doi")[0];

    return {
      id: textOf(entry, "id"),
      title: textOf(entry, "title"),
      summary: textOf(entry, "summary"),
      published: textOf(entry, "published"),
      updated: textOf(entry, "updated"),
      authors,
      links,
      categories,
      primaryCategory: primaryCategoryEl
        ? {
            term: primaryCategoryEl.getAttribute("term") ?? "",
            scheme: primaryCategoryEl.getAttribute("scheme") ?? undefined,
          }
        : undefined,
      comment: commentEl?.textContent?.trim() || undefined,
      journalRef: journalRefEl?.textContent?.trim() || undefined,
      doi: doiEl?.textContent?.trim() || undefined,
    };
  });

  return {
    id: textOf(xml, "feed > id"),
    title: textOf(xml, "feed > title"),
    updated: textOf(xml, "feed > updated"),
    totalResults: Number(
      xml.getElementsByTagName("opensearch:totalResults")[0]?.textContent ?? 0,
    ),
    startIndex: Number(
      xml.getElementsByTagName("opensearch:startIndex")[0]?.textContent ?? 0,
    ),
    itemsPerPage: Number(
      xml.getElementsByTagName("opensearch:itemsPerPage")[0]?.textContent ?? 0,
    ),
    entries,
  };
}
