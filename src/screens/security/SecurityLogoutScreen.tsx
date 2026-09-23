import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile } from '../../context/ProfileContext';
import { useOrders } from '../../context/OrdersContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityLogout'>;

export function SecurityLogoutScreen({ navigation }: Props) {
  const { profile } = useProfile();
  const { ordersByStatus } = useOrders();
  const { unreadCount } = useNotifications();
  const { logout } = useVendorAuth();
  const [signingOut, setSigningOut] = useState(false);

  const pendingOrdersCount = ordersByStatus(['new']).length;
  const hasSummaryRows = pendingOrdersCount > 0 || unreadCount > 0;

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // Clears stored tokens and best-effort revokes the refresh token server-side.
      await logout();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'SecurityLogoutConfirmation' }] });
    }
  }

  function handleStaySignedIn() {
    navigation.goBack();
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Sign Out" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="log-out" size={44} color={colors.textSecondary} strokeWidth={1.75} />
        </View>

        <Text style={styles.heading}>Sign out of Verdant Vendor?</Text>

        <Text style={styles.subtitle}>
          You&apos;re currently signed in as <Text style={styles.subtitleBold}>{profile.owner.name}</Text> on
          this device.
        </Text>

        {hasSummaryRows ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Before you leave</Text>

            {pendingOrdersCount > 0 ? (
              <View style={styles.summaryRow}>
                <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                <Text style={styles.summaryText}>
                  {pendingOrdersCount} pending order{pendingOrdersCount === 1 ? '' : 's'} awaiting action
                </Text>
                <Pressable
                  style={styles.viewLinkWrap}
                  onPress={() => navigation.navigate('NewOrders')}
                  hitSlop={8}
                >
                  <Text style={styles.viewLink}>View →</Text>
                </Pressable>
              </View>
            ) : null}

            {unreadCount > 0 ? (
              <View style={[styles.summaryRow, pendingOrdersCount > 0 && styles.summaryRowSpacing]}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={styles.summaryText}>
                  {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                </Text>
                <Pressable
                  style={styles.viewLinkWrap}
                  onPress={() => navigation.navigate('Notifications')}
                  hitSlop={8}
                >
                  <Text style={styles.viewLink}>View →</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.footerCaption}>Your data is saved and you can sign back in anytime.</Text>

        <Pressable
          style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <Text style={styles.signOutButtonText}>{signingOut ? 'Signing Out…' : 'Sign Out'}</Text>
        </Pressable>

        <Pressable style={styles.stayButton} onPress={handleStaySignedIn}>
          <Text style={styles.stayButtonText}>Stay Signed In</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  subtitleBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textSecondary,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryRowSpacing: {
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
    flex: 1,
  },
  viewLinkWrap: {
    paddingLeft: spacing.md,
  },
  viewLink: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.primary,
  },
  footerCaption: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  signOutButton: {
    width: '100%',
    backgroundColor: colors.error,
    borderRadius: radii.md,
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    ...typography.button,
    color: colors.white,
  },
  stayButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
