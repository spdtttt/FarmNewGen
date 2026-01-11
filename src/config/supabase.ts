import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient("https://wbprqrmvgusdhqjmyrfb.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicHJxcm12Z3VzZGhxam15cmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzODY5NTAsImV4cCI6MjA4MTk2Mjk1MH0.xJrXczDHhZv53TdKQu96H1URt-VcCM1wLSxB_jyxSRE", {
  auth: {
    // ใช้ AsyncStorage เพื่อเก็บ session
    storage: AsyncStorage,
    // Auto refresh token
    autoRefreshToken: true,
    // ตรวจสอบว่ามี session หรือไม่
    persistSession: true,
    // ตรวจจับการเปลี่ยนแปลง session
    detectSessionInUrl: false,
  },
});