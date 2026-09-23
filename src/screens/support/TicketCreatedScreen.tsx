import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useSupport } from '../../context/SupportContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TicketCreated'>;

const NEXT_STEPS = [
  "You'll receive notifications for every update",
  'Our team will contact you if more info is needed',
  'Check status anytime under My Tickets',
];

export function TicketCreatedScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket } = useSupport();
  const ticket = getTicket(ticketId);
  const displayId = ticket?.id ?? ticketId;

  function handleTrackTicket() {
    navigation.reset({
      index: 1,
      routes: [{ name: 'HelpSupport' }, { name: 'TicketDetails', params: { ticketId: displayId } }],
    });
  }

  function handleBackToSupport() {
    navigation.reset({ index: 0, routes: [{ name: 'HelpSupport' }] });
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Icon name="check" size={36} color={colors.primary} strokeWidth={3} />
        </View>

        <Text style={styles.heading}>Ticket Raised!</Text>

        <View style={styles.idChip}>
          <Text style={styles.idText}>#{displayId}</Text>
          <Icon name="copy" size={16} color={colors.textSecondary} />
        </View>

        <Text style={styles.subtitle}>We'll review your issue within 24–48 hours.</Text>

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Next Steps</Text>
          {NEXT_STEPS.map(step => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Icon name="check" size={11} color={colors.primary} strokeWidth={3} />
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonGroup}>
          <Button label="Track Ticket" onPress={handleTrackTicket} />
          <Button label="Back to Support" variant="outline" onPress={handleBackToSupport} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.massive + spacing.xxl,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    lineHeight: 33,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.sm + 2,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  idText: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.huge - 4,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.huge,
  },
  nextStepsTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
});
