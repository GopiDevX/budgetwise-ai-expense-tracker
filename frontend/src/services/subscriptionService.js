import authService from './authService';
import { SUBSCRIPTION_ENDPOINTS } from '../config/api';

class SubscriptionService {
    getHeaders() {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async getSubscriptions() {
        try {
            const response = await fetch(SUBSCRIPTION_ENDPOINTS.BASE, {
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch subscriptions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw error;
        }
    }

    async createSubscription(subscription) {
        try {
            const response = await fetch(`${SUBSCRIPTION_ENDPOINTS.BASE}?categoryId=${subscription.categoryId}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(subscription)
            });
            if (!response.ok) throw new Error('Failed to create subscription');
            return await response.json();
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    async updateSubscription(id, subscription) {
        try {
            const response = await fetch(`${SUBSCRIPTION_ENDPOINTS.BASE}/${id}?categoryId=${subscription.categoryId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(subscription)
            });
            if (!response.ok) throw new Error('Failed to update subscription');
            return await response.json();
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    }

    async deleteSubscription(id) {
        try {
            const response = await fetch(`${SUBSCRIPTION_ENDPOINTS.BASE}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete subscription');
        } catch (error) {
            console.error('Error deleting subscription:', error);
            throw error;
        }
    }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;
