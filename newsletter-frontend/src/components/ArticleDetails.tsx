import type { Article } from "../types/article"

interface ArticleDetailsProps {
    article: Article; 
    onClose: () => void; 
}

export const ArticleDetails = ({article, onClose}: ArticleDetailsProps) => {
    return (
        <div className = "article-details">
            <button className="article-details-close" onClick={onClose} aria-label="Close article details">
                ×
            </button>
            
            <div className="article-details-content">

                <h2>{article.Title}</h2>

                <p className="article-description">
                    {article.Description}
                </p>

                <div className="article-metadata">

                    <span>
                        {article.EstimatedReadTime} MIN READ
                    </span>

                    <div className="article-tags">
                        {article.Tags.map(tag => (
                            <span key={tag}>{tag}</span>
                        ))}
                    </div>

                </div>

                <a href={`/articles/${article.Slug}`}>
                    Read full article <span>↗</span>
                </a>

            </div>
        </div>
    )
}