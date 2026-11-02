import type { Article } from '../types/article';

const API_URL = import.meta.env.VITE_API_URL;

// GET PUBLISHED ARTICLES
export async function getPublishedArticles(): Promise<Article[]> {
    const response = await fetch(`${API_URL}/articles`);

    if (!response.ok) {
        throw new Error('Failed to fetch published articles');
    }

    return response.json();
}

// CREATE ARTICLE
export interface CreateArticlePayload {
    slug: string;
    title: string;
    description: string;
    contents: object;
    cover_image: string | null;
    tags: string[];
    category_id: string | null;
    status: string;
    type: string;
    estimated_read_time: number;
}

export async function createArticle(
    article: CreateArticlePayload
): Promise<Article> {
    const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
    });

    if (!response.ok) {
        throw new Error('Failed to create article');
    }

    return response.json();
}

// GET ARTICLE BY SLUG
export async function getArticleBySlug(
    slug: string
): Promise<Article> {
    const response = await fetch(
        `${API_URL}/articles/${encodeURIComponent(slug)}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch article');
    }

    return response.json();
}

// UPDATE ARTICLE
export async function updateArticle(
    id: string,
    article: CreateArticlePayload
): Promise<Article> {
    const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
    });

    if (!response.ok) {
        throw new Error('Failed to update article');
    }

    return response.json();
}

// DELETE ARTICLE
export async function deleteArticle(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to delete article');
    }
}

export async function getAllArticles(): Promise<Article[]> {
    const response = await fetch(`${API_URL}/articles/all`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch all articles');
    }

    return response.json();
}