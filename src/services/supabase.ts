import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cliente Supabase (backend real). As chaves vêm de variáveis de ambiente (.env).
 * Sem chaves configuradas, o app roda 100% local (modo demonstração).
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anon);

export const supabase = supabaseEnabled
  ? createClient(url as string, anon as string, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;
