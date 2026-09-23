import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSecurity } from '../../context/SecurityContext';
import { Button, NavHeader, PinInput, ScreenContainer } from '../../components';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityChangePin'>;

const PIN_LENGTH = 4;

export function SecurityChangePinScreen({ navigation }: Props) {
  const { changePin } = useSecurity();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const mismatch =
    confirmPin.length === PIN_LENGTH && newPin.length === PIN_LENGTH && confirmPin !== newPin;

  const canSubmit =
    currentPin.length === PIN_LENGTH &&
    newPin.length === PIN_LENGTH &&
    confirmPin.length === PIN_LENGTH &&
    newPin === confirmPin;

  function handleUpdatePin() {
    if (!canSubmit) return;
    changePin(newPin);
    Alert.alert('PIN Updated', 'Your PIN has been changed successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ScreenContainer scrollable>
      <NavHeader title="Change PIN" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current PIN</Text>
          <PinInput length={PIN_LENGTH} value={currentPin} onChange={setCurrentPin} autoFocus />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New PIN</Text>
          <PinInput length={PIN_LENGTH} value={newPin} onChange={setNewPin} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm New PIN</Text>
          <PinInput
            length={PIN_LENGTH}
            value={confirmPin}
            onChange={setConfirmPin}
            status={mismatch ? 'error' : 'default'}
          />
          {mismatch ? (
            <Text style={styles.errorText}>New PIN and Confirm PIN do not match.</Text>
          ) : null}
        </View>

        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsHeading}>PIN Requirements</Text>
          <Text style={styles.requirementsBullet}>• Use a unique 4-digit PIN</Text>
          <Text style={styles.requirementsBullet}>• Do not share your PIN with anyone</Text>
          <Text style={styles.requirementsBullet}>• Do not use sequential numbers (e.g. 1234)</Text>
        </View>

        <View style={styles.footer}>
          <Button label="Update PIN" onPress={handleUpdatePin} disabled={!canSubmit} />
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
  fieldGroup: {
    gap: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  requirementsBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  requirementsHeading: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  requirementsBullet: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.huge,
    paddingBottom: spacing.xl,
  },
});
