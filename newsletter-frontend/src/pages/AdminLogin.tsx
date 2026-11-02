import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080';

export const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Login failed.');
            }

            navigate('/admin');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="admin-login">
            <div className="admin-login-card">

                <span className="admin-login-label">
                    NEWSLETTER ADMINISTRATION
                </span>

                <h1>Welcome back.</h1>

                <p>Sign in to manage your publication.</p>

                <form onSubmit={handleSubmit}>

                    <label htmlFor="email">Email address</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        required
                    />

                    <label htmlFor="password">Password</label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        required
                    />

                    {error && (
                        <p className="admin-login-error">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                </form>
            </div>
        </main>
    );
};