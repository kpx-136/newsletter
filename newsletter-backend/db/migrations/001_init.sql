CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    name TEXT NOT NULL UNIQUE, 
    slug TEXT NOT NULL UNIQUE
);

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    slug TEXT NOT NULL UNIQUE, 
    title TEXT NOT NULL, 
    description TEXT NOT NULL, 
    contents JSONB NOT NULL, 
    cover_image TEXT, 
    published_at TIMESTAMPTZ, 
    tags TEXT[] NOT NULL DEFAULT '{}', 
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL, 
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')), 
    type TEXT NOT NULL DEFAULT 'newsletter', 
    estimated_read_time INTEGER NOT NULL DEFAULT 1
        CHECK (estimated_read_time > 0), 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

