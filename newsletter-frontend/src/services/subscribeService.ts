import type { Subscriber } from "../types/subscriber";

const API_URL = import.meta.env.VITE_API_URL; 

export interface SubscribeRequest {
    email: string;
}

export const subscribe = async (email: string): Promise<void> => {
    const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        throw new Error('Subscription failed');
    }
};

export async function getSubscribers(): Promise<Subscriber[]> {
    const response = await fetch(`${API_URL}/subscribers`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
    }

    return response.json();
}