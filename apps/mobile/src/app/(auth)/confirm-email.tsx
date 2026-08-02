import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function ConfirmEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = (emailParam ?? '').trim();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onVerify = async () => {
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured) {
      setError('Supabase env vars are not configured.');
      return;
    }
    if (!email) {
      setError('Missing email — go back and sign up again.');
      return;
    }
    const code = token.replace(/\s/g, '');
    if (!/^\d{6,8}$/.test(code)) {
      setError('Enter the code from your email.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });
      if (verifyError) throw verifyError;
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not verify code');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured || !email) return;
    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) throw resendError;
      setInfo('A new code is on the way.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Enter your code"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}.`
          : 'We sent a 6-digit code to your email.'
      }
      showBrand={false}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.panel}>
        <TextField
          label="Confirmation code"
          value={token}
          onChangeText={setToken}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={8}
          placeholder="123456"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
        <Button
          label="Confirm email"
          onPress={onVerify}
          loading={loading}
          disabled={token.trim().length < 6}
        />
        <Button
          label="Resend code"
          variant="ghost"
          onPress={onResend}
          loading={resending}
          disabled={!email}
        />
      </Animated.View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 18,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.paperDeep,
  },
  error: {
    color: Brand.danger,
    fontSize: 14,
  },
  info: {
    color: Brand.success,
    fontSize: 14,
  },
});
