import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/apiClient';

// ============================================
// COMMUNITY POSTS HOOKS
// ============================================

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  placeName?: string;
  likes: number;
  comments: number;
  isFeatured: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostFilters {
  search?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
}

export function useCommunityPosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(filters as Record<string, any>),
    queryFn: () => apiClient.get<{ success: boolean; data: Post[]; pagination: any }>('/posts', filters as Record<string, any>),
    select: (res) => res?.data || [],
  });
}

export function useFeaturedPosts() {
  return useQuery({
    queryKey: queryKeys.posts.featured(),
    queryFn: () => apiClient.get<{ success: boolean; data: Post[] }>('/posts/featured'),
    select: (res) => res?.data || [],
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => apiClient.get<{ success: boolean; data: Post }>(`/posts/${id}`),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Post>) => apiClient.post<Post>('/posts', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.posts.all }); },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) => apiClient.put<Post>(`/posts/${id}`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/posts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.posts.all }); },
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<void>(`/posts/${id}/like`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.posts.all }); },
  });
}

// ============================================
// DICHOS HOOKS
// ============================================

export interface Dichos {
  id: string;
  personaje: string;
  texto: string;
  significado: string;
  jergaOriginal: string;
  categoria: string;
  likes: number;
  createdAt: string;
}

export interface DichosFilters {
  categoria?: string;
  search?: string;
  personaje?: string;
  limit?: number;
  offset?: number;
}

export function useDichos(filters: DichosFilters = {}) {
  return useQuery({
    queryKey: queryKeys.dichos.list(filters as Record<string, any>),
    queryFn: () => apiClient.get<{ success: boolean; data: Dichos[]; pagination: any }>('/dichos', filters as Record<string, any>),
    select: (res) => res?.data || [],
  });
}

export function useDichosById(id: string) {
  return useQuery({
    queryKey: queryKeys.dichos.detail(id),
    queryFn: () => apiClient.get<{ success: boolean; data: Dichos }>(`/dichos/${id}`),
    enabled: !!id,
  });
}

export function useCreateDichos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Dichos>) => apiClient.post<Dichos>('/dichos', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.dichos.all }); },
  });
}

export function useLikeDichos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<void>(`/dichos/${id}/like`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.dichos.all }); },
  });
}

// ============================================
// NEWSLETTER HOOKS
// ============================================

export function useNewsletterSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => apiClient.post<{ success: boolean; message: string }>('/newsletter/subscribe', { email }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.newsletter.subscribers() }); },
  });
}

export function useNewsletterUnsubscribe() {
  return useMutation({
    mutationFn: (email: string) => apiClient.post<{ success: boolean; message: string }>('/newsletter/unsubscribe', { email }),
  });
}

// ============================================
// PAYMENTS HOOKS
// ============================================

export function useDonationCheckout() {
  return useMutation({
    mutationFn: (data: { amount: number; isMonthly: boolean; message?: string }) =>
      apiClient.post<{ sessionId: string; url: string }>('/payments/donations/checkout', data),
  });
}

export function useBusinessPremiumCheckout() {
  return useMutation({
    mutationFn: ({ businessId, plan }: { businessId: string; plan: 'monthly' | 'yearly' }) =>
      apiClient.post<{ sessionId: string; url: string }>(`/payments/businesses/${businessId}/checkout`, { plan }),
  });
}

// ============================================
// ADMIN HOOKS
// ============================================

export interface AdminStats {
  totalBusinesses: number;
  activeBusinesses: number;
  pendingBusinesses: number;
  premiumBusinesses: number;
  totalUsers: number;
  totalPosts: number;
  totalEvents: number;
}

export interface AdminFilters {
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  limit?: number;
  offset?: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => apiClient.get<AdminStats>('/admin/stats'),
  });
}

export function useAdminBusinesses(filters: AdminFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin.businesses(), filters],
    queryFn: () => apiClient.get<{ success: boolean; data: any[]; pagination: any }>('/admin/businesses', filters as Record<string, any>),
    select: (res) => res?.data || [],
  });
}

export function useApproveBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<{ success: boolean }>(`/admin/businesses/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useRejectBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post<{ success: boolean }>(`/admin/businesses/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useFeatureBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      apiClient.post<{ success: boolean }>(`/admin/businesses/${id}/feature`, { isFeatured }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() }); },
  });
}

export function useModeratePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'hidden' | 'visible' | 'featured' }) =>
      apiClient.patch<{ success: boolean }>(`/admin/posts/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.posts() });
      qc.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// ============================================
// ADMIN BUSINESS CRUD HOOKS
// ============================================

export interface BusinessInput {
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  addressReference?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  videoUrl?: string;
  scheduleDisplay?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  priceRange?: string;
}

export function useCreateBusinessAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessInput) => apiClient.post<{ success: boolean; id: string }>('/admin/businesses', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useUpdateBusinessAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessInput> }) =>
      apiClient.put<{ success: boolean }>(`/admin/businesses/${id}`, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.business(id) });
    },
  });
}

export function useDeleteBusinessAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ success: boolean }>(`/admin/businesses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useToggleBusinessStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch<{ success: boolean }>(`/admin/businesses/${id}/status`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useToggleBusinessPremium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPremium }: { id: string; isPremium: boolean }) =>
      apiClient.patch<{ success: boolean }>(`/admin/businesses/${id}/premium`, { isPremium }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      qc.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}
