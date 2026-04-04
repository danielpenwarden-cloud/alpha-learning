import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'demo',
  email: 'demo@alpha.local',
  isDemo: true,
  user_metadata: { display_name: 'Demo Parent' },
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) {
      // Offline mode — auto-login with mock user
      setUser({ id: 'offline', email: 'demo@alpha.local', user_metadata: { display_name: 'Dan' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Detect password recovery flow
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsDemo = useCallback(() => {
    setUser(DEMO_USER);
    setIsDemo(true);
  }, []);

  const exitDemo = useCallback(() => {
    setUser(null);
    setSession(null);
    setIsDemo(false);
  }, []);

  const clearRecovery = useCallback(() => {
    setIsRecovery(false);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, isDemo, isRecovery, loginAsDemo, exitDemo, clearRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
