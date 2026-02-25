import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase.js';

const AuthContext = createContext(null);

/**
 * Provides auth state (user, session, role) and helpers (signIn, signOut)
 * to the entire component tree.
 */
export function AuthProvider({ children }) {
  const [session, setSession]     = useState(null);
  const [user, setUser]           = useState(null);
  const [userRole, setUserRole]   = useState(null);
  const [userClubId, setUserClubId] = useState(null);
  const [isExecApproved, setIsExecApproved] = useState(false);
  const [loading, setLoading]     = useState(true);

  // Fetch extended user profile (role, club_id) from users table
  async function fetchProfile(userId) {
    if (!userId) {
      setUserRole(null);
      setUserClubId(null);
      setIsExecApproved(false);
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('role, club_id, is_exec_approved')
      .eq('id', userId)
      .single();

    setUserRole(data?.role ?? null);
    setUserClubId(data?.club_id ?? null);
    setIsExecApproved(data?.is_exec_approved ?? false);
  }

  useEffect(() => {
    // Bootstrap from existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      fetchProfile(s?.user?.id ?? null).finally(() => setLoading(false));
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      fetchProfile(s?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password, role = 'student', clubId = null) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data?.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        role,
        club_id: clubId || null,
        is_exec_approved: false,
      });
      if (profileError) throw profileError;
    }
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    user,
    userRole,
    userClubId,
    isExecApproved,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: userRole === 'admin',
    isExec: userRole === 'club_exec' && isExecApproved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;
