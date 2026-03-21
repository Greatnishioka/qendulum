// api本体
export type ArxivFeed = {
    id: string;
    title: string;
    updated: string;
    totalResults: number;
    startIndex: number;
    itemsPerPage: number;
    entries: ArxivEntry[];
};

// エントリーの型定義。主に使うのはこれになるか、、、？
export type ArxivEntry = {
    id: string;
    title: string;
    summary: string;
    published: string;
    updated: string;
    authors: ArxivAuthor[];
    links: ArxivLink[];
    categories: ArxivCategory[];
    primaryCategory?: ArxivPrimaryCategory;
    comment?: string;
    journalRef?: string;
    doi?: string;
};

export type ArxivAuthor = {
    name: string;
};

export type ArxivLink = {
    href: string;
    rel?: string;
    type?: string;
    title?: string;
};

export type ArxivCategory = {
    term: string;
    scheme?: string;
};

export type ArxivPrimaryCategory = {
    term: string;
    scheme?: string;
};
