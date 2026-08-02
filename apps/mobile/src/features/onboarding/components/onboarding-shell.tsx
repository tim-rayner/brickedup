import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

const TOTAL_STEPS = 6;

type OnboardingShellProps = {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  loading?: boolean;
  nextDisabled?: boolean;
};

export function OnboardingShell({
  step,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Continue',
  loading,
  nextDisabled,
}: OnboardingShellProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <View style={styles.navRow}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12}>
                <Text style={styles.back}>Back</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Text style={styles.stepLabel}>
              {step}/{TOTAL_STEPS}
            </Text>
            {onSkip ? (
              <Pressable onPress={onSkip} hitSlop={12}>
                <Text style={styles.skip}>Skip</Text>
              </Pressable>
            ) : (
              <View style={styles.skipPlaceholder} />
            )}
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]}
            />
          </View>
        </View>

        <Animated.View
          key={step}
          entering={FadeInRight.duration(280)}
          exiting={FadeOutLeft.duration(180)}
          style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.content}>{children}</View>
        </Animated.View>

        <View style={styles.footer}>
          <Button label={nextLabel} onPress={onNext} loading={loading} disabled={nextDisabled} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.paper,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  top: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    color: Brand.ink,
    fontWeight: '600',
    fontSize: 16,
  },
  skip: {
    color: Brand.brickDeep,
    fontWeight: '600',
    fontSize: 16,
  },
  skipPlaceholder: {
    width: 36,
  },
  stepLabel: {
    color: Brand.inkMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Brand.paperDeep,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Brand.brick,
    borderRadius: 999,
  },
  body: {
    flex: 1,
    paddingTop: Spacing.five,
    gap: Spacing.two,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: Brand.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: Brand.inkMuted,
    marginBottom: Spacing.two,
  },
  content: {
    flex: 1,
    gap: Spacing.three,
  },
  footer: {
    paddingVertical: Spacing.four,
  },
});
