import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { ArticlePage } from './pages/ArticlePage';
import { SubscribeForm } from './components/SubscribeForm';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminArticles } from './pages/admin/AdminArticles';
import { AdminArticleNew } from './pages/admin/AdminArticleNew';
import { AdminArticleEdit } from './pages/admin/AdminArticleEdit';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminSubscribers } from './pages/admin/AdminSubscribers';
import { AdminProtectedRoute } from './pages/admin/components/AdminProtectedRoute';
import { NotFound } from './pages/NotFound';

function App() {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path = "/articles/:slug" element={<ArticlePage />} />
            <Route path = "/subscribe" element={<SubscribeForm />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element = {<AdminProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/articles" element={<AdminArticles />} />
                <Route path="/admin/articles/new" element={<AdminArticleNew />} />
                <Route path="/admin/articles/edit/:id" element={<AdminArticleEdit />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/subscribers" element={<AdminSubscribers />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default App;