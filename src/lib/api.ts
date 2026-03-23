const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Helper function to get auth token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rdm_token');
  }
  return null;
};

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    apiRequest<{ success: boolean; data: { user: any; token: string } }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest<{ success: boolean; data: { user: any; token: string; refreshToken?: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  refresh: (refreshToken: string) =>
    apiRequest<{ success: boolean; data: { token: string; refreshToken: string; user: any } }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  me: () =>
    apiRequest<{ success: boolean; data: any }>('/auth/me'),

  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    apiRequest<{ success: boolean; data: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest<{ success: boolean }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  verifyEmail: (token: string) =>
    apiRequest<{ success: boolean; message: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: () =>
    apiRequest<{ success: boolean; message: string }>('/auth/resend-verification', {
      method: 'POST',
    }),
};

// Businesses API
export const businessesApi = {
  getAll: (params?: { category?: string; isPremium?: boolean; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.isPremium) searchParams.set('isPremium', 'true');
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: any[]; pagination: any }>(`/businesses${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/businesses/${id}`),

  getCategories: () =>
    apiRequest<{ success: boolean; data: string[] }>('/businesses/categories'),

  create: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<{ success: boolean; data: any }>(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/businesses/${id}`, {
      method: 'DELETE',
    }),

  setPremium: (id: string, isPremium: boolean, premiumUntil?: string) =>
    apiRequest<{ success: boolean; data: any }>(`/businesses/${id}/premium`, {
      method: 'PUT',
      body: JSON.stringify({ isPremium, premiumUntil }),
    }),
};

// Markers/Places API
export const markersApi = {
  getAll: (params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: any[]; pagination?: any }>(`/markers${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/markers/${id}`),

  getCategories: () =>
    apiRequest<{ success: boolean; data: string[] }>('/markers/categories'),

  create: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/markers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<{ success: boolean; data: any }>(`/markers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/markers/${id}`, {
      method: 'DELETE',
    }),
};

// Events API
export const eventsApi = {
  getAll: (params?: { isFeatured?: boolean; startDate?: string; endDate?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.isFeatured) searchParams.set('isFeatured', 'true');
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: any[]; pagination?: any }>(`/events${query ? `?${query}` : ''}`);
  },

  getFeatured: () =>
    apiRequest<{ success: boolean; data: any[] }>('/events/featured'),

  getUpcoming: () =>
    apiRequest<{ success: boolean; data: any[] }>('/events/upcoming'),

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/events/${id}`),

  create: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<{ success: boolean; data: any }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/events/${id}`, {
      method: 'DELETE',
    }),

  setFeatured: (id: string, isFeatured: boolean) =>
    apiRequest<{ success: boolean; data: any }>(`/events/${id}/feature`, {
      method: 'PUT',
      body: JSON.stringify({ isFeatured }),
    }),
};

// Routes API
export const routesApi = {
  getAll: (params?: { difficulty?: string; isNightRoute?: boolean; isFamilyFriendly?: boolean; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
    if (params?.isNightRoute) searchParams.set('isNightRoute', 'true');
    if (params?.isFamilyFriendly) searchParams.set('isFamilyFriendly', 'true');
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: any[]; pagination?: any }>(`/routes${query ? `?${query}` : ''}`);
  },

  getFeatured: () =>
    apiRequest<{ success: boolean; data: any[] }>('/routes/featured'),

  getDifficulties: () =>
    apiRequest<{ success: boolean; data: string[] }>('/routes/difficulties'),

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/routes/${id}`),

  create: (data: any) =>
    apiRequest<{ success: boolean; data: any }>('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<{ success: boolean; data: any }>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/routes/${id}`, {
      method: 'DELETE',
    }),
};

// Posts API
export const postsApi = {
  getAll: (params?: { placeName?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.placeName) searchParams.set('placeName', params.placeName);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: any[]; pagination?: any }>(`/posts${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${id}`),

  getPlaces: () =>
    apiRequest<{ success: boolean; data: string[] }>('/posts/places'),

  create: (data: { placeName: string; content: string; imageUrl?: string }) =>
    apiRequest<{ success: boolean; data: any }>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { content?: string; imageUrl?: string }) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/posts/${id}`, {
      method: 'DELETE',
    }),

  like: (id: string) =>
    apiRequest<{ success: boolean; isLiked: boolean }>(`/posts/${id}/like`, {
      method: 'POST',
    }),

  comment: (id: string, content: string) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (postId: string, commentId: string) =>
    apiRequest<{ success: boolean }>(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // Admin moderation
  getAllAdmin: (params?: { isHidden?: boolean; isFeatured?: boolean; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.isHidden !== undefined) searchParams.set('isHidden', params.isHidden.toString());
    if (params?.isFeatured !== undefined) searchParams.set('isFeatured', params.isFeatured.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiRequest<{ success: boolean; data: any[]; pagination?: any }>(`/posts/admin/all${query ? `?${query}` : ''}`);
  },

  moderate: (id: string, data: { isHidden?: boolean; isFeatured?: boolean; isModerated?: boolean }) =>
    apiRequest<{ success: boolean; data: any }>(`/posts/${id}/moderate`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Newsletter API
export const newsletterApi = {
  subscribe: (data: { email: string; source?: string; name?: string }) =>
    apiRequest<{ success: boolean; message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unsubscribe: (email: string) =>
    apiRequest<{ success: boolean; message: string }>('/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  check: (email: string) =>
    apiRequest<{ success: boolean; data: { subscribed: boolean } }>(`/newsletter/check?email=${encodeURIComponent(email)}`),
};

// Payments API
export const paymentsApi = {
  getConfig: () =>
    apiRequest<{ success: boolean; data: any }>('/payments/config'),

  createDonation: (data: { amount: number; currency?: string; message?: string }) =>
    apiRequest<{ success: boolean; data: { sessionId: string; url: string } }>('/payments/donations/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createBusinessPremium: (data: { businessId: string; plan: 'monthly' | 'yearly'; currency?: string }) =>
    apiRequest<{ success: boolean; data: { sessionId: string; url: string } }>('/payments/business/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDonations: () =>
    apiRequest<{ success: boolean; data: any[] }>('/payments/donations'),

  getDonation: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/payments/donations/${id}`),
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File, folder?: string): Promise<{ url: string; key: string }> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data;
  },

  uploadBase64: (image: string, folder?: string) =>
    apiRequest<{ success: boolean; data: { url: string; key: string } }>('/upload/base64', {
      method: 'POST',
      body: JSON.stringify({ image, folder }),
    }),

  deleteImage: (key: string) =>
    apiRequest<{ success: boolean }>('/upload/image', {
      method: 'DELETE',
      body: JSON.stringify({ key }),
    }),
};

// AI/Realito API
export const aiApi = {
  query: (data: { message: string; sessionId?: string; context?: Record<string, any> }) =>
    apiRequest<{ success: boolean; data: { sessionId: string; message: any; actions?: any[]; knowledgeBase?: any } }>('/ai/query', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  chat: (data: { message: string; history?: any[] }) =>
    apiRequest<{ success: boolean; data: { message: string; actions?: any[]; context?: any } }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInfo: () =>
    apiRequest<{ success: boolean; data: any }>('/ai/info'),

  getSessions: () =>
    apiRequest<{ success: boolean; data: any[] }>('/ai/sessions'),

  getSession: (id: string) =>
    apiRequest<{ success: boolean; data: any }>(`/ai/sessions/${id}`),

  deleteSession: (id: string) =>
    apiRequest<{ success: boolean }>(`/ai/sessions/${id}`, {
      method: 'DELETE',
    }),
};

// SEO API
export const seoApi = {
  getMeta: (type: string, id?: string) => {
    const params = new URLSearchParams();
    params.set('type', type);
    if (id) params.set('id', id);
    return apiRequest<{ success: boolean; data: any }>(`/seo/meta?${params.toString()}`);
  },

  getSchema: (type: string, id?: string) => {
    const params = new URLSearchParams();
    params.set('type', type);
    if (id) params.set('id', id);
    return apiRequest<{ success: boolean; data: any }>(`/seo/schema/${type}${id ? `?id=${id}` : ''}`);
  },
};

// Analytics API
export const analyticsApi = {
  trackEvent: (eventType: string, metadata?: Record<string, any>) =>
    apiRequest<{ success: boolean }>('/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ eventType, metadata }),
    }),
};

export default {
  auth: authApi,
  businesses: businessesApi,
  markers: markersApi,
  events: eventsApi,
  routes: routesApi,
  posts: postsApi,
  newsletter: newsletterApi,
  payments: paymentsApi,
  upload: uploadApi,
  ai: aiApi,
  seo: seoApi,
  analytics: analyticsApi,
};
