import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useSupport } from '../../context/SupportContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'TicketClosed'>;

// Icon.tsx renders every shape with fill="none", so it can't produce a solid/filled
// star for the rating control below. Reusing the same path data locally here instead
// of editing the shared Icon component (out of scope for this task).
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function Star({ filled, size = 28 }: { filled: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={STAR_PATH}
        fill={filled ? colors.warning : 'none'}
        stroke={filled ? colors.warning : colors.border}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TicketClosedScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket } = useSupport();
  const ticket = getTicket(ticketId);
  const [rating, setRating] = useState(0);

  function handleBack() {
    navigation.goBack();
  }

  function goToHelpSupport() {
    navigation.reset({ index: 0, routes: [{ name: 'HelpSupport' }] });
  }

  if (!ticket) {
    return (
      <ScreenContainer>
        <NavHeader title="Ticket Closed" onBack={handleBack} />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Ticket not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const timeline = ticket.timeline;
  const lastStep = timeline[timeline.length - 1];
  const prevStep = timeline.length > 1 ? timeline[timeline.length - 2] : lastStep;
  const closureDate = lastStep?.sublabel.split(',')[0]?.trim() || ticket.openedLabel;
  const resolvedDate = prevStep?.sublabel.split(',')[0]?.trim() || closureDate;
  const lastSupportMessage = [...ticket.messages].reverse().find(message => message.from === 'support');
  const resolutionText = lastSupportMessage?.text || ticket.description;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <NavHeader title="Ticket Closed" onBack={handleBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="check-circle" size={30} color={colors.textPrimary} strokeWidth={2} />
          </View>
          <Text style={styles.heading}>Ticket #{ticket.id} is Closed</Text>
          <Text style={styles.subtitle}>Closure date: {closureDate}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Reason: {resolutionText}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Issue</Text>
            <Text style={styles.detailsValue}>{ticket.issueTitle}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Order ID</Text>
            <Text style={styles.detailsValue}>{ticket.orderId || '—'}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Resolution</Text>
            <Text style={styles.detailsValue}>{resolutionText}</Text>
          </View>
          <View style={[styles.detailsRow, styles.detailsRowLast]}>
            <Text style={styles.detailsLabel}>Resolved Date</Text>
            <Text style={styles.detailsValue}>{resolvedDate}</Text>
          </View>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Your Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <Pressable key={value} onPress={() => setRating(value)} hitSlop={6}>
                <Star filled={value <= rating} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need more help?</Text>
          <View style={styles.helpButtons}>
            <Button label="Raise New Ticket" onPress={goToHelpSupport} />
            <Button label="Browse FAQs" variant="outline" onPress={goToHelpSupport} />
          </View>
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
    padding: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  hero: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  detailsRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  detailsRowLast: {
    borderBottomWidth: 0,
  },
  detailsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailsValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  ratingCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  ratingTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  helpCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  helpTitle: {
    ...typography.labelSemibold,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helpButtons: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
});
