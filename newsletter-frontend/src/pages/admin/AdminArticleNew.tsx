
import { useNavigate } from 'react-router-dom';
import { createArticle } from '../../services/articleService';
import { ArticleForm } from './components/ArticleForm';

export function AdminArticleNew() {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <main className="admin-main">
                <header className="admin-topbar">
                    <span>ADMINISTRATION / ARTICLES / NEW</span>
                    <span>EDITOR</span>
                </header>

                <section className="admin-welcome">
                    <span className="admin-eyebrow">CONTENT MANAGEMENT</span>
                    <h1>New article.</h1>
                    <p>Create something worth reading.</p>
                </section>

                <ArticleForm
                    submitLabel="Create article"
                    onSubmit={async data => {
                        await createArticle(data);
                        navigate('/admin/articles');
                    }}
                />
            </main>
        </div>
    );
}