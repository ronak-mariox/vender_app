import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreSetupIntro'>;

const CHECKLIST: { icon: IconName; title: string; subtitle: string }[] = [
  { icon: 'home', title: 'Store Profile', subtitle: 'Name, description & category' },
  { icon: 'image', title: 'Store Branding', subtitle: 'Logo & cover image' },
  { icon: 'pin', title: 'Store Address', subtitle: 'Location & GPS pin' },
  { icon: 'clock', title: 'Operating Hours', subtitle: 'Schedule & holidays' },
  { icon: 'truck', title: 'Delivery Settings', subtitle: 'Fulfillment & charges' },
  { icon: 'globe', title: 'Service Area', subtitle: 'Coverage & availability' },
  { icon: 'sliders', title: 'Store Status', subtitle: 'Go live when ready' },
];

export function StoreSetupIntroScreen({ navigation }: Props) {
  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.primarySurface, colors.surface]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroIcon}>
          <Icon name="home" size={36} color={colors.white} />
        </View>
        <Text style={styles.heroTitle}>Set Up Your Store</Text>
        <Text style={styles.heroSubtitle}>
          Complete your store profile to start receiving orders on Verdant
        </Text>
        <View style={styles.statsRow}>
          <Stat value="7" label="Steps" />
          <Stat value="~10" label="Minutes" />
          <Stat value="100%" label="Free" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>What you'll complete</Text>
        <View style={styles.checklist}>
          {CHECKLIST.map((item, index) => (
            <View
              key={item.title}
              style={[styles.checklistRow, index < CHECKLIST.length - 1 && styles.checklistDivider]}
            >
              <View style={styles.checklistIcon}>
                <Icon name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.checklistTextColumn}>
                <Text style={styles.checklistTitle}>{item.title}</Text>
                <Text style={styles.checklistSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.checklistCircle} />
            </View>
          ))}
        </View>

        <View style={styles.infoBanner}>
          <Icon name="info" size={14} color={colors.primaryDark} />
          <Text style={styles.infoText}>
            You can save progress and return anytime. Your store won't go live until you click
            "Publish".
          </Text>
        </View>

        <View style={styles.footer}>
          <Button label="Start Store Setup" onPress={() => navigation.navigate('StoreProfile')} />
          <Button
            label="I'll do this later"
            variant="text"
            onPress={() => navigation.replace('Dashboard')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.huge,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 24,
    lineHeight: 36,
    letterSpacing: -0.72,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingTop: spacing.xxl,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.h2,
    fontSize: 18,
    lineHeight: 27,
    color: colors.primary,
  },
  statLabel: {
    ...typography.tiny,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  checklist: {
    paddingTop: spacing.md,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  checklistDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checklistIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistTextColumn: {
    flex: 1,
    gap: 1,
  },
  checklistTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  checklistSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  checklistCircle: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  footer: {
    gap: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
});
