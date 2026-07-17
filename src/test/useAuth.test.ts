import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.onAuthStateChange as Mock).mockImplementation((callback) => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));
  });

  it('should return initial loading state', () => {
    (supabase.auth.getSession as Mock).mockResolvedValueOnce({ data: { session: null }, error: null });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should set user when session exists', async () => {
    const mockSession: Session = {
      access_token: 'test-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'refresh-token',
      user: { id: 'user123', email: 'test@example.com' } as User,
      expires_at: Date.now() / 1000 + 3600,
    };
    (supabase.auth.getSession as Mock).mockResolvedValueOnce({ data: { session: mockSession }, error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockSession.user);
  });

  it('should clean up subscription on unmount', () => {
    (supabase.auth.getSession as Mock).mockResolvedValueOnce({ data: { session: null }, error: null });

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
