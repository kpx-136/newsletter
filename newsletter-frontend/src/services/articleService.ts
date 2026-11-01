import type {Article} from '../types/article';

const API_URL = import.meta.env.VITE_API_URL; 

export async function getPublishedArticles(): Promise<Article[]> {
    const response = await fetch(`${API_URL}/articles`);

    if (!response.ok) {
        throw new Error('Failed to fetch published articles');
    }

    return response.json();
}