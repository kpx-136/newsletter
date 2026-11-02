import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { ArticlePage } from './pages/ArticlePage';
import { SubscribeForm } from './components/SubscribeForm';
import { AdminLogin } from './pages/AdminLogin';

function App() {

    return (
        <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/articles/:slug" element={<ArticlePage />} />
            <Route path = "/subscribe" element={<SubscribeForm />} />
            <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
        
        </>
    )
}

export default App;