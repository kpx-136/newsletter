import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(
                    'http://localhost:8080/admin/me',
                    {
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    navigate('/admin/login');
                    return;
                }

                setLoading(false);
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/admin/login');
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8080/admin/logout', {
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

    return (
        <div className="admin-dashboard">

            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">
                    <h2>THE EDITOR'S DESK</h2>
                    <span>ADMINISTRATION</span>
                </div>

                <nav className="admin-nav">

                    <button className="admin-nav-item active">
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
                        <h2>—</h2>
                        <p>Total articles</p>
                    </div>

                    <div className="admin-stat-card">
                        <span>SUBSCRIBERS</span>
                        <h2>—</h2>
                        <p>Total subscribers</p>
                    </div>

                    <div className="admin-stat-card">
                        <span>CATEGORIES</span>
                        <h2>—</h2>
                        <p>Available categories</p>
                    </div>

                    <div className="admin-stat-card">
                        <span>COMMENTS</span>
                        <h2>—</h2>
                        <p>Total comments</p>
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

                    <div className="admin-empty">
                        <p>Your recent articles will appear here.</p>
                    </div>

                </section>

            </main>

        </div>
    );
}