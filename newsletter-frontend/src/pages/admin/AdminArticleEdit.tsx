
import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import type { Article } from '../../types/article';

import {
    getArticleBySlug,
    updateArticle
} from '../../services/articleService';

import { ArticleForm } from './components/ArticleForm';

export function AdminArticleEdit() {

    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();

    const [article, setArticle] = useState<Article | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    useEffect(() => {

        let ignore = false;

        async function fetchArticle() {

            try {

                if (!id) {
                    throw new Error('Article slug missing');
                }

                const data = await getArticleBySlug(id);

                if (!ignore) {
                    setArticle(data);
                }

            } catch (err) {

                console.error(err);

                if (!ignore) {
                    setError('Could not load article.');
                }

            } finally {

                if (!ignore) {
                    setLoading(false);
                }

            }

        }

        fetchArticle();

        return () => {
            ignore = true;
        };

    }, [id]);

    async function handleUpdate(data: Parameters<typeof updateArticle>[1]) {

        if (!article) return;

        await updateArticle(article.ID, data);

        navigate('/admin/articles');

    }

    if (loading) {

        return (
            <div className="admin-loading">
                Loading article...
            </div>
        );

    }

    if (error || !article) {

        return (
            <div className="admin-main">

                <p>{error || 'Article not found.'}</p>

                <button onClick={() => navigate('/admin/articles')}>
                    Back to articles
                </button>

            </div>
        );

    }

    return (

        <div className="admin-dashboard">

            <main className="admin-main">

                <header className="admin-topbar">

                    <span>ADMINISTRATION / ARTICLES / EDIT</span>

                    <span>EDITOR</span>

                </header>

                <section className="admin-welcome">

                    <span className="admin-eyebrow">
                        CONTENT MANAGEMENT
                    </span>

                    <h1>Edit article.</h1>

                    <p>
                        Make your changes and update your publication.
                    </p>

                </section>

                <ArticleForm
                    initialData={article}
                    submitLabel="Save changes"
                    onSubmit={handleUpdate}
                />

            </main>

        </div>

    );

}