import { useState } from 'react';
import { subscribe } from '../services/subscribeService';
import { Header } from './Header';

export const SubscribeForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) return;

        setLoading(true);
        setMessage('');
        setError('');

        try {
            await subscribe(email.trim());
            setMessage("You're on the list! Thank you for subscribing ♡");
            setEmail('');
        } catch (err) {
            console.error('Subscription error:', err);
            setError('Could not subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='subscribe-page'>
            <Header />
            <section className="subscribe-section">
                <div className="subscribe-card">
                    <span className="subscribe-label">STAY IN THE LOOP</span>

                    <h2>A little something for your inbox.</h2>

                    <p>
                        Get the latest stories and updates delivered
                        straight to your email.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? 'Subscribing...' : 'Subscribe →'}
                        </button>
                    </form>

                    {error && (
                        <p className="subscribe-error">{error}</p>
                    )}

                    {message && (
                        <p className="subscribe-success">{message}</p>
                    )}

                    <span className="subscribe-note">
                        No spam. Just things worth reading.
                    </span>
                </div>
            </section>
        </div>
        
    );
};