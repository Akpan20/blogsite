import apiClient from './apiClient';

export const subscriptionService = {
  create: (targetUserId: string) => apiClient.post('/subscriptions', { targetUserId }),
  getMySubscriptions: (params?: { page?: number; limit?: number }) => 
    apiClient.get('/subscriptions/my-subscriptions', { params }),
  getMySubscribers: (params?: { page?: number; limit?: number }) => 
    apiClient.get('/subscriptions/my-subscribers', { params }),
};
