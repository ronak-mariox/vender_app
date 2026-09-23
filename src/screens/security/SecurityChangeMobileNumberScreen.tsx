import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSecurity } from '../../context/SecurityContext';
import { Button, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { isValidMobile, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityChangeMobileNumber'>;

type Errors = FormErrors<'newNumber'>;

function maskMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return `+91 ****${last4}`;
}

function formatMobile10(digits: string): string {
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function SecurityChangeMobileNumberScreen({ navigation }: Props) {
  const { mobileNumber } = useSecurity();
  const [newNumber, setNewNumber] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function handleSendOtp() {
    if (!isValidMobile(newNumber)) {
      setErrors({ newNumber: 'Enter a valid 10-digit mobile number' });
      return;
    }
    setErrors({});
    navigation.navigate('SecurityChangeMobileOtp', {
      newMobileNumber: formatMobile10(newNumber),
    });
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Change Mobile Number" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.stepRow}>
          <View style={styles.stepItem}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepCircleActiveText}>1</Text>
            </View>
            <Text style={styles.stepLabelActive}>Enter new number</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.stepItem}>
            <View style={styles.stepCircleInactive}>
              <Text style={styles.stepCircleInactiveText}>2</Text>
            </View>
            <Text style={styles.stepLabelInactive}>Verify OTP</Text>
          </View>
        </View>

        <View style={styles.currentBox}>
          <Text style={styles.currentLabel}>Current mobile number</Text>
          <Text style={styles.currentValue}>{maskMobile(mobileNumber)}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New mobile number</Text>
          <View style={[styles.inputRow, errors.newNumber && styles.inputRowError]}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <View style={styles.divider} />
            <TextInput
              style={styles.phoneInputText}
              value={newNumber}
              onChangeText={text => {
                setNewNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
                if (errors.newNumber) setErrors({});
              }}
              placeholder="Enter 10-digit number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {errors.newNumber ? (
            <Text style={styles.errorText}>{errors.newNumber}</Text>
          ) : (
            <Text style={styles.helperText}>An OTP will be sent to this number.</Text>
          )}
        </View>

        <InfoBanner
          variant="warning"
          message="This will change your login number. Your old number will receive a security alert."
        />

        <View style={styles.footer}>
          <Button label="Send OTP" onPress={handleSendOtp} />
          <Text style={styles.footerCaption}>
            Your old number will receive a security alert when this change is confirmed.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  stepCircleActive: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActiveText: {
    ...typography.captionBold,
    color: colors.white,
  },
  stepLabelActive: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  stepCircleInactive: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleInactiveText: {
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  stepLabelInactive: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
  },
  currentBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.xxs,
  },
  currentLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  currentValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  inputRowError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: '100%',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  flag: {
    fontSize: 18,
  },
  countryCodeText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  phoneInputText: {
    ...typography.phoneDigit,
    flex: 1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  footerCaption: {
    ...typography.caption,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
