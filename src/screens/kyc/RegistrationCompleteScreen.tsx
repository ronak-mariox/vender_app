import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegistrationComplete'>;

const QUICK_ACTIONS: { icon: IconName; label: string }[] = [
  { icon: 'plus', label: 'Add Products' },
  { icon: 'credit-card', label: 'Payments' },
  { icon: 'truck', label: 'Delivery' },
];

export function RegistrationCompleteScreen({ navigation }: Props) {
  const { data } = useRegistration();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobMiddle]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.checkCircle}>
              <View style={styles.checkCircleInner}>
                <Icon name="check" size={40} color={colors.white} strokeWidth={3} />
              </View>
            </View>
            <Text style={styles.heading}>You're All Set!</Text>
            <Text style={styles.subtitle}>
              Your Verdant vendor account{'\n'}is now active and ready
            </Text>

            <View style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={styles.storeIcon}>
                  <Icon name="home" size={24} color={colors.white} />
                </View>
                <View style={styles.storeTextColumn}>
                  <Text style={styles.storeName}>{data.storeInfo?.storeName ?? 'Your Store'}</Text>
                  <Text style={styles.storeCategory}>
                    {data.businessInfo?.category ?? 'Grocery & Essentials'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={styles.statValueAccent}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Plan</Text>
                  <Text style={styles.statValue}>Starter</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Commission</Text>
                  <Text style={styles.statValue}>8%</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.map(action => (
                <View key={action.label} style={styles.actionButton}>
                  <Icon name={action.icon} size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              label="Continue to Dashboard"
              icon={<Icon name="arrow-right" size={18} color={colors.primary} />}
              onPress={() => navigation.replace('StoreSetupIntro')}
            />
            <Text style={styles.accountIdText}>Account ID: {data.referenceId ?? '—'}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTop: {
    width: 240,
    height: 240,
    top: -60,
    right: -80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobMiddle: {
    width: 280,
    height: 280,
    top: 200,
    left: -140,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  blobBottom: {
    width: 180,
    height: 180,
    bottom: -40,
    left: -60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xxl,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  checkCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 35.2,
    letterSpacing: -1.28,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: -spacing.lg,
  },
  storeCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.xl + 8,
    padding: spacing.xxl,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeTextColumn: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    ...typography.bodyLarge,
    fontFamily: fontFamilies.bold,
    color: colors.white,
  },
  storeCategory: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.6)',
  },
  statValue: {
    ...typography.bodySemibold,
    color: colors.white,
  },
  statValueAccent: {
    ...typography.bodySemibold,
    color: '#A7F3D0',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionLabel: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    gap: spacing.lg,
    alignItems: 'center',
  },
  accountIdText: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.5)',
  },
});
