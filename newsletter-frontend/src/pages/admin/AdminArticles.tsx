import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Article } from '../../types/article';
import { getAllArticles, deleteArticle } from '../../services/articleService';

export function AdminArticles() {
    const navigate = useNavigate();

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function fetchArticles() {
            try {
                const data = await getAllArticles();

                if (!ignore) {
                    setArticles(data);
                }
            } catch (error) {
                if (!ignore) {
                    setError('Could not load articles.');
                }
                console.error(error);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchArticles();

        return () => {
            ignore = true;
        };
    }, []);

    async function handleDelete(id: string) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this article?'
        );

        if (!confirmed) return;

        try {
            await deleteArticle(id);
            setArticles(prev => prev.filter(article => article.ID !== id));
        } catch (error) {
            alert('Failed to delete article.');
            console.error(error);
        }
    }

    return (
        <div className="admin-dashboard">

            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">
                    <h2>THE EDITOR'S DESK</h2>
                    <span>ADMINISTRATION</span>
                </div>

                <nav className="admin-nav">

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        ◈ Dashboard
                    </button>

                    <button className="admin-nav-item active">
                        ▤ Articles
                    </button>

                    <button className="admin-nav-item"
                        onClick={() => navigate('/admin/categories')}>
                        ◇ Categories
                    </button>

                    <button className="admin-nav-item"
                        onClick={() => navigate('/admin/subscribers')}>
                        ♧ Subscribers
                    </button>

                </nav>

            </aside>

            <main className="admin-main">

                <header className="admin-topbar">
                    <span>ADMINISTRATION / ARTICLES</span>
                    <span>EDITOR</span>
                </header>

                <section className="admin-welcome">

                    <span className="admin-eyebrow">
                        CONTENT MANAGEMENT
                    </span>

                    <h1>Your articles.</h1>

                    <p>
                        Create, edit and manage your publication.
                    </p>

                </section>

                <section className="admin-recent">

                    <div className="admin-section-heading">

                        <h2>All articles</h2>

                        <button
                            onClick={() => navigate('/admin/articles/new')}
                        >
                            + New article
                        </button>

                    </div>

                    {loading && (
                        <div className="admin-empty">
                            Loading articles...
                        </div>
                    )}

                    {error && (
                        <div className="admin-empty">
                            {error}
                        </div>
                    )}

                    {!loading && !error && articles.length === 0 && (
                        <div className="admin-empty">
                            <p>You haven't created any articles yet.</p>
                        </div>
                    )}

                    {!loading && articles.length > 0 && (

                        <div className="admin-articles-list">

                            {articles.map(article => (

                                <div
                                    className="admin-article-row"
                                    key={article.ID}
                                >

                                    <div className="admin-article-info">

                                        <h3>{article.Title}</h3>

                                        <p>{article.Description}</p>

                                        <span className="admin-article-status">
                                            {article.Status}
                                        </span>

                                    </div>

                                    <div className="admin-article-actions">

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/admin/articles/edit/${article.Slug}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="admin-delete-button"
                                            onClick={() =>
                                                handleDelete(article.ID)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}