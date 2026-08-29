import authService from './authService';
import { AI_ENDPOINTS } from '../config/api';

class AiService {
    getHeaders() {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async getAdvice(prompt) {
        try {
            const response = await fetch(AI_ENDPOINTS.ADVISOR, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to get advice');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Get advice error:', error);
            throw error;
        }
    }

    async getInsights() {
        try {
            const response = await fetch(AI_ENDPOINTS.INSIGHTS, {
                method: 'GET',
                headers: this.getHeaders(),
                cache: 'no-store'
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to get insights');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Get insights error:', error);
            throw error;
        }
    }

    async scanReceipt(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const token = authService.getToken();
            
            const response = await fetch(AI_ENDPOINTS.SCAN_RECEIPT, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to scan receipt');
            }

            return await response.json();
        } catch (error) {
            console.error('Scan receipt error:', error);
            throw error;
        }
    }
}

const aiService = new AiService();
export default aiService;
