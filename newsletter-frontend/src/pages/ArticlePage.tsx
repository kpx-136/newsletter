import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { Article } from '../types/article';
import { getArticleBySlug } from '../services/articleService';

import { Header } from '../components/Header';
import { ArticleContent } from '../components/ArticleContent';

export const ArticlePage = () => {
    const { slug } = useParams<{ slug: string }>();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        if (!slug) {
            return;
        }

        async function fetchArticle() {
            try {
                const data = await getArticleBySlug(slug!);

                if (!cancelled) {
                    setArticle(data);
                    setError('');
                }
            } catch (err) {
                console.error('Article fetch error:', err);

                if (!cancelled) {
                    setError('Could not load this article.');
                    setArticle(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchArticle();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <>
                <Header />
                <p>Loading article...</p>
            </>
        );
    }

    if (error || !article) {
        return (
            <>
                <Header />
                <p>{error || 'Article not found.'}</p>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="reading-page">

                <section className="reading-header">

                    <div className="reading-cover">
                        {article.CoverImage ? (
                            <img
                                src={article.CoverImage}
                                alt={article.Title}
                            />
                        ) : (
                            <div className="reading-cover-placeholder">
                                <span>ARCHIVE</span>
                            </div>
                        )}
                    </div>

                    <div className="reading-info">

                        <span className="reading-label">
                            {article.Type}
                        </span>

                        <h1>{article.Title}</h1>

                        <p className="reading-description">
                            {article.Description}
                        </p>

                        <div className="reading-metadata">
                            <span>
                                {article.EstimatedReadTime} min read
                            </span>

                            <span>
                                {article.PublishedAt
                                    ? new Date(
                                        article.PublishedAt
                                    ).toLocaleDateString()
                                    : ''}
                            </span>
                        </div>

                        <div className="reading-tags">
                            {article.Tags?.map(tag => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>

                    </div>

                </section>

                <section className="reading-content">
                    <ArticleContent content={article.Contents} />
                </section>

                <section className="reading-comments">
                    <h2>Discussion</h2>
                    <p>Comments will appear here.</p>
                </section>

            </main>
        </>
    );
};