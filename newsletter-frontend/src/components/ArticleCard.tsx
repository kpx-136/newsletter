import type { Article } from "../types/article";

interface ArticleCardProps {
    article: Article; 
    onClick: () => void; 
    isSelected: boolean; 
    style?: React.CSSProperties; 
    isFaded: boolean;
    index: number
}

export const ArticleCard = ({article, onClick, isSelected, style, index, isFaded}: ArticleCardProps) => {
    return(
        <button className = {`article-card ${isSelected? 'selected' : ''} ${isFaded ? 'faded' : ''}`} onClick = {onClick} style = {style}>
            <div className = "article-card-inner">
                <div className="article-card-image">
                    {article.CoverImage ? (
                        <img src={article.CoverImage} alt={article.Title} className="article-cover" />
                    ) : (
                        <div className="article-cover-placeholder">
                            <h2>{String(index + 1).padStart(3, '0')}</h2>
                            <span>ARCHIVE</span>
                        </div>
                    )}
                </div>

                <div className="article-card-title">
                    <h2>{article.Title}</h2>
                </div>
            </div>
        </button>
    )
}