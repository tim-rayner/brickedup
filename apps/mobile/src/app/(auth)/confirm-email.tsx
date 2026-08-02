import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const onVerify = async () => {
    if (!email) return;
    setError(null);
    setVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'signup',
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
    setResending(true);
    try {
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
      title="Check your email"
      subtitle="Tap the confirmation link, or enter the 6-digit code from the same email."
      showBrand={false}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.panel}>
        <Text style={styles.copy}>
          We sent a link and a code{email ? ` to ${email}` : ''}. Tapping the link on this device
          works too, but the code below doesn&apos;t need a deep link — handy on a simulator with
          no real mailbox.
        </Text>
      </Animated.View>
      <TextField
        label="6-digit code"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Verify code"
        onPress={onVerify}
        loading={verifying}
        disabled={!email || code.trim().length !== 6}
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
});
