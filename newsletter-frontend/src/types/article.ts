import type { JSONContent } from '@tiptap/core';

export interface TiptapNode {
    type: string;
    attrs?: Record<string, string | number | boolean | null>;
    text?: string;
    marks?: {
        type: string;
        attrs?: Record<string, string | number | boolean | null>;
    }[];
    content?: TiptapNode[];
}

export interface TiptapContent {
    type: 'doc';
    content?: TiptapNode[];
}

export interface Article {
    ID: string; 
    Slug: string; 
    Title: string; 
    Description: string;
    Contents: JSONContent;
    CoverImage: string | null; 
    Tags: string[]; 
    CategoryId: string | null; 
    Status: string; 
    Type: string; 
    EstimatedReadTime: number; 
    PublishedAt: string; 
}