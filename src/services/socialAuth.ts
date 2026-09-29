import { Alert } from 'react-native';
import { supabase } from './supabase';

/**
 * Estrutura para Entrar com Apple / Google.
 * Requer configuração nos provedores + Supabase (ver README, seção "Login social").
 */
export async function signInWithProvider(provider: 'apple' | 'google') {
  if (!supabase) {
    Alert.alert('Configuração pendente', `Configure o Supabase e o provedor ${provider === 'apple' ? 'Apple' : 'Google'} (veja o README) para ativar este login.`);
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) Alert.alert('Erro', error.message);
}
