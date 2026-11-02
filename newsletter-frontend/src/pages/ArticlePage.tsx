import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { Article } from '../types/article';
import { getArticleBySlug } from '../services/articleService';

import { Header } from '../components/Header';
import { ArticleContent } from '../components/ArticleContent';

import { getComments, createComment } from '../services/commentService';

import type { Comment } from '../services/commentService';

export const ArticlePage = () => {
    const { slug } = useParams<{ slug: string }>();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentName, setCommentName] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [commentSuccess, setCommentSuccess] = useState('');

    useEffect(() => {
        let cancelled = false;

        if (!slug) return;

        async function fetchArticle() {
            try {
                const data = await getArticleBySlug(slug!);

                if (cancelled) return;

                setArticle(data);
                setError('');

                // Fetch comments
                try {
                    const commentData = await getComments(data.ID);

                    if (!cancelled) {
                        setComments(commentData);
                    }
                } catch (err) {
                    console.error('Comment fetch error:', err);
                } finally {
                    if (!cancelled) {
                        setCommentsLoading(false);
                    }
                }

            } catch (err) {
                console.error('Article fetch error:', err);

                if (!cancelled) {
                    setError('Could not load this article.');
                    setArticle(null);
                    setCommentsLoading(false);
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

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!article || !commentContent.trim()) return;

        setCommentSubmitting(true);
        setCommentError('');
        setCommentSuccess('');

        try {
            const newComment = await createComment(article.ID, {
                author_name: commentName.trim() || null,
                content: commentContent.trim(),
            });

            setComments(prev => [newComment, ...prev]);

            setCommentName('');
            setCommentContent('');
            setCommentSuccess('Your comment has been posted!');
        } catch (err) {
            console.error('Comment submission error:', err);
            setCommentError('Could not post your comment. Please try again.');
        } finally {
            setCommentSubmitting(false);
        }
    };

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

                    <h2>DISCUSSION</h2>

                    <div className="comment-form-container">

                        <h3>Leave a comment</h3>

                        <form onSubmit={handleCommentSubmit}>

                            <input
                                type="text"
                                placeholder="Your name (optional)"
                                value={commentName}
                                onChange={(e) => setCommentName(e.target.value)}
                                maxLength={100}
                            />

                            <textarea
                                placeholder="Share your thoughts..."
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                required
                                maxLength={5000}
                                rows={5}
                            />

                            <button
                                type="submit"
                                disabled={commentSubmitting || !commentContent.trim()}
                            >
                                {commentSubmitting ? 'Posting...' : 'Post comment'}
                            </button>

                        </form>

                        {commentError && (
                            <p className="comment-error">{commentError}</p>
                        )}

                        {commentSuccess && (
                            <p className="comment-success">{commentSuccess}</p>
                        )}

                    </div>

                    <div className="comments-list">

                        <h3>
                            Comments ({comments.length})
                        </h3>

                        {commentsLoading ? (
                            <p>Loading comments...</p>
                        ) : comments.length === 0 ? (
                            <p className="no-comments">
                                No comments yet. Be the first to share your thoughts!
                            </p>
                        ) : (
                            comments.map(comment => (
                                <div className="comment-item" key={comment.ID}>

                                    <div className="comment-header">

                                        <h4>
                                            {comment.AuthorName || 'Anonymous'}
                                        </h4>

                                        <span>
                                            {new Date(comment.CreatedAt).toLocaleString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>

                                    </div>

                                    <p>{comment.Content}</p>

                                </div>
                            ))
                        )}

                    </div>

                </section>

            </main>
        </>
    );
};