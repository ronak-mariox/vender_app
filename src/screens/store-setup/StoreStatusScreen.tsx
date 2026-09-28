import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import {
  useStoreSetup,
  type DaySchedule,
  type HolidayClosureItem,
  type OperatingHoursData,
  type StoreStatusValue,
} from '../../context/StoreSetupContext';
import { api, getApiErrorMessage } from '../../services/api';
import { parseShortDate, useFinishStoreSetup } from './storeSetupHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreStatus'>;

const OPTIONS: { value: StoreStatusValue; icon: IconName; title: string; subtitle: string }[] = [
  { value: 'open', icon: 'sun', title: 'Open', subtitle: 'Accepting orders normally' },
  { value: 'closed', icon: 'moon', title: 'Closed', subtitle: 'Not accepting any orders' },
  {
    value: 'temporarily-closed',
    icon: 'pause-circle',
    title: 'Temporarily Closed',
    subtitle: 'Paused for a set duration',
  },
];

const JS_DAY_TO_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_TO_LONG_DAY: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function findActiveHoliday(holidays: HolidayClosureItem[], today: Date): HolidayClosureItem | undefined {
  return holidays.find(holiday => {
    const start = parseShortDate(holiday.date);
    if (!start) return false;
    for (let offset = 0; offset < holiday.daysClosed; offset += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + offset);
      if (isSameDay(day, today)) return true;
    }
    return false;
  });
}

function findNextClosedDay(weeklySchedule: DaySchedule[], todayIndex: number): DaySchedule | undefined {
  for (let offset = 1; offset <= 7; offset += 1) {
    const shortDay = JS_DAY_TO_SHORT[(todayIndex + offset) % 7];
    const entry = weeklySchedule.find(item => item.day === shortDay);
    if (entry && !entry.isOpen) return entry;
  }
  return undefined;
}

type ScheduleSummary = { title: string; subtitle?: string; isOpen?: boolean };

function getTodaysScheduleSummary(
  operatingHours: OperatingHoursData | undefined,
  holidays: HolidayClosureItem[],
): ScheduleSummary {
  const today = new Date();
  const activeHoliday = findActiveHoliday(holidays, today);
  if (activeHoliday) {
    return { title: `Closed today: ${activeHoliday.title}`, subtitle: activeHoliday.note, isOpen: false };
  }
  if (!operatingHours) {
    return { title: 'Set your operating hours to see today’s schedule here' };
  }
  const todayShort = JS_DAY_TO_SHORT[today.getDay()];
  const todayEntry = operatingHours.weeklySchedule.find(item => item.day === todayShort);
  const nextClosed = findNextClosedDay(operatingHours.weeklySchedule, today.getDay());
  const subtitle = nextClosed ? `Next: Closed ${SHORT_TO_LONG_DAY[nextClosed.day] ?? nextClosed.day}` : undefined;
  if (!todayEntry || !todayEntry.isOpen) {
    return { title: 'Closed today', subtitle, isOpen: false };
  }
  return { title: `Open today: ${todayEntry.open} – ${todayEntry.close}`, subtitle, isOpen: true };
}

export function StoreStatusScreen({ navigation }: Props) {
  const { data, setStoreStatus } = useStoreSetup();
  const finishSetup = useFinishStoreSetup(navigation);
  const [selected, setSelected] = useState<StoreStatusValue>(data.storeStatus);

  useEffect(() => {
    setSelected(data.storeStatus);
  }, [data.storeStatus]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const schedule = useMemo(
    () => getTodaysScheduleSummary(data.operatingHours, data.holidays),
    [data.operatingHours, data.holidays],
  );

  function handleSelect(value: StoreStatusValue) {
    setSelected(value);
    if (value === 'temporarily-closed') {
      navigation.navigate('TempClosure');
    }
  }

  async function handleContinue() {
    if (selected === 'temporarily-closed' && !data.tempClosure) {
      navigation.navigate('TempClosure');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      if (selected === 'temporarily-closed' && data.tempClosure) {
        await api.patch('/vendor/store-setup/temp-closure', data.tempClosure);
      } else {
        await api.patch('/vendor/store-setup/status', { storeStatus: selected });
      }
      setStoreStatus(selected);
      await finishSetup();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save your store status. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={7} totalSteps={7} label="Store Status" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Store Status</Text>
          <Text style={styles.subtitle}>Control when customers can place orders at your store</Text>
        </View>

        <View style={styles.optionsList}>
          {OPTIONS.map(option => {
            const isSelected = selected === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleSelect(option.value)}
              >
                <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                  <Icon name={option.icon} size={24} color={isSelected ? colors.primary : colors.textSecondary} />
                </View>
                <View style={styles.optionTextColumn}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.scheduleCard}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.scheduleRow}>
            <View style={[styles.scheduleDot, schedule.isOpen === false && styles.scheduleDotClosed]} />
            <View>
              <Text style={styles.scheduleTitle}>{schedule.title}</Text>
              {schedule.subtitle ? <Text style={styles.scheduleSubtitle}>{schedule.subtitle}</Text> : null}
            </View>
          </View>
        </View>

        <InfoBanner
          variant="success"
          message="You can change your store status again later."
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.footer}>
          <Button label="Save & Continue" onPress={handleContinue} loading={saving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.xxs,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  optionsList: {
    gap: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryBorder,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: 'rgba(28,166,114,0.13)',
  },
  optionTextColumn: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...typography.bodyLarge,
    fontSize: 15,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 2.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scheduleCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  scheduleDotClosed: {
    backgroundColor: colors.error,
  },
  scheduleTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  scheduleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
});
