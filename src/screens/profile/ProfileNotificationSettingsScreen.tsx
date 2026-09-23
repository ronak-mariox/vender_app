import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer, Switch } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import type { NotificationPref, NotificationPrefGroup } from '../../context/ProfileContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileNotificationSettings'>;

const GROUP_ORDER: NotificationPrefGroup[] = ['Orders', 'Inventory', 'Payments', 'System'];

export function ProfileNotificationSettingsScreen({ navigation }: Props) {
  const { notificationPrefs, toggleNotificationPref } = useProfile();

  const groups = GROUP_ORDER.map(group => ({
    group,
    items: notificationPrefs.filter(pref => pref.group === group),
  })).filter(entry => entry.items.length > 0);

  function handleSave() {
    // toggleNotificationPref already updates context state immediately on each
    // tap, so this is a confirmation affordance rather than a batched commit.
    Alert.alert('Saved', 'Your notification preferences have been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Notification Settings" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {groups.map(({ group, items }) => (
            <View key={group}>
              <Text style={styles.sectionHeader}>{group}</Text>
              <View style={styles.card}>
                {items.map((pref, index) => (
                  <NotificationRow
                    key={pref.key}
                    pref={pref}
                    isLast={index === items.length - 1}
                    onToggle={() => toggleNotificationPref(pref.key)}
                  />
                ))}
              </View>
            </View>
          ))}

          <View style={styles.infoBanner}>
            <Icon name="info" size={14} color={colors.warningDark} />
            <Text style={styles.infoBannerText}>Critical order notifications cannot be disabled.</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Save Preferences" onPress={handleSave} />
        </View>
      </View>
    </ScreenContainer>
  );
}

type NotificationRowProps = {
  pref: NotificationPref;
  isLast: boolean;
  onToggle: () => void;
};

function NotificationRow({ pref, isLast, onToggle }: NotificationRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={styles.rowTextColumn}>
        <View style={styles.rowLabelLine}>
          <Text style={styles.rowLabel}>{pref.label}</Text>
          {pref.locked ? <Icon name="lock" size={12} color={colors.textSecondary} /> : null}
        </View>
        <Text style={styles.rowDescription}>{pref.description}</Text>
      </View>
      {pref.locked ? (
        // Switch has no built-in disabled/locked state, so we wrap the shared
        // component in a non-interactive, dimmed container instead of adding
        // press handling here.
        <View pointerEvents="none" style={styles.lockedSwitch}>
          <Switch value onChange={() => {}} />
        </View>
      ) : (
        <Switch value={pref.enabled} onChange={onToggle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
    gap: 0,
  },
  sectionHeader: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTextColumn: {
    flex: 1,
    gap: 2,
  },
  rowLabelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  rowDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lockedSwitch: {
    opacity: 0.5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
  },
  infoBannerText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
