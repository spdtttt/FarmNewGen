import { supabase } from '@/src/config/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  requirePasswordReset: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    data: any;
    error: AuthError | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [requirePasswordReset, setRequirePasswordReset] = useState<boolean>(false);

  useEffect(() => {
    // ตรวจสอบ session ที่มีอยู่ตอนเปิดแอพ
    checkSession();

    // ฟัง auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'PASSWORD_RECOVERY') {
          setRequirePasswordReset(true);
        } else if (event === 'SIGNED_OUT') {
          setRequirePasswordReset(false);
        }
      }
    );



    // ... existing code ...

    // Deep Linking Handler
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('Deep link URL:', url);

      // Handle specific error cases from Supabase
      if (url.includes('error=access_denied') && url.includes('error_code=otp_expired')) {
        Alert.alert(
          'ลิงก์หมดอายุ',
          'ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุหรือถูกใช้งานไปแล้ว กรุณาขอลิงก์ใหม่',
          [{ text: 'ตกลง' }]
        );
        return;
      }

      // Handle generic errors
      if (url.includes('error=')) {
        const parts = url.split('#');
        if (parts.length > 1) {
          const hash = parts[1];
          const params: any = {};
          hash.split('&').forEach(part => {
            const [key, value] = part.split('=');
            params[key] = decodeURIComponent(value || '').replace(/\+/g, ' ');
          });

          if (params.error_description) {
            Alert.alert('แจ้งเตือน', params.error_description);
          } else {
            Alert.alert('แจ้งเตือน', 'เกิดข้อผิดพลาดในการยืนยันตัวตน');
          }
        }
        return;
      }

      if (url && url.includes('type=recovery')) {
        // Extract tokens from hash
        // URL format: scheme://path#access_token=...&refresh_token=...&type=recovery
        const parts = url.split('#');
        if (parts.length > 1) {
          const hash = parts[1];
          const params: any = {};
          hash.split('&').forEach(part => {
            const [key, value] = part.split('=');
            params[key] = value;
          });

          if (params.access_token && params.refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
            if (error) {
              console.error('Error setting session from deep link:', error);
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบด้วยลิงก์นี้ได้');
            }
          }
        }
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      listener?.subscription?.unsubscribe();
      sub.remove();
    };
  }, []);

  const checkSession = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน Sign Up
  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ data: any; error: AuthError | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน Sign In
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ data: any; error: AuthError | null }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน Sign Out
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน Reset Password
  const resetPassword = async (email: string) => {
    // สร้าง URL สำหรับ Redirect กลับมาที่ App
    const redirectUrl = Linking.createURL('reset-password');
    console.log('🔗 Redirect URL สำหรับใส่ใน Supabase:', redirectUrl);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { data, error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    requirePasswordReset,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook สำหรับใช้ Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};