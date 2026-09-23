import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type DaySchedule } from '../../context/StoreSetupContext';
import { TIME_OPTIONS } from '../../utils/time';
import { api, getApiErrorMessage } from '../../services/api';
import { isTimeRangeValid, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'WeeklySchedule'>;

type Errors = FormErrors<'schedule'>;

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'Mon', open: '9:00 AM', close: '9:00 PM', isOpen: true },
  { day: 'Tue', open: '9:00 AM', close: '9:00 PM', isOpen: true },
  { day: 'Wed', open: '9:00 AM', close: '9:00 PM', isOpen: true },
  { day: 'Thu', open: '9:00 AM', close: '9:00 PM', isOpen: true },
  { day: 'Fri', open: '9:00 AM', close: '10:00 PM', isOpen: true },
  { day: 'Sat', open: '8:00 AM', close: '6:00 PM', isOpen: true },
  { day: 'Sun', open: '9:00 AM', close: '9:00 PM', isOpen: false },
];

export function WeeklyScheduleScreen({ navigation }: Props) {
  const { data, updateOperatingHours } = useStoreSetup();
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    data.operatingHours?.weeklySchedule ?? DEFAULT_SCHEDULE,
  );
  const [editing, setEditing] = useState<{ index: number; field: 'open' | 'close' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [invalidDays, setInvalidDays] = useState<Set<string>>(new Set());

  function updateDay(index: number, patch: Partial<DaySchedule>) {
    setSchedule(prev => prev.map((day, idx) => (idx === index ? { ...day, ...patch } : day)));
    if (invalidDays.size > 0) {
      setInvalidDays(new Set());
      setErrors({});
    }
  }

  function setAllOpen() {
    setSchedule(prev => prev.map(day => ({ ...day, isOpen: true })));
  }

  function setWeekendClosed() {
    setSchedule(prev =>
      prev.map(day => (day.day === 'Sat' || day.day === 'Sun' ? { ...day, isOpen: false } : day)),
    );
  }

  const summary = useMemo(() => {
    const openDays = schedule.filter(day => day.isOpen);
    const closedDays = schedule.filter(day => !day.isOpen).map(day => day.day);
    return `Open ${openDays.length} days${
      closedDays.length ? ` • Closed ${closedDays.join(', ')}` : ''
    }`;
  }, [schedule]);

  async function handleContinue() {
    const badDays = schedule.filter(day => day.isOpen && !isTimeRangeValid(day.open, day.close));
    if (badDays.length > 0) {
      setInvalidDays(new Set(badDays.map(day => day.day)));
      setErrors({ schedule: `Closing time must be after opening time (${badDays.map(day => day.day).join(', ')})` });
      return;
    }
    setInvalidDays(new Set());

    const value = {
      sameEveryDay: false,
      defaultOpen: data.operatingHours?.defaultOpen ?? '9:00 AM',
      defaultClose: data.operatingHours?.defaultClose ?? '9:00 PM',
      breakEnabled: data.operatingHours?.breakEnabled ?? false,
      weeklySchedule: schedule,
    };
    setSaving(true);
    setErrors({});
    try {
      await api.patch('/vendor/store-setup/hours', value);
      updateOperatingHours(value);
      navigation.navigate('HolidayClosure');
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={4} totalSteps={7} label="Weekly Schedule" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Weekly Schedule</Text>
          <Text style={styles.subtitle}>Customise hours for each day of the week</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderLabel}>Day</Text>
            <View style={styles.tableHeaderRight}>
              <Text style={styles.tableHeaderLabel}>Hours</Text>
              <Text style={styles.tableHeaderLabel}>Open</Text>
            </View>
          </View>

          {schedule.map((day, index) => (
            <View
              key={day.day}
              style={[styles.dayRow, index < schedule.length - 1 && styles.dayRowDivider]}
            >
              <Text style={[styles.dayLabel, !day.isOpen && styles.dayLabelMuted]}>{day.day}</Text>
              {day.isOpen ? (
                <View style={styles.dayTimes}>
                  <Pressable
                    style={[styles.timeChip, invalidDays.has(day.day) && styles.timeChipError]}
                    onPress={() => setEditing({ index, field: 'open' })}
                  >
                    <Icon name="clock" size={12} color={colors.textPrimary} />
                    <Text style={styles.timeChipText}>{day.open}</Text>
                  </Pressable>
                  <View style={styles.timeChipDash} />
                  <Pressable
                    style={[styles.timeChip, invalidDays.has(day.day) && styles.timeChipError]}
                    onPress={() => setEditing({ index, field: 'close' })}
                  >
                    <Icon name="clock" size={12} color={colors.textPrimary} />
                    <Text style={styles.timeChipText}>{day.close}</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.closedText}>Closed</Text>
              )}
              <Switch
                value={day.isOpen}
                onValueChange={value => updateDay(index, { isOpen: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          ))}
        </View>

        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickActionButton} onPress={setAllOpen}>
            <Text style={styles.quickActionText}>Set All Open</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton} onPress={setWeekendClosed}>
            <Text style={styles.quickActionText}>Set Weekend Closed</Text>
          </Pressable>
        </View>

        <View style={styles.summaryBanner}>
          <Icon name="info" size={14} color={colors.primaryDark} />
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {errors.schedule ? <Text style={styles.errorText}>{errors.schedule}</Text> : null}
        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label="Save & Continue" onPress={handleContinue} loading={saving} />
        </View>
      </View>

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <Pressable style={styles.backdrop} onPress={() => setEditing(null)}>
          <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
            <SafeAreaView edges={['bottom']} style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <FlatList
                data={TIME_OPTIONS}
                keyExtractor={item => item}
                style={styles.list}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      if (editing) {
                        updateDay(editing.index, { [editing.field]: item } as Partial<DaySchedule>);
                      }
                      setEditing(null);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                )}
              />
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderRight: {
    flexDirection: 'row',
    gap: 32,
  },
  tableHeaderLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  dayRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    width: 36,
  },
  dayLabelMuted: {
    color: colors.textTertiary,
  },
  dayTimes: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeChipError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  timeChipText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  timeChipDash: {
    width: 12,
    height: 1,
    backgroundColor: colors.border,
  },
  closedText: {
    flex: 1,
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textTertiary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  quickActionText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  summaryText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  list: {
    marginBottom: spacing.lg,
  },
  option: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
