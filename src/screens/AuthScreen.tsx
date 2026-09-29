import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Avatar, Button, Input, Logo, Screen, Txt } from '../components/ui';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { pickImage } from '../services/images';
import { signInWithProvider } from '../services/socialAuth';

type Mode = 'login' | 'register' | 'forgot';

export default function AuthScreen() {
  const t = useTheme();
  const { login, register, resetPassword, loginDemo } = useStore();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (mode === 'login') setError(login(email, password));
    else if (mode === 'register') setError(register(name, email, password, photo));
    else {
      const err = resetPassword(email);
      if (err) setError(err);
      else { Alert.alert('Pronto', 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.'); setMode('login'); }
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
          <Logo size={170} />
          <Txt size={30} weight="800" style={{ letterSpacing: 1 }}>DESAFIO 30</Txt>
          <Txt muted style={{ marginTop: 4 }}>Treine. Disputa. Evolua. 🔥</Txt>
        </View>

        {mode === 'register' && (
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Pressable onPress={async () => setPhoto((await pickImage()) ?? photo)} accessibilityLabel="Escolher foto">
              <Avatar name={name || '?'} photo={photo} size={84} />
            </Pressable>
            <Txt size={12} muted style={{ marginTop: 6 }}>Toque para adicionar foto</Txt>
          </View>
        )}
        {mode === 'register' && <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" autoCapitalize="words" />}
        <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        {mode !== 'forgot' && <Input label="Senha" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry />}

        {error ? <Txt color={t.danger} size={13} style={{ marginBottom: 10 }}>{error}</Txt> : null}

        <Button title={mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar link'} onPress={submit} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
          {mode === 'login' ? (
            <>
              <Pressable onPress={() => setMode('register')}><Txt color={t.primary} weight="700">Criar conta</Txt></Pressable>
              <Pressable onPress={() => setMode('forgot')}><Txt muted>Esqueci a senha</Txt></Pressable>
            </>
          ) : (
            <Pressable onPress={() => setMode('login')}><Txt color={t.primary} weight="700">← Voltar para entrar</Txt></Pressable>
          )}
        </View>

        {mode !== 'forgot' && (
          <View style={{ marginTop: 22, gap: 10 }}>
            <Button variant="secondary" title="  Entrar com Apple" onPress={() => signInWithProvider('apple')} />
            <Button variant="secondary" title="Entrar com Google" onPress={() => signInWithProvider('google')} />
            <Button variant="ghost" title="👀 Ver demonstração" onPress={loginDemo} />
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
