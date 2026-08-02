import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/brand';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep building your Profile."
      footer={
        <Text style={styles.switch}>
          New here?{' '}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Create an account
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
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Sign in"
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
