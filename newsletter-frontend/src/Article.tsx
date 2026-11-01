interface Article {
    title: string; 
    slug: string; 
    description?: string; 
    readTime: number; 
    published?: boolean; 
}

const myArticle: Article = {
    title: "yooo", 
    slug: "ello", 
    description: "weeeeeeeeee", 
    readTime: 1, 
    published: false
}

const myArticle2: Article = {
    title: "ummm", 
    slug: "yoooo", 
    readTime: 1
}