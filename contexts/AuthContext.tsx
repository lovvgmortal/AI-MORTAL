import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User, AuthChangeEvent, AuthResponse } from '@supabase/supabase-js';

interface Profile {
  gemini_api_key: string | null;
  openrouter_api_key: string | null;
  primary_provider: "gemini" | "openrouter" | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.id) { // ✅ Thay đổi: user?.id thay vì user
      setLoading(true);
      supabase
        .from('profiles')
        .select('gemini_api_key, openrouter_api_key, primary_provider')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
            console.error('Error fetching profile:', JSON.stringify(error, null, 2));
          }
          // data can be null if no profile exists, which is a valid state
          setProfile(data as Profile | null);
          setLoading(false);
        });
    } else {
      setProfile(null);
    }
  }, [user?.id]); // ✅ Thay đổi: [user?.id] thay vì [user]
  
  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };
  
  const signUp = async (email: string, pass: string): Promise<AuthResponse> => {
    const response = await supabase.auth.signUp({ 
        email, 
        password: pass,
    });
    if (response.error) throw response.error;
    return response;
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.id) throw new Error("User not logged in.");
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...data });
    
    if (error) {
        setLoading(false);
        throw error;
    }

    setProfile(prev => ({ ...prev, ...data } as Profile));
    setLoading(false);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    login,
    signUp,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};