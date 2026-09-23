import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile } from '../../context/ProfileContext';
import { ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityLogoutConfirmation'>;

export function SecurityLogoutConfirmationScreen({ navigation }: Props) {
  const { profile } = useProfile();

  function handleSignBackIn() {
    // Completes the sign-out flow: reset the whole stack back to the pre-auth Welcome screen.
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.brandRow}>
        <View style={styles.brandBadge}>
          <Icon name="shield-check" size={16} color={colors.white} strokeWidth={2.25} />
        </View>
        <Text style={styles.brandText}>Verdant</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Icon name="check" size={48} color={colors.primary} strokeWidth={2.5} />
        </View>

        <Text style={styles.heading}>Signed Out Successfully</Text>

        <Text style={styles.subtitleLine}>You&apos;ve been safely signed out of</Text>
        <Text style={styles.subtitleBold}>{profile.storeName}</Text>
        <Text style={styles.seeYouAgain}>See you again!</Text>

        <View style={styles.infoBanner}>
          <Icon name="clock" size={16} color={colors.primaryDark} strokeWidth={2} />
          <Text style={styles.infoBannerText}>
            Your store remains active and continues to accept orders while you&apos;re signed out.
          </Text>
        </View>

        <Pressable style={styles.signBackInButton} onPress={handleSignBackIn}>
          <Text style={styles.signBackInText}>Sign Back In</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.huge,
    paddingTop: spacing.huge,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySurface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitleLine: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subtitleBold: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  seeYouAgain: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.huge,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    width: '100%',
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: '#A7DEC7',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.huge,
  },
  infoBannerText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.primaryDark,
    flex: 1,
    marginTop: 1,
  },
  signBackInButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signBackInText: {
    ...typography.button,
    color: colors.white,
  },
});
