import axios from "axios";
import { ArxivFeed } from "@/types/arxivArticlestype";
import { parseArxivFeed } from "@/feature/api/arxiv/util";

const ARXIV_API_URL =
    import.meta.env.VITE_ARXIV_API_URL || "http://export.arxiv.org/api/query";

export async function getArxiv<T>(query: string): Promise<ArxivFeed | null> {
    try {
        
        const response = await axios.get(`${ARXIV_API_URL}/guest/${query}`, {
            responseType: "text",
        });

        return parseArxivFeed(response.data);
    } catch (error) {
        return null;
    }
}

