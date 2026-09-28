import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { colors, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';
import { CalendarView, parseIso, startOfDay } from './OfferStartDateScreen';
import { offerDurationLabel } from './offerFormat';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferEndDate'>;

export function OfferEndDateScreen({ navigation }: Props) {
  const { draft, updateEndDate } = useOfferDraft();
  const startDate = useMemo(
    () => (draft.startImmediately ? new Date() : parseIso(draft.startDate) ?? new Date()),
    [draft.startImmediately, draft.startDate],
  );
  const existingEnd = parseIso(draft.endDate);
  const [selectedDay, setSelectedDay] = useState<Date | null>(
    existingEnd && existingEnd >= startDate ? startOfDay(existingEnd) : null,
  );

  const endDate = selectedDay
    ? new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), 23, 59, 59, 999)
    : null;
  const bannerText = endDate
    ? `Offer runs ${offerDurationLabel(startDate.toISOString(), endDate.toISOString())}`
    : 'Pick the last day this offer should run';

  function handleNext() {
    if (!endDate) return;
    updateEndDate(endDate.toISOString());
    navigation.navigate('OfferReview');
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <OfferWizardHeader title="End Date" step={4} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.disableableGroup}>
          <CalendarView
            selected={selectedDay}
            marked={startOfDay(startDate)}
            minDate={startDate}
            onSelect={setSelectedDay}
          />

          <View style={styles.banner}>
            <Icon name="calendar" size={16} color={colors.primary} />
            <Text style={styles.bannerText}>{bannerText}</Text>
          </View>
          <Text style={styles.hintText}>The offer ends at 11:59 PM on the selected day.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: Review" onPress={handleNext} disabled={!endDate} />
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
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
