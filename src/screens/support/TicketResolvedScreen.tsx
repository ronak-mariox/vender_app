import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSupport } from '../../context/SupportContext';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TicketResolved'>;

export function TicketResolvedScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket } = useSupport();
  const ticket = getTicket(ticketId);
  const [rating, setRating] = useState(0);

  if (!ticket) {
    return (
      <ScreenContainer scrollable={false}>
        <NavHeader title="Ticket" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrap}>
          <Icon name="alert-circle" size={36} color={colors.textTertiary} />
          <Text style={styles.notFoundText}>Ticket not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const resolvedStep = ticket.timeline.find(
    step => step.status === 'done' && /resolved|closed/i.test(step.label),
  );
  const supportMessages = ticket.messages.filter(m => m.from === 'support');
  const resolutionMessage =
    supportMessages[supportMessages.length - 1]?.text ??
    'Your issue has been resolved.';
  const resolutionDate = resolvedStep?.sublabel ?? ticket.openedLabel;

  function handleSubmitRating() {
    Alert.alert('Thank you!', 'Your feedback has been submitted.');
  }

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title={`Ticket #${ticket.id}`} onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
          </View>
          <Text style={styles.bannerText}>Issue Resolved</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resolution Summary</Text>
            <Text style={styles.resolutionMessage}>{resolutionMessage}</Text>
            <Text style={styles.resolutionDateRow}>
              <Text style={styles.resolutionDateLabel}>Resolution date: </Text>
              <Text style={styles.resolutionDateValue}>{resolutionDate}</Text>
            </Text>
          </View>

          <View style={[styles.card, styles.ratingCard]}>
            <Text style={styles.ratingTitle}>How was your support experience?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(value => (
                <Pressable key={value} onPress={() => setRating(value)} hitSlop={6}>
                  <Icon
                    name="star"
                    size={28}
                    color={colors.warning}
                    strokeWidth={value <= rating ? 2.5 : 1.5}
                  />
                </Pressable>
              ))}
            </View>
            <Button label="Submit Rating" onPress={handleSubmitRating} />
          </View>

          <Pressable
            style={styles.reopenLink}
            onPress={() => navigation.navigate('ReopenTicket', { ticketId: ticket.id })}
            hitSlop={4}
          >
            <Text style={styles.reopenLinkText}>Reopen Issue</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  bannerIcon: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.primaryDark,
  },
  body: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  cardTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    lineHeight: 19.5,
    color: colors.textPrimary,
  },
  resolutionMessage: {
    ...typography.body,
    color: colors.textPrimary,
    paddingTop: spacing.md,
  },
  resolutionDateRow: {
    paddingTop: spacing.md,
  },
  resolutionDateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resolutionDateValue: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  ratingCard: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  ratingTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reopenLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  reopenLinkText: {
    ...typography.label,
    color: colors.primary,
  },
});
