'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabaseAnon as supabase } from './supabase-anon';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  github_username: string | null;
  website_url: string | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  primary_interest: 'building' | 'browsing' | 'learning' | 'sharing' | null;
  onboarded_at: string | null;
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

    // onAuthStateChange fires INITIAL_SESSION on mount — use it as the sole
    // source of truth so there's no race between getSession + the listener.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }
        if (session?.user) {
          try {
            const profile = await fetchProfile(session.user);
            setUser(profile);
          } catch (error) {
            console.error('Profile fetch error:', error);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
