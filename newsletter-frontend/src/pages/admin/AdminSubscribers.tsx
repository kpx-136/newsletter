import { useEffect, useState } from 'react';
import type { Subscriber } from '../../types/subscriber';
import { getSubscribers } from '../../services/subscribeService';

export function AdminSubscribers() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let ignore = false;

        async function fetchSubscribers() {
            try {
                const data = await getSubscribers();

                if (!ignore) {
                    setSubscribers(data);
                }
            } catch (err) {
                console.error(err);

                if (!ignore) {
                    setError('Could not load subscribers.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchSubscribers();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div className="admin-dashboard">
            <main className="admin-main">

                <header className="admin-topbar">
                    <span>ADMINISTRATION / SUBSCRIBERS</span>
                    <span>EDITOR</span>
                </header>

                <section className="admin-welcome">
                    <span className="admin-eyebrow">
                        AUDIENCE MANAGEMENT
                    </span>
                    <h1>Your readership.</h1>
                    <p>
                        The people who choose to read what you write.
                    </p>
                </section>

                <section className="admin-recent">

                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-eyebrow">
                                COMMUNITY
                            </span>
                            <h2>Subscribers</h2>
                        </div>

                        <span className="admin-article-status">
                            {subscribers.length} MEMBERS
                        </span>
                    </div>

                    {loading && (
                        <div className="admin-empty">
                            Gathering your readership...
                        </div>
                    )}

                    {error && (
                        <div className="admin-empty">
                            {error}
                        </div>
                    )}

                    {!loading && !error && subscribers.length === 0 && (
                        <div className="admin-empty">
                            <h3>A quiet beginning.</h3>
                            <p>
                                Nobody has subscribed just yet.
                                Your readership starts here.
                            </p>
                        </div>
                    )}

                    {!loading && !error && subscribers.length > 0 && (
                        <div className="admin-articles-list">

                            {subscribers.map((subscriber, index) => (
                                <div
                                    className="admin-article-row"
                                    key={subscriber.ID}
                                >
                                    <div className="admin-article-info">
                                        <span className="admin-eyebrow">
                                            MEMBER {String(index + 1).padStart(2, '0')}
                                        </span>

                                        <h3>{subscriber.Email}</h3>
                                    </div>

                                    <span className="admin-article-status">
                                        SUBSCRIBED
                                    </span>
                                </div>
                            ))}

                        </div>
                    )}

                </section>
            </main>
        </div>
    );
}