import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function AdminProtectedRoute() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        let ignore = false;

        async function checkAuth() {
            try {
                const response = await fetch(
                    'http://localhost:8080/admin/me',
                    {
                        credentials: 'include',
                    }
                );

                if (!ignore) {
                    setAuthenticated(response.ok);
                }
            } catch (error) {
                console.error('Authentication check failed:', error);

                if (!ignore) {
                    setAuthenticated(false);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        checkAuth();

        return () => {
            ignore = true;
        };
    }, []);

    if (loading) {
        return <div className="admin-loading">Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}