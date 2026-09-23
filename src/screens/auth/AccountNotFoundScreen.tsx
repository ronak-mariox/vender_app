import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, IconCircle, NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'AccountNotFound'>;

export function AccountNotFoundScreen({ navigation, route }: Props) {
  const { mobileNumber } = route.params;

  // This screen is reached from the OTP "login" (recovery) intent, so we don't yet
  // hold a signup-purpose verifiedPhoneToken — route back through the mobile number
  // step with intent "create-account" so a fresh OTP verification can mint one before
  // CreateAccountScreen submits to /vendor/auth/register.
  function handleCreateAccount() {
    navigation.replace('MobileNumber', { intent: 'create-account' });
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Account Not Found" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <IconCircle
            icon="user"
            size={80}
            iconSize={36}
            iconColor={colors.textSecondary}
            backgroundColor={colors.surfaceAlt}
            dashed
            badge={
              <View style={styles.xBadge}>
                <Icon name="x-circle" size={14} color={colors.error} />
              </View>
            }
          />
          <Text style={styles.heading}>Account Not Found</Text>
          <Text style={styles.subtitle}>
            No vendor account is linked to{'\n'}
            <Text style={styles.subtitleValue}>+91 {formatMobile(mobileNumber)}</Text>
          </Text>
        </View>

        <View style={styles.optionsList}>
          <OptionCard
            icon="user-plus"
            emphasized
            title="Create a new account"
            description="Register as a vendor and start selling on Verdant in minutes"
            onPress={handleCreateAccount}
          />
          <OptionCard
            icon="phone"
            title="Try a different number"
            description="Use another mobile number that may be registered"
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={styles.footer}>
          <Button label="Create Vendor Account" onPress={handleCreateAccount} />
          <Button
            label="Contact Support"
            variant="text"
            onPress={() => Alert.alert('Contact Support', 'Support contact coming soon.')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function OptionCard({
  icon,
  title,
  description,
  onPress,
  emphasized = false,
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
  emphasized?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionCard, emphasized ? styles.optionCardEmphasized : styles.optionCardPlain]}
    >
      <View style={[styles.optionIcon, emphasized && styles.optionIconEmphasized]}>
        <Icon name={icon} size={22} color={emphasized ? colors.white : colors.textSecondary} />
      </View>
      <View style={styles.optionTextColumn}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

function formatMobile(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.huge,
  },
  xBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  subtitleValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  optionsList: {
    gap: spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1.5,
  },
  optionCardEmphasized: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryBorder,
  },
  optionCardPlain: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconEmphasized: {
    backgroundColor: colors.primary,
  },
  optionTextColumn: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.captionSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
});
