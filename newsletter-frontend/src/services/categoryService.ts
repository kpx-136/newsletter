import type { Category } from '../types/category';

const API_URL = import.meta.env.VITE_API_URL;

// GET ALL CATEGORIES
export async function getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }

    return response.json();
}

// CREATE CATEGORY
export interface CreateCategoryPayload {
    name: string;
    slug: string;
}

export async function createCategory(
    category: CreateCategoryPayload
): Promise<Category> {
    const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
    });

    if (!response.ok) {
        throw new Error('Failed to create category');
    }

    return response.json();
}