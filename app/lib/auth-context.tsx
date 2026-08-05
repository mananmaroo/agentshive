'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabaseAnon as supabase } from './supabase-anon';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  primary_interest: 'building' | 'browsing' | 'learning' | 'sharing' | null;
  onboarded_at: string | null;
  badges: string[];
  badges_acknowledged: string[];
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const authEpoch = useRef(0);

  useEffect(() => {
    const fetchProfile = async (sessionUser: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    }) => {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (profile) return profile as UserProfile;

      // Row not created yet (race with the auth callback, or first login).
      // Self-heal so the UI never gets stuck as "not signed in".
      const meta = sessionUser.user_metadata || {};
      const username =
        (meta.user_name as string) ||
        (meta.preferred_username as string) ||
        (meta.name as string) ||
        (sessionUser.email ? sessionUser.email.split('@')[0] : `user_${sessionUser.id.slice(0, 8)}`);

      const { data: created } = await supabase
        .from('users')
        .upsert(
          {
            id: sessionUser.id,
            username,
            email: sessionUser.email,
            avatar_url: (meta.avatar_url as string) ?? null,
            github_username: (meta.user_name as string) ?? null,
          },
          { onConflict: 'id' }
        )
        .select('*')
        .maybeSingle();

      return (created as UserProfile) ?? null;
    };

    let cancelled = false;
    const pending = new Set<number>();

    const handleAuthChange = async (
      event: string,
      session: { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null
    ) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        authEpoch.current += 1;
        setUser(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        const epoch = ++authEpoch.current;
        try {
          const profile = await fetchProfile(session.user);
          if (!cancelled && epoch === authEpoch.current) setUser(profile);
        } catch (error) {
          console.error('Profile fetch error:', error);
        }
      }
      if (!cancelled) setLoading(false);
    };

    // Supabase holds an internal auth lock while invoking this callback.
    // Return immediately, then perform profile queries on the next task so
    // later RPC calls cannot wait forever behind the auth callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const timer = window.setTimeout(() => {
        pending.delete(timer);
        void handleAuthChange(event, session);
      }, 0);
      pending.add(timer);
    });

    return () => {
      cancelled = true;
      pending.forEach((timer) => window.clearTimeout(timer));
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Invalidate any in-flight profile lookup before clearing the session.
    // Do not navigate until Supabase confirms that the local session is gone.
    authEpoch.current += 1;
    setUser(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
