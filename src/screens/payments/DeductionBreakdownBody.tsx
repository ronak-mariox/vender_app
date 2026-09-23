import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { WeeklyBreakdownRow } from '../../context/PaymentsContext';
import { colors, radii, spacing, typography } from '../../theme';

type SummaryCard = {
  label: string;
  value: string;
  sublabel: string;
  valueColor?: string;
};

type Props = {
  bannerText: React.ReactNode;
  bannerBackground?: string;
  bannerBorder?: string;
  summaryCards: SummaryCard[];
  tableTitle: string;
  amountColumnLabel: string;
  amountValueColor?: string;
  rows: WeeklyBreakdownRow[];
  footerTitle: string;
  footerBody: string;
  footerLink?: string;
};

export function DeductionBreakdownBody({
  bannerText,
  bannerBackground = '#EFF6FF',
  bannerBorder = '#BFDBFE',
  summaryCards,
  tableTitle,
  amountColumnLabel,
  amountValueColor = '#FB923C',
  rows,
  footerTitle,
  footerBody,
  footerLink,
}: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.banner, { backgroundColor: bannerBackground, borderColor: bannerBorder }]}>
        <Text style={styles.bannerText}>{bannerText}</Text>
      </View>

      <View style={styles.summaryRow}>
        {summaryCards.map(card => (
          <View key={card.label} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{card.label}</Text>
            <Text style={[styles.summaryValue, card.valueColor ? { color: card.valueColor } : null]}>
              {card.value}
            </Text>
            <Text style={styles.summarySublabel}>{card.sublabel}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.tableTitle}>{tableTitle}</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeaderText, styles.periodCol]}>Period</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>Sales</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>{amountColumnLabel}</Text>
        </View>
        {rows.map((row, index) => (
          <View key={row.label} style={[styles.tableRow, index < rows.length - 1 && styles.tableRowDivider]}>
            <Text style={[styles.tableCell, styles.periodCol]}>{row.label}</Text>
            <Text style={[styles.tableCellMuted, styles.numCol]}>₹{row.sales.toLocaleString('en-IN')}</Text>
            <Text style={[styles.tableCellAmount, styles.numCol, { color: amountValueColor }]}>
              ₹{row.amount.toLocaleString('en-IN')}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>{footerTitle}</Text>
        <Text style={styles.footerBody}>{footerBody}</Text>
        {footerLink ? <Text style={styles.footerLink}>{footerLink}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.huge,
  },
  banner: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  bannerText: {
    ...typography.label,
    color: '#1E40AF',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: 2,
  },
  summaryLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  summarySublabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  tableTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  tableHeaderRow: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
  },
  tableHeaderText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  tableRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodCol: {
    flex: 1.4,
  },
  numCol: {
    flex: 1,
    textAlign: 'right',
  },
  tableCell: {
    ...typography.label,
    color: colors.textPrimary,
  },
  tableCellMuted: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tableCellAmount: {
    ...typography.labelSemibold,
  },
  footerCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  footerTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  footerBody: {
    ...typography.label,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
});
