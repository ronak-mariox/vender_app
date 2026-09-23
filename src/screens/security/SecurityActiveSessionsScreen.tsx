import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSecurity } from '../../context/SecurityContext';
import { IconCircle, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityActiveSessions'>;

export function SecurityActiveSessionsScreen({ navigation }: Props) {
  const { sessions, signOutSession, signOutAllOtherSessions } = useSecurity();

  const currentSession = sessions.find(session => session.isCurrentDevice);
  const otherSessions = sessions.filter(session => !session.isCurrentDevice);
  const deviceWord = sessions.length === 1 ? 'device' : 'devices';

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Active Sessions" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.caption}>
          {sessions.length} {deviceWord} signed in
        </Text>

        {currentSession ? (
          <View style={styles.currentCard}>
            <View style={styles.cardRow}>
              <IconCircle
                icon="smartphone"
                size={44}
                iconSize={20}
                iconColor={colors.white}
                backgroundColor={colors.primary}
              />
              <View style={styles.cardTextCol}>
                <Text style={styles.deviceLabel}>{currentSession.deviceLabel}</Text>
                <Text style={styles.location}>{currentSession.location}</Text>
                <View style={styles.activeRow}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active now</Text>
                  <View style={styles.thisDevicePill}>
                    <Text style={styles.thisDevicePillText}>This device</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {otherSessions.map(session => (
          <View key={session.id} style={styles.otherCard}>
            <View style={styles.cardRow}>
              <IconCircle
                icon="smartphone"
                size={44}
                iconSize={20}
                iconColor={colors.textSecondary}
                backgroundColor={colors.surface}
              />
              <View style={styles.cardTextCol}>
                <Text style={styles.deviceLabel}>{session.deviceLabel}</Text>
                <Text style={styles.location}>{session.location}</Text>
                <Text style={styles.lastActive}>{session.lastActiveLabel}</Text>
              </View>
              <Pressable onPress={() => signOutSession(session.id)} hitSlop={8} style={styles.signOutButton}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {otherSessions.length > 0 ? (
          <Pressable style={styles.signOutAllButton} onPress={signOutAllOtherSessions}>
            <Text style={styles.signOutAllText}>Sign Out All Other Devices</Text>
          </Pressable>
        ) : null}

        <View style={styles.warningBanner}>
          <Icon name="alert-triangle" size={16} color={colors.warning} strokeWidth={2} />
          <Text style={styles.warningText}>
            If you don&apos;t recognize a device, sign it out and change your PIN immediately.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  caption: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
  },
  currentCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  otherCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  cardTextCol: {
    flex: 1,
  },
  deviceLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lastActive: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  activeText: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.primary,
  },
  thisDevicePill: {
    marginLeft: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 1,
  },
  thisDevicePillText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  signOutButton: {
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  signOutText: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  signOutAllButton: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  signOutAllText: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  warningBanner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  warningText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
  },
});
