import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer, Switch } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferStartDate'>;

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return Boolean(
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(),
  );
}

export function parseIso(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthMatrix(year: number, month: number): (number | null)[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function formatTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const hour12raw = hour24 % 12;
  const hour12 = hour12raw === 0 ? 12 : hour12raw;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${meridiem}`;
}

type CalendarViewProps = {
  selected: Date | null;
  marked?: Date | null;
  /** Days before this date can't be picked. */
  minDate?: Date | null;
  onSelect: (date: Date) => void;
};

/** Month-grid date picker built from RN primitives; keeps its own visible month. */
export function CalendarView({ selected, marked, minDate, onSelect }: CalendarViewProps) {
  const initial = selected ?? minDate ?? new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const minDay = minDate ? startOfDay(minDate).getTime() : null;
  const canGoBack = minDate ? year > minDate.getFullYear() || (year === minDate.getFullYear() && month > minDate.getMonth()) : true;

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeaderRow}>
        <Pressable hitSlop={8} onPress={() => canGoBack && shiftMonth(-1)} disabled={!canGoBack}>
          <View style={[styles.chevronLeftWrap, !canGoBack && styles.navDisabled]}>
            <Icon name="chevron-right" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
        <Text style={styles.calendarMonthLabel}>
          {MONTH_NAMES_LONG[month]} {year}
        </Text>
        <Pressable hitSlop={8} onPress={() => shiftMonth(1)}>
          <Icon name="chevron-right" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekdayLabel}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.calendarRow}>
            {week.map((day, dayIndex) => {
              if (day == null) {
                return <View key={dayIndex} style={styles.dayCell} />;
              }
              const date = new Date(year, month, day);
              const disabled = minDay != null && date.getTime() < minDay;
              const isSelected = isSameDay(date, selected);
              const isMarked = !isSelected && isSameDay(date, marked);
              return (
                <Pressable
                  key={dayIndex}
                  disabled={disabled}
                  style={[styles.dayCell, isMarked && styles.dayCellMarked, isSelected && styles.dayCellSelected]}
                  onPress={() => onSelect(date)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isMarked && styles.dayTextMarked,
                      isSelected && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function nextHalfHour(now: Date): number {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.min(1410, Math.ceil((minutes + 1) / 30) * 30);
}

export function OfferStartDateScreen({ navigation }: Props) {
  const { draft, updateStartDate } = useOfferDraft();
  const today = useMemo(() => startOfDay(new Date()), []);
  const existingStart = parseIso(draft.startDate);
  const [selectedDay, setSelectedDay] = useState<Date>(existingStart ? startOfDay(existingStart) : today);
  const [minutes, setMinutes] = useState(
    existingStart ? existingStart.getHours() * 60 + existingStart.getMinutes() : nextHalfHour(new Date()),
  );
  const [immediate, setImmediate] = useState(draft.startImmediately);
  const [error, setError] = useState<string | undefined>();

  const minDate = existingStart && existingStart < today ? startOfDay(existingStart) : today;

  function handleNext() {
    if (immediate) {
      updateStartDate({ startDate: null, startImmediately: true });
      navigation.navigate('OfferEndDate');
      return;
    }
    const start = new Date(selectedDay);
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    const unchanged = existingStart && start.getTime() === existingStart.getTime();
    if (!unchanged && start.getTime() < Date.now()) {
      setError('That time has already passed. Pick a later time or turn on "Start immediately".');
      return;
    }
    updateStartDate({ startDate: start.toISOString(), startImmediately: false });
    navigation.navigate('OfferEndDate');
  }

  function changeMinutes(delta: number) {
    setMinutes(m => (((m + delta) % 1440) + 1440) % 1440);
    setError(undefined);
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <OfferWizardHeader title="Start Date" step={4} onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          style={[styles.disableableGroup, immediate && styles.disabledGroup]}
          pointerEvents={immediate ? 'none' : 'auto'}
        >
          <CalendarView
            selected={selectedDay}
            marked={today}
            minDate={minDate}
            onSelect={date => {
              setSelectedDay(date);
              setError(undefined);
            }}
          />

          <View style={styles.timeSection}>
            <Text style={styles.sectionLabel}>Start Time</Text>
            <View style={styles.timeField}>
              <Text style={styles.timeValue}>{formatTime(minutes)}</Text>
              <View style={styles.timeChevrons}>
                <Pressable hitSlop={4} onPress={() => changeMinutes(30)}>
                  <View style={styles.chevronUpWrap}>
                    <Icon name="chevron-down" size={14} color={colors.textSecondary} />
                  </View>
                </Pressable>
                <Pressable hitSlop={4} onPress={() => changeMinutes(-30)}>
                  <Icon name="chevron-down" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextColumn}>
            <Text style={styles.toggleTitle}>Start immediately</Text>
            <Text style={styles.toggleSubtitle}>Offer goes live right now</Text>
          </View>
          <Switch
            value={immediate}
            onChange={value => {
              setImmediate(value);
              setError(undefined);
            }}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: End Date" onPress={handleNext} />
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
  calendarCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronLeftWrap: {
    transform: [{ rotate: '180deg' }],
  },
  calendarMonthLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 2,
    paddingTop: spacing.lg,
  },
  weekdayLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  calendarGrid: {
    paddingTop: spacing.sm,
    gap: 2,
  },
  calendarRow: {
    flexDirection: 'row',
    gap: 2,
  },
  dayCell: {
    flex: 1,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellMarked: {
    backgroundColor: colors.primarySurface,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dayTextMarked: {
    ...typography.labelSemibold,
    fontSize: 13,
    color: colors.primary,
  },
  dayTextDisabled: {
    color: colors.textTertiary,
  },
  navDisabled: {
    opacity: 0.3,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.md,
  },
  dayTextSelected: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.white,
  },
  timeSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  timeValue: {
    ...typography.bodySemibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  timeChevrons: {
    gap: 2,
  },
  chevronUpWrap: {
    transform: [{ rotate: '180deg' }],
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
