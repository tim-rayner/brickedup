import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const { user, bootstrap, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.meta}>{user?.email}</Text>
      <Text style={styles.meta}>
        Profile {bootstrap?.profile?.status ?? 'unknown'} · onboarding{' '}
        {bootstrap?.onboardingComplete ? 'complete' : 'incomplete'}
      </Text>
      <Button label="Sign out" variant="secondary" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.paper,
    padding: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.ink,
  },
  meta: {
    fontSize: 15,
    color: Brand.inkMuted,
  },
});
