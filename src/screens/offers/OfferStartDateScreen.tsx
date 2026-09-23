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
export const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  year: number;
  month: number;
  selectedDay: number | null;
  markedDay?: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarView({
  year,
  month,
  selectedDay,
  markedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);

  return (
    <View style={styles.calendarCard}>
      <View style={styles.calendarHeaderRow}>
        <Pressable hitSlop={8} onPress={onPrevMonth}>
          <View style={styles.chevronLeftWrap}>
            <Icon name="chevron-right" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>
        <Text style={styles.calendarMonthLabel}>
          {MONTH_NAMES_LONG[month]} {year}
        </Text>
        <Pressable hitSlop={8} onPress={onNextMonth}>
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
              const isSelected = day === selectedDay;
              const isMarked = !isSelected && day === markedDay;
              return (
                <Pressable
                  key={dayIndex}
                  style={[styles.dayCell, isMarked && styles.dayCellMarked, isSelected && styles.dayCellSelected]}
                  onPress={() => onSelectDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isMarked && styles.dayTextMarked,
                      isSelected && styles.dayTextSelected,
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

export function OfferStartDateScreen({ navigation }: Props) {
  const { updateStartDate } = useOfferDraft();
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(10);
  const [selectedDay, setSelectedDay] = useState(9);
  const [minutes, setMinutes] = useState(0);
  const [immediate, setImmediate] = useState(false);

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
    updateStartDate({
      dateLabel: `${selectedDay} ${MONTH_NAMES_SHORT[month]}`,
      time: formatTime(minutes),
      immediate,
    });
    navigation.navigate('OfferEndDate');
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
            year={year}
            month={month}
            selectedDay={selectedDay}
            markedDay={7}
            onSelectDay={setSelectedDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <View style={styles.timeSection}>
            <Text style={styles.sectionLabel}>Start Time</Text>
            <View style={styles.timeField}>
              <Text style={styles.timeValue}>{formatTime(minutes)}</Text>
              <View style={styles.timeChevrons}>
                <Pressable hitSlop={4} onPress={() => setMinutes(m => (m + 30) % 1440)}>
                  <View style={styles.chevronUpWrap}>
                    <Icon name="chevron-down" size={14} color={colors.textSecondary} />
                  </View>
                </Pressable>
                <Pressable hitSlop={4} onPress={() => setMinutes(m => ((m - 30) % 1440 + 1440) % 1440)}>
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
          <Switch value={immediate} onChange={setImmediate} />
        </View>
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
