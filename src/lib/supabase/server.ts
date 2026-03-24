// Trong Next.js, file này sẽ dùng @supabase/ssr để tạo server client
// Do môi trường hiện tại là SPA (Vite), ta tạm dùng client chung
import { supabase } from './client';

export const createServerSupabaseClient = () => {
  return supabase;
};
