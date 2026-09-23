import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useSupport } from '../../context/SupportContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReopenTicket'>;

export function ReopenTicketScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket, reopenTicket } = useSupport();
  const ticket = getTicket(ticketId);
  const [reason, setReason] = useState('');
  const canConfirm = reason.trim().length > 0;

  const lastStep = ticket?.timeline[ticket.timeline.length - 1];
  const lastStepDate = lastStep?.sublabel.split(',')[0]?.trim() || ticket?.openedLabel;
  const statusWord = ticket?.status === 'closed' ? 'closed' : 'resolved';

  function handleClose() {
    navigation.goBack();
  }

  function handleConfirm() {
    if (!ticket || !canConfirm) return;
    reopenTicket(ticket.id, reason.trim());
    navigation.goBack();
  }

  return (
    <Pressable style={styles.backdrop} onPress={handleClose}>
      <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          {ticket ? (
            <>
              <Text style={styles.heading}>Reopen Ticket?</Text>
              <Text style={styles.subtitle}>
                Ticket #{ticket.id} was {statusWord} on {lastStepDate}.
              </Text>

              <View style={styles.labelRow}>
                <Text style={styles.label}>Reason for reopening </Text>
                <Text style={styles.labelRequired}>*</Text>
              </View>

              <TextInput
                style={styles.textarea}
                value={reason}
                onChangeText={setReason}
                placeholder="Why are you reopening?"
                placeholderTextColor="rgba(31,41,55,0.5)"
                multiline
                textAlignVertical="top"
              />

              <View style={styles.warningBox}>
                <Icon name="alert-triangle" size={20} color={colors.warning} strokeWidth={2} />
                <Text style={styles.warningText}>
                  Reopening may extend resolution time by 24–48 hours.
                </Text>
              </View>

              <View style={styles.footer}>
                <Pressable style={styles.cancelButton} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
                  onPress={handleConfirm}
                  disabled={!canConfirm}
                >
                  <Text style={styles.confirmButtonText}>Reopen Ticket</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Ticket not found</Text>
              <Text style={styles.subtitle}>This ticket may have been removed.</Text>
              <View style={styles.footer}>
                <Pressable style={[styles.cancelButton, styles.singleButton]} onPress={handleClose}>
                  <Text style={styles.cancelButtonText}>Close</Text>
                </Pressable>
              </View>
            </>
          )}
        </SafeAreaView>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl + 4,
    borderTopRightRadius: radii.xl + 4,
    alignItems: 'stretch',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge + spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xxl,
  },
  heading: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    paddingTop: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  labelRequired: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  textarea: {
    ...typography.body,
    color: colors.textPrimary,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  warningText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  singleButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 4,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  confirmButton: {
    flex: 6,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
