export interface Article {
    ID: string; 
    Slug: string; 
    Title: string; 
    Description: string; 
    CoverImage: string | null; 
    Tags: string[]; 
    CategoryId: string | null; 
    Status: string; 
    Type: string; 
    EstimatedReadTime: number; 
    PublishedAt: string; 
}