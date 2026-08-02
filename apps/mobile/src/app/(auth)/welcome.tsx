import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.heroPlane} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.mark}
              contentFit="contain"
            />
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(180).duration(500)} style={styles.brand}>
            Bricked Up
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(260).duration(500)} style={styles.tagline}>
            Dating for AFOLs — build something real.
          </Animated.Text>
        </View>
        <Animated.View entering={FadeInUp.delay(340).duration(500)} style={styles.actions}>
          <Link href="/(auth)/sign-up" asChild>
            <Button label="Create account" />
          </Link>
          <Link href="/(auth)/sign-in" asChild>
            <Button label="Sign in" variant="secondary" />
          </Link>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.ink,
  },
  heroPlane: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.ink,
    borderBottomColor: Brand.brick,
    borderBottomWidth: 8,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  mark: {
    width: 72,
    height: 72,
    marginBottom: Spacing.two,
  },
  brand: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '700',
    color: Brand.white,
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 18,
    lineHeight: 26,
    color: '#C9D1D8',
    maxWidth: 300,
  },
  actions: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
});
