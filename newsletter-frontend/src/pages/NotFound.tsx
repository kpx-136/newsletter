import { useNavigate } from 'react-router-dom';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <main className="not-found">
            <span className="admin-eyebrow">404 / PAGE NOT FOUND</span>

            <h1>Well, this is awkward.</h1>

            <p>
                The page you're looking for doesn't exist,
                or perhaps it has wandered off somewhere.
            </p>

            <button onClick={() => navigate('/')}>
                Back to home →
            </button>
        </main>
    );
}