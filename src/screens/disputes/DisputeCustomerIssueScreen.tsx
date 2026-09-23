import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useDisputes } from '../../context/DisputesContext';
import { Badge, Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeCustomerIssue'>;

// Figma uses a bespoke amber border tint with no matching design token.
const AMBER_BORDER = '#FEC84B';

export function DisputeCustomerIssueScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute } = useDisputes();
  const dispute = getDispute(disputeId);

  if (!dispute) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summaryRows: { label: string; value: string }[] = [
    { label: 'Order ID', value: dispute.orderId },
    { label: 'Customer', value: dispute.customerName },
    { label: 'Order Date', value: dispute.orderDateLabel },
    { label: 'Issue Raised', value: dispute.issueRaisedLabel },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customer Issue Raised</Text>
      </View>

      <View style={styles.banner}>
        <Icon name="alert-triangle" size={20} color={colors.warningDark} strokeWidth={2} />
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>
            A customer has raised an issue with Order {dispute.orderId}.
          </Text>
          <Text style={styles.bannerSubtitle}>Action required within 48 hours</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue Summary</Text>
          <View style={styles.cardBody}>
            {summaryRows.map(row => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Issue Type</Text>
              <Badge label={dispute.issueType} tone="warning" />
            </View>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteLabel}>CUSTOMER&apos;S STATEMENT</Text>
          <Text style={styles.quoteText}>&ldquo;{dispute.customerStatement}&rdquo;</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Button
            label="Review Issue"
            onPress={() => navigation.navigate('DisputeIssueDetails', { disputeId })}
          />
        </View>
        <View style={styles.footerButton}>
          <SecondaryButton
            label="View Order Details"
            onPress={() =>
              Alert.alert(
                'Order Details',
                `Order details for ${dispute.orderId} aren't available in this preview.`,
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
    >
      <Text style={styles.secondaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
  },
  headerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.white,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderBottomWidth: 1,
    borderBottomColor: AMBER_BORDER,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg - 2,
  },
  bannerTextColumn: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.warningDark,
  },
  content: {
    padding: spacing.xl,
    gap: 14,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingTop: spacing.lg,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  quoteCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    borderRadius: radii.sm,
    padding: spacing.xl,
  },
  quoteLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  quoteText: {
    ...typography.body,
    fontStyle: 'italic',
    color: colors.textPrimary,
    paddingTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
  secondaryButton: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonLabel: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
