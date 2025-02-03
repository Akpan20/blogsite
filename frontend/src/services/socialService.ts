import apiClient from './apiClient';

export const socialService = {
  follow: (userId: string) => apiClient.post('/social/follow', { followingId: userId }),
  unfollow: (userId: string) => apiClient.delete(`/social/unfollow/${userId}`),
  getFollowers: (userId: string, params?: { page?: number; limit?: number }) => 
    apiClient.get(`/social/${userId}/followers`, { params }),
  getFollowing: (userId: string, params?: { page?: number; limit?: number }) => 
    apiClient.get(`/social/${userId}/following`, { params }),
};
