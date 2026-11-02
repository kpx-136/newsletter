
import { useState } from 'react';

import { useEditor, EditorContent } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';

import Link from '@tiptap/extension-link';

import Image from '@tiptap/extension-image';

import type { JSONContent } from '@tiptap/core';

import type { Article } from '../../../types/article';

import type { CreateArticlePayload } from '../../../services/articleService';

interface ArticleFormProps {
    initialData?: Article;
    onSubmit: (data: CreateArticlePayload) => Promise<void>;
    submitLabel?: string;
}

export function ArticleForm({
    initialData,
    onSubmit,
    submitLabel = 'Publish article',
}: ArticleFormProps) {

    const [title, setTitle] = useState(initialData?.Title ?? '');

    const [slug, setSlug] = useState(initialData?.Slug ?? '');

    const [description, setDescription] = useState(initialData?.Description ?? '');

    const [coverImage, setCoverImage] = useState(initialData?.CoverImage ?? '');

    const [tags, setTags] = useState(initialData?.Tags?.join(', ') ?? '');

    const [categoryId, setCategoryId] = useState(initialData?.CategoryId ?? '');

    const [status, setStatus] = useState(initialData?.Status ?? 'draft');

    const [type, setType] = useState(initialData?.Type ?? 'article');

    const [readTime, setReadTime] = useState(initialData?.EstimatedReadTime ?? 5);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content: (initialData?.Contents as JSONContent) ?? '',
        editorProps: {
            attributes: {
                class: 'article-editor-content',
            },
        },
    });

    const generateSlug = (value: string) =>
        value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

    async function handleSubmit(e: React.FormEvent) {

        e.preventDefault();

        if (!editor || !title.trim()) {
            setError('Please enter an article title.');
            return;
        }

        setSaving(true);
        setError('');

        try {

            await onSubmit({
                title: title.trim(),
                slug: slug.trim() || generateSlug(title),
                description,
                contents: editor.getJSON(),
                cover_image: coverImage.trim() || null,
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                category_id: categoryId || null,
                status,
                type,
                estimated_read_time: Number(readTime),
            });

        } catch (err) {

            console.error(err);
            setError('Could not save article. Please try again.');

        } finally {

            setSaving(false);

        }
    }

    return (

        <form className="article-form" onSubmit={handleSubmit}>

            <div className="article-form-section">

                <span className="admin-eyebrow">ARTICLE DETAILS</span>

                <label>Title</label>

                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => {
                        if (!slug) setSlug(generateSlug(title));
                    }}
                    placeholder="Give your article a title"
                    required
                />

                <label>Slug</label>

                <input
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="article-url"
                />

                <label>Description</label>

                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="A short introduction to your article"
                    rows={3}
                />

                <label>Cover image URL</label>

                <input
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://..."
                />

                {coverImage && (
                    <img
                        src={coverImage}
                        alt="Cover preview"
                        className="article-form-cover-preview"
                    />
                )}

            </div>

            <div className="article-form-section">

                <span className="admin-eyebrow">ARTICLE CONTENT</span>

                {editor && (
                    <>
                        <div className="article-editor-toolbar">

                            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>B</button>

                            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>

                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>

                            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>

                            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>

                            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>

                            <button
                                type="button"
                                onClick={() => {
                                    const url = window.prompt('Enter link URL');
                                    if (url) {
                                        editor.chain().focus().setLink({ href: url }).run();
                                    }
                                }}
                            >
                                Link
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const url = window.prompt('Enter image URL');
                                    if (url) {
                                        editor.chain().focus().setImage({ src: url }).run();
                                    }
                                }}
                            >
                                Image
                            </button>

                        </div>

                        <EditorContent editor={editor} />
                    </>
                )}

            </div>

            <div className="article-form-section">

                <span className="admin-eyebrow">PUBLICATION SETTINGS</span>

                <label>Tags (comma separated)</label>

                <input
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="Design, Lifestyle, Culture"
                />

                <label>Category ID</label>

                <input
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    placeholder="Category ID (optional)"
                />

                <label>Article type</label>

                <select value={type} onChange={e => setType(e.target.value)}>

                    <option value="article">Article</option>
                    <option value="essay">Essay</option>
                    <option value="interview">Interview</option>

                </select>

                <label>Status</label>

                <select value={status} onChange={e => setStatus(e.target.value)}>

                    <option value="draft">Draft</option>
                    <option value="published">Published</option>

                </select>

                <label>Estimated reading time (minutes)</label>

                <input
                    type="number"
                    min="1"
                    value={readTime}
                    onChange={e => setReadTime(Number(e.target.value))}
                />

            </div>

            {error && <p className="article-form-error">{error}</p>}

            <button
                className="article-form-submit"
                type="submit"
                disabled={saving}
            >
                {saving ? 'Saving...' : submitLabel}
            </button>

        </form>

    );
}