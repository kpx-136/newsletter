export interface Article {
    id: string; 
    slug: string; 
    title: string; 
    description: string; 
    coverImage: string | null; 
    tags: string[]; 
    categoryId: string | null; 
    status: string; 
    type: string; 
    estimatedReadTime: number; 
    publishedAt: string; 
}