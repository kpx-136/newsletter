
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Article } from '../../types/article';
import { getAllArticles } from '../../services/articleService';
import { getSubscribers } from '../../services/subscribeService';

const API_URL = import.meta.env.VITE_API_URL;

export function AdminDashboard() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [articles, setArticles] = useState<Article[]>([]);
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
    const [categoryCount, setCategoryCount] = useState<number | null>(null);

    useEffect(() => {
        let ignore = false;

        async function loadDashboard() {
            try {
                const response = await fetch(
                    `${API_URL}/admin/me`,
                    { credentials: 'include' }
                );

                if (!response.ok) {
                    navigate('/admin/login');
                    return;
                }

                const [articleResult, subscriberResult, categoryResult] =
                    await Promise.allSettled([
                        getAllArticles(),
                        getSubscribers(),
                        fetch(`${API_URL}/categories`),
                    ]);

                if (ignore) return;

                if (articleResult.status === 'fulfilled') {
                    setArticles(articleResult.value);
                } else {
                    console.error('Could not load articles:', articleResult.reason);
                }

                if (subscriberResult.status === 'fulfilled') {
                    setSubscriberCount(subscriberResult.value.length);
                } else {
                    console.error('Could not load subscribers:', subscriberResult.reason);
                }

                if (categoryResult.status === 'fulfilled') {
                    if (categoryResult.value.ok) {
                        const categories = await categoryResult.value.json();

                        if (!ignore) {
                            setCategoryCount(categories.length);
                        }
                    }
                } else {
                    console.error('Could not load categories:', categoryResult.reason);
                }

            } catch (error) {
                console.error('Dashboard loading failed:', error);
                navigate('/admin/login');
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            ignore = true;
        };
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/admin/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            navigate('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading...</div>;
    }

    const draftArticles = articles.filter(
        article => article.Status.toLowerCase() === 'draft'
    );

    const recentArticles = [...articles]
        .sort((a, b) => {
            return new Date(b.PublishedAt || 0).getTime() -
                   new Date(a.PublishedAt || 0).getTime();
        })
        .slice(0, 5);

    return (
        <div className="admin-dashboard">

            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <h2>THE EDITOR'S DESK</h2>
                    <span>ADMINISTRATION</span>
                </div>

                <nav className="admin-nav">
                    <button
                        className="admin-nav-item active"
                    >
                        <span>◈</span>
                        Dashboard
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate('/admin/articles')}
                    >
                        <span>▤</span>
                        Articles
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate('/admin/categories')}
                    >
                        <span>◇</span>
                        Categories
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate('/admin/subscribers')}
                    >
                        <span>♧</span>
                        Subscribers
                    </button>
                </nav>

                <button
                    className="admin-logout"
                    onClick={handleLogout}
                >
                    ↗ Logout
                </button>
            </aside>

            <main className="admin-main">

                <header className="admin-topbar">
                    <span>ADMINISTRATION / DASHBOARD</span>
                    <span>EDITOR</span>
                </header>

                <section className="admin-welcome">
                    <span className="admin-eyebrow">
                        WELCOME BACK
                    </span>

                    <h1>Your publication, at a glance.</h1>

                    <p>
                        Manage your articles, subscribers and categories
                        from one place.
                    </p>
                </section>

                <section className="admin-stats">

                    <div className="admin-stat-card">
                        <span>ARTICLES</span>
                        <h2>{articles.length}</h2>
                        <p>Total articles</p>
                    </div>

                    <div className="admin-stat-card">
                        <span>SUBSCRIBERS</span>
                        <h2>{subscriberCount ?? '—'}</h2>
                        <p>Total subscribers</p>
                    </div>

                    <div className="admin-stat-card">
                        <span>CATEGORIES</span>
                        <h2>{categoryCount ?? '—'}</h2>
                        <p>Available categories</p>
                    </div>

                    <div className="admin-stat-card">
                        <span>DRAFTS</span>
                        <h2>{draftArticles.length}</h2>
                        <p>Unpublished articles</p>
                    </div>

                </section>

                <section className="admin-recent">

                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-eyebrow">
                                YOUR CONTENT
                            </span>

                            <h2>Recent articles</h2>
                        </div>

                        <button
                            onClick={() => navigate('/admin/articles')}
                        >
                            View all →
                        </button>
                    </div>

                    {recentArticles.length === 0 ? (
                        <div className="admin-empty">
                            <p>
                                Your recent articles will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-articles-list">
                            {recentArticles.map(article => (
                                <div
                                    className="admin-article-row"
                                    key={article.ID}
                                >
                                    <div className="admin-article-info">
                                        <h3>{article.Title}</h3>

                                        <p>{article.Description}</p>
                                    </div>

                                    <div className="admin-article-actions">
                                        <span className="admin-article-status">
                                            {article.Status}
                                        </span>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/admin/articles/edit/${article.ID}`
                                                )
                                            }
                                        >
                                            Edit →
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