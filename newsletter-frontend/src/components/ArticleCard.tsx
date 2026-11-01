interface ArticleCardProps {
    title: string; 
    description: string; 
}

export const ArticleCard = function({title, description}: ArticleCardProps) {
    return(
        <div className = "article-card">
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    );
}