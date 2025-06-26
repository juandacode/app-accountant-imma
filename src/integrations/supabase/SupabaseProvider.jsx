import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [supabase, setSupabase] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      setLoading(true);
      setError(null);
      
      const SUPABASE_URL = "https://nzeznexjuzrnnrvfekkn.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZXpuZXhqdXpybm5ydmZla2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDk1OTQsImV4cCI6MjA2NTE4NTU5NH0.Kwr6hMlMoUqByYdaKm28LGC3vszOC6wDzhD5ugDljz8";

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        const errorMessage = "Error Crítico: Las credenciales de Supabase (URL o Anon Key) no están definidas. La conexión no puede ser establecida.";
        console.error(errorMessage);
        setError(new Error(errorMessage));
        setSupabase(null);
        setLoading(false);
        return;
      }
      
      try {
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        setSupabase(supabaseClient);
        
        const { data: { session: currentSession }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
          console.error("Error al obtener la sesión de Supabase:", sessionError);
          setError(sessionError);
        } else {
          setSession(currentSession);
        }
        
        setLoading(false);

        const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };

      } catch (e) {
        console.error("Error fatal al inicializar Supabase o al conectar:", e);
        setError(e);
        setSupabase(null);
        setLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  const value = {
    supabase,
    session,
    error,
    loading,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};