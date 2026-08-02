import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { Brand } from '@/constants/brand';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, bootstrap, loading, accountLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (loading || (session && accountLoading)) return;

    const group = segments[0];
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';
    const onboardingComplete = Boolean(bootstrap?.onboardingComplete);

    if (!session) {
      if (!inAuth) router.replace('/(auth)/welcome');
      return;
    }

    if (!onboardingComplete) {
      if (!inOnboarding) router.replace('/(onboarding)');
      return;
    }

    if (inAuth || inOnboarding || !group) {
      router.replace('/(app)');
    }
  }, [session, bootstrap?.onboardingComplete, loading, accountLoading, segments, router]);

  if (loading || (session && accountLoading && !bootstrap)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Brand.paper,
        }}>
        <ActivityIndicator color={Brand.brick} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
