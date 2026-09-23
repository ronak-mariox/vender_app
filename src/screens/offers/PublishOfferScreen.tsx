import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PublishOffer'>;

const STEPS = ['Creating offer', 'Applying to products…', 'Notifying customers (queued)'];

export function PublishOfferScreen({ navigation }: Props) {
  const { publishDraft, resetDraft } = useOfferDraft();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const advance1 = setTimeout(() => setActiveStep(1), 500);
    const advance2 = setTimeout(() => setActiveStep(2), 1000);
    const finish = setTimeout(() => {
      const offer = publishDraft();
      resetDraft();
      navigation.replace('OfferPublished', { offerId: offer.id });
    }, 1600);
    return () => {
      clearTimeout(advance1);
      clearTimeout(advance2);
      clearTimeout(finish);
    };
  }, [navigation, publishDraft, resetDraft]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconRing}>
          <View style={styles.iconRingArc} />
        </View>

        <Text style={styles.heading}>Publishing your offer…</Text>
        <Text style={styles.subtitle}>This only takes a moment</Text>

        <View style={styles.stepsList}>
          {STEPS.map((label, index) => {
            const isDone = index < activeStep;
            const isActive = index === activeStep;
            return (
              <View key={label} style={styles.stepRow}>
                <View style={[styles.stepBadge, isDone && styles.stepBadgeDone, isActive && styles.stepBadgeActive]}>
                  {isDone ? (
                    <Icon name="check" size={13} color={colors.white} strokeWidth={3} />
                  ) : isActive ? (
                    <View style={styles.stepBadgeDot} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isDone && styles.stepLabelDone,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.huge,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  iconRingArc: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  heading: {
    ...typography.h3,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge,
    textAlign: 'center',
  },
  stepsList: {
    width: '100%',
    maxWidth: 280,
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepBadgeActive: {
    borderColor: colors.primary,
  },
  stepBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepLabelDone: {
    color: colors.primary,
  },
  stepLabelActive: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
});
