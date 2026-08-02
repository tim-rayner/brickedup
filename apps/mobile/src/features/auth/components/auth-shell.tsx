import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBrand?: boolean;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  showBrand = true,
}: AuthShellProps) {
  return (
    <View style={styles.root}>
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            {showBrand ? (
              <Animated.View entering={FadeInDown.duration(450)} style={styles.brandBlock}>
                <ThemedText style={styles.brand}>Bricked Up</ThemedText>
              </Animated.View>
            ) : null}
            <Animated.View entering={FadeInDown.delay(80).duration(450)}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(140).duration(450)} style={styles.body}>
              {children}
            </Animated.View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.paper,
  },
  glow: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Brand.studSoft,
    opacity: 0.55,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  brandBlock: {
    marginBottom: Spacing.two,
  },
  brand: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '700',
    color: Brand.brick,
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    color: Brand.ink,
  },
  subtitle: {
    marginTop: Spacing.one,
    fontSize: 16,
    lineHeight: 22,
    color: Brand.inkMuted,
  },
  body: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
  },
});
