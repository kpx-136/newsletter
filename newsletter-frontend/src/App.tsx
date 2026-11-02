import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { ArticlePage } from './pages/ArticlePage';
import { SubscribeForm } from './components/SubscribeForm';

function App() {

    return (
        <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/articles/:slug" element={<ArticlePage />} />
            <Route path = "/subscribe" element={<SubscribeForm />} />
        </Routes>
        
        </>
    )
}

export default App;