import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Category } from '../../types/category';
import {
    getCategories,
    createCategory,
} from '../../services/categoryService';

export function AdminCategories() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let ignore = false;

        async function fetchCategories() {
            try {
                const data = await getCategories();

                if (!ignore) {
                    setCategories(data);
                }
            } catch (error) {
                if (!ignore) {
                    setError('Could not load categories.');
                }
                console.error(error);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchCategories();

        return () => {
            ignore = true;
        };
    }, []);

    function generateSlug(value: string) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim()) {
            setFormError('Please enter a category name.');
            return;
        }

        setSaving(true);
        setFormError('');
        setSuccess('');

        try {
            const newCategory = await createCategory({
                name: name.trim(),
                slug: slug.trim() || generateSlug(name),
            });

            setCategories(prev => [...prev, newCategory]);

            setName('');
            setSlug('');
            setShowForm(false);
            setSuccess('Category created successfully.');
        } catch (error) {
            console.error(error);
            setFormError('Could not create category. Please try again.');
        } finally {
            setSaving(false);
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

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate('/admin/articles')}
                    >
                        ▤ Articles
                    </button>

                    <button className="admin-nav-item active">
                        ◇ Categories
                    </button>

                    <button
                        className="admin-nav-item"
                        onClick={() => navigate('/admin/subscribers')}
                    >
                        ♧ Subscribers
                    </button>
                </nav>

                <button
                    className="admin-logout"
                    onClick={() => navigate('/')}
                >
                    ← Back to website
                </button>
            </aside>

            <main className="admin-main">

                <header className="admin-topbar">
                    <span>ADMINISTRATION / CATEGORIES</span>
                    <span>EDITOR</span>
                </header>

                <section className="admin-welcome">
                    <span className="admin-eyebrow">
                        CONTENT MANAGEMENT
                    </span>

                    <h1>Your categories.</h1>

                    <p>
                        Organise your publication, one category at a time.
                    </p>
                </section>

                <section className="admin-recent">

                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-eyebrow">
                                YOUR PUBLICATION
                            </span>
                            <h2>All categories</h2>
                        </div>

                        <button
                            onClick={() => {
                                setShowForm(!showForm);
                                setFormError('');
                            }}
                        >
                            {showForm ? '− Close' : '+ New category'}
                        </button>
                    </div>

                    {success && (
                        <p className="category-success">{success}</p>
                    )}

                    {showForm && (
                        <form
                            className="category-create-form"
                            onSubmit={handleCreate}
                        >
                            <span className="admin-eyebrow">
                                NEW CATEGORY
                            </span>

                            <label>Category name</label>

                            <input
                                value={name}
                                onChange={e => {
                                    setName(e.target.value);
                                    if (!slug) {
                                        setSlug(generateSlug(e.target.value));
                                    }
                                }}
                                placeholder="e.g. Lifestyle"
                                required
                            />

                            <label>URL slug</label>

                            <input
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="e.g. lifestyle"
                            />

                            {formError && (
                                <p className="category-error">
                                    {formError}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="category-submit"
                                disabled={saving}
                            >
                                {saving ? 'Creating...' : 'Create category'}
                            </button>
                        </form>
                    )}

                    {loading && (
                        <div className="admin-empty">
                            Loading categories...
                        </div>
                    )}

                    {error && (
                        <div className="admin-empty">
                            {error}
                        </div>
                    )}

                    {!loading && !error && categories.length === 0 && (
                        <div className="admin-empty">
                            <p>No categories yet.</p>
                            <p>Create your first category to get started.</p>
                        </div>
                    )}

                    {!loading && !error && categories.length > 0 && (
                        <div className="admin-categories-list">

                            {categories.map(category => (
                                <div
                                    className="admin-category-row"
                                    key={category.ID}
                                >
                                    <div className="admin-category-info">
                                        <h3>{category.Name}</h3>
                                        <span>/{category.Slug}</span>
                                    </div>

                                    <span className="admin-category-label">
                                        CATEGORY
                                    </span>
                                </div>
                            ))}

                        </div>
                    )}

                </section>
            </main>
        </div>
    );
}