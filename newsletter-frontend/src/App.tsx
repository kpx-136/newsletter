
import { ArticleCard } from "./components/ArticleCard";
import Header from "./components/Header";

const articles = [
  {
    title: "heading1", 
    description: "yooooooooooo whassup?"
  }, 
  {
    title: "heading2", 
    description: "weeeeeeeeeeeeeeeee"
  }
];

function App() {
    return (
        <>
            <Header />

            <main>
                <h2>Welcome to the newsletter.</h2>
                <p>Ideas worth reading.</p>

                {
                  articles.map((article) => {
                    return (<ArticleCard title = {article.title} description = {article.description} />);
                  })
                }
            </main>
        </>
    );
}

export default App;