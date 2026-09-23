import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer, Switch } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';
import { CalendarView, MONTH_NAMES_SHORT } from './OfferStartDateScreen';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferEndDate'>;

function extractDayNumber(dateLabel: string | undefined): number | null {
  if (!dateLabel) return null;
  const parsed = parseInt(dateLabel, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function OfferEndDateScreen({ navigation }: Props) {
  const { draft, updateEndDate } = useOfferDraft();
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(10);
  const [selectedDay, setSelectedDay] = useState(15);
  const [noEndDate, setNoEndDate] = useState(false);

  const startDay = extractDayNumber(draft.startDate?.dateLabel);
  const dayCount = startDay != null ? Math.max(1, selectedDay - startDay + 1) : null;
  const bannerText =
    startDay != null && draft.startDate
      ? `Offer runs for ${dayCount} day${dayCount === 1 ? '' : 's'} (${draft.startDate.dateLabel}–${selectedDay} ${MONTH_NAMES_SHORT[month]})`
      : `Offer ends ${selectedDay} ${MONTH_NAMES_SHORT[month]}`;

  function handlePrevMonth() {
    setMonth(prev => {
      if (prev === 0) {
        setYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function handleNextMonth() {
    setMonth(prev => {
      if (prev === 11) {
        setYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  function handleNext() {
    updateEndDate({
      dateLabel: noEndDate ? 'No end date' : `${selectedDay} ${MONTH_NAMES_SHORT[month]}`,
      immediate: noEndDate,
    });
    navigation.navigate('OfferReview');
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <OfferWizardHeader title="End Date" step={4} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          style={[styles.disableableGroup, noEndDate && styles.disabledGroup]}
          pointerEvents={noEndDate ? 'none' : 'auto'}
        >
          <CalendarView
            year={year}
            month={month}
            selectedDay={selectedDay}
            markedDay={7}
            onSelectDay={setSelectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <View style={styles.banner}>
            <Icon name="calendar" size={16} color={colors.primary} />
            <Text style={styles.bannerText}>{bannerText}</Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextColumn}>
            <Text style={styles.toggleTitle}>No end date</Text>
            <Text style={styles.toggleSubtitle}>Offer runs until manually stopped</Text>
          </View>
          <Switch value={noEndDate} onChange={setNoEndDate} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: Review" onPress={handleNext} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  disableableGroup: {
    gap: spacing.xl,
  },
  disabledGroup: {
    opacity: 0.4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  bannerText: {
    ...typography.labelSemibold,
    color: colors.primary,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleTextColumn: {
    gap: 2,
  },
  toggleTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
