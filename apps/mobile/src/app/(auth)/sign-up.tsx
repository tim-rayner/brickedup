import { makeRedirectUri } from 'expo-auth-session';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/brand';
import { getAuthErrorMessage } from '@/lib/auth-error';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const redirectTo = makeRedirectUri({ scheme: 'brickedup', path: 'auth/callback' });

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Supabase env vars are not configured.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace('/(onboarding)');
        return;
      }

      router.replace({
        pathname: '/(auth)/confirm-email',
        params: { email: email.trim() },
      });
    } catch (e) {
      setError(getAuthErrorMessage(e, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Email and password — we’ll email a 6-digit code before Onboarding."
      footer={
        <Text style={styles.switch}>
          Already have an account?{' '}
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </Text>
      }>
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Sign up"
        onPress={onSubmit}
        loading={loading}
        disabled={!email.trim() || password.length < 6}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  switch: {
    textAlign: 'center',
    color: Brand.inkMuted,
    fontSize: 15,
  },
  link: {
    color: Brand.brickDeep,
    fontWeight: '700',
  },
  error: {
    color: Brand.danger,
    fontSize: 14,
  },
});
