import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { ArticlePage } from './pages/ArticlePage';

function App() {

    return (
        <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/articles/:slug" element={<ArticlePage />} />
        </Routes>
        
        </>
    )
}

export default App;