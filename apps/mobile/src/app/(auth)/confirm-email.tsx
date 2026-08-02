import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthShell
      title="Check your email"
      subtitle="Open the confirmation link to continue into Onboarding."
      showBrand={false}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.panel}>
        <Text style={styles.copy}>
          We sent a link{email ? ` to ${email}` : ''}. After you confirm, this app will pick up your
          session automatically.
        </Text>
      </Animated.View>
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
});
