import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { getAuthErrorMessage } from '@/lib/auth-error';
import { supabase } from '@/lib/supabase';

export default function ConfirmEmailScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = useMemo(() => (emailParam ?? '').trim().toLowerCase(), [emailParam]);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const normalizedCode = code.replace(/\s/g, '');

  const onVerify = async () => {
    if (!email) return;
    setError(null);
    setVerifying(true);
    try {
      // `signup` / `magiclink` are deprecated — use `email` for confirm-signup OTPs.
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: normalizedCode,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      router.replace('/(onboarding)');
    } catch (e) {
      setError(getAuthErrorMessage(e, 'Could not verify code'));
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    if (!email) return;
    setError(null);
    setResent(false);
    setResending(true);
    try {
      // Resend still uses the signup confirmation mailer.
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
      if (resendError) throw resendError;
      setResent(true);
    } catch (e) {
      setError(getAuthErrorMessage(e, 'Could not resend code'));
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
        <Text style={styles.copy}>
          Enter the code from the email. If it keeps failing, tap Resend — a confirmation link in
          the same email can invalidate the code if an email client opens it first.
        </Text>
      </Animated.View>
      <TextField
        label="6-digit code"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={8}
        value={code}
        onChangeText={setCode}
        placeholder="123456"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {resent ? <Text style={styles.info}>New code sent — use the latest email.</Text> : null}
      <Button
        label="Verify code"
        onPress={onVerify}
        loading={verifying}
        disabled={!email || !/^\d{6,8}$/.test(normalizedCode)}
      />
      <Button
        label={resent ? 'Code resent' : 'Resend code'}
        variant="ghost"
        onPress={onResend}
        loading={resending}
        disabled={!email || resending}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.four,
    borderRadius: 18,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.paperDeep,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: Brand.ink,
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
