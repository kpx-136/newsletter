import { useEffect, useState } from "react"
import type { Article } from "../types/article";
import { getPublishedArticles } from "../services/articleService";
import { Header } from "../components/Header";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleDetails } from "../components/ArticleDetails";

export const Home = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const closeArticle = () => {
        setIsClosing(true);

        setTimeout(() => {
            setSelectedArticle(null);
            setIsClosing(false);
        }, 300);
    };

    const openArticle = (article: Article) => {
        setIsClosing(false);
        setSelectedArticle(article);
    };

    const cardPositions = [
        { left: '8%', top: '30px', rotate: '-5deg', zIndex: 2 },
        { left: '34%', top: '85px', rotate: '4deg', zIndex: 3 },
        { left: '64%', top: '15px', rotate: '-3deg', zIndex: 1 },
        { left: '19%', top: '290px', rotate: '3deg', zIndex: 4 },
        { left: '49%', top: '330px', rotate: '-4deg', zIndex: 2 },
        { left: '75%', top: '265px', rotate: '5deg', zIndex: 3 },
    ];

    const [isMobile, setIsMobile] = useState(
        window.innerWidth <= 480
    );

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 480);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const mobileCardPositions = [
        { left: '2%', top: '20px', rotate: '-4deg', zIndex: 2 },
        { left: '52%', top: '100px', rotate: '4deg', zIndex: 3 },
        { left: '8%', top: '280px', rotate: '3deg', zIndex: 1 },
        { left: '52%', top: '420px', rotate: '-5deg', zIndex: 4 },
        { left: '3%', top: '590px', rotate: '-3deg', zIndex: 2 },
        { left: '52%', top: '700px', rotate: '4deg', zIndex: 3 },
    ];

    const positions = isMobile ? mobileCardPositions : cardPositions;
    const rowOffset = isMobile ? 900 : 500;

    useEffect(() => {
        async function fetchArticles() {
            try {
                const data = await getPublishedArticles();
                setArticles(data); 
            } catch (err) {
                console.error('API Error: ', err); 
                setError('Could not load articles. '); 
            }finally {
                setLoading(false);
            }
        }
        fetchArticles();
    }, []);

    return (
        <>
        
            <Header />

            <main className = "home">
                <p>Explore the archive...</p>

                <section className = "article-scatter" style={{
                                                            minHeight: `${
                                                                articles.length === 0
                                                                    ? (isMobile ? 900 : 650)
                                                                    : Math.max(
                                                                        0,
                                                                        ...articles.map((_, index) => {
                                                                            const row = Math.floor(index / positions.length);
                                                                            return (
                                                                                row * rowOffset +
                                                                                parseInt(positions[index % positions.length].top) +
                                                                                300
                                                                            );
                                                                        })
                                                                    )
                                                            }px`
                                                        }}>
                    {loading && <h1>Loading articles...</h1>}
                    {error && <h1>{error}</h1>}

                    {
                        articles.map((article, index) => {
                            
                            const positionIndex = index % positions.length;
                            const row = Math.floor(index / positions.length);

                            const position = positions[positionIndex]; 
                            
        
                            return(
                                <ArticleCard 
                                    key = {article.ID}
                                    article = {article}
                                    onClick = {()=> openArticle(article)}
                                    isSelected = {selectedArticle?.ID === article.ID}
                                    style={{
                                        left: position.left,
                                        top: `calc(${position.top} + ${row * rowOffset}px)`,
                                        transform: `rotate(${position.rotate}deg)`,
                                        '--card-z': position.zIndex
                                    } as React.CSSProperties}
                                    index = {index}
                                    isFaded = {!!selectedArticle && selectedArticle.ID !== article.ID}
                                />
                            )
                        })
                    }
                </section>

                {selectedArticle && (
                    <div className={`article-expanded-overlay ${isClosing ? 'closing' : 'opening'}`} onClick = {closeArticle}>
                        <div className="article-expanded-content" onClick={(e) => e.stopPropagation()}>

                            <div className="article-expanded-image">
                                {selectedArticle.CoverImage ? (
                                    <img src={selectedArticle.CoverImage} alt={selectedArticle.Title} />
                                ) : (
                                    <div className="article-cover-placeholder">
                                        <h2>
                                            {String(
                                                articles.findIndex(
                                                    a => a.ID === selectedArticle.ID
                                                ) + 1
                                            ).padStart(3, '0')}
                                        </h2>
                                        <span>ARCHIVE</span>
                                    </div>
                                )}
                            </div>

                            <ArticleDetails article={selectedArticle} onClose={closeArticle} />

                        </div>
                    </div>
                )}
            </main>

        </>
    );
}