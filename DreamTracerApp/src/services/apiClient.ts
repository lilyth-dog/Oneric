/**
 * Shared API Client
 * Centralizes authentication, error handling, and base URL configuration.
 */
import Config from '../config/config';
import authService from './authService';

class ApiClient {
    /**
     * Request wrapper with automatic token injection and error handling
     */
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = endpoint.startsWith('http') ? endpoint : `${Config.API_BASE_URL}${endpoint}`;

        try {
            const token = await authService.getToken();

            const headers: Record<string, string> = {
                ...(options.headers as Record<string, string>),
            };

            // Don't set Content-Type if it's FormData (let fetch handle it)
            if (!(options.body instanceof FormData) && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `API request failed: ${response.status}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request Error (${endpoint}):`, error);
            throw error;
        }
    }
}

export default new ApiClient();
