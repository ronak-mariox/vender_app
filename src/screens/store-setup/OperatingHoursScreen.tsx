import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ProgressSteps, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type DaySchedule, type OperatingHoursData } from '../../context/StoreSetupContext';
import { TIME_OPTIONS } from '../../utils/time';
import { api } from '../../services/api';
import { type FormErrors } from '../../utils/validators';
import { handleFormSaveError } from '../registration/registrationHelpers';
import { isCloseAfterOpen } from './storeSetupHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OperatingHours'>;

const FIELDS = ['hours', 'weeklySchedule'] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWeeklySchedule(open: string, close: string): DaySchedule[] {
  return DAYS.map(day => ({ day, open, close, isOpen: true }));
}

export function OperatingHoursScreen({ navigation }: Props) {
  const { data, updateOperatingHours } = useStoreSetup();
  const [sameEveryDay, setSameEveryDay] = useState(data.operatingHours?.sameEveryDay ?? true);
  const [defaultOpen, setDefaultOpen] = useState(data.operatingHours?.defaultOpen ?? '');
  const [defaultClose, setDefaultClose] = useState(data.operatingHours?.defaultClose ?? '');
  const [breakEnabled, setBreakEnabled] = useState(data.operatingHours?.breakEnabled ?? false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const hours = data.operatingHours;
    if (!hours) return;
    setSameEveryDay(hours.sameEveryDay);
    setDefaultOpen(hours.defaultOpen);
    setDefaultClose(hours.defaultClose);
    setBreakEnabled(hours.breakEnabled);
  }, [data.operatingHours]);

  function currentValue(): OperatingHoursData {
    return {
      sameEveryDay,
      defaultOpen,
      defaultClose,
      breakEnabled,
      weeklySchedule:
        !sameEveryDay && data.operatingHours?.weeklySchedule?.length === 7
          ? data.operatingHours.weeklySchedule
          : buildWeeklySchedule(defaultOpen, defaultClose),
    };
  }

  function validateHours(): boolean {
    if (!defaultOpen || !defaultClose) {
      setErrors({ hours: 'Select your opening and closing time' });
      return false;
    }
    if (!isCloseAfterOpen(defaultOpen, defaultClose)) {
      setErrors({ hours: 'Closing time must be after opening time' });
      return false;
    }
    setErrors({});
    return true;
  }

  function handleApplyToWeekly() {
    if (!validateHours()) return;
    const value: OperatingHoursData = {
      sameEveryDay,
      defaultOpen,
      defaultClose,
      breakEnabled,
      weeklySchedule: buildWeeklySchedule(defaultOpen, defaultClose),
    };
    updateOperatingHours(value);
    navigation.navigate('WeeklySchedule');
  }

  async function handleContinue() {
    if (!validateHours()) return;
    const value = currentValue();
    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/hours', value);
      updateOperatingHours(value);
      navigation.navigate('HolidayClosure');
    } catch (err) {
      handleFormSaveError<Errors>(err, setErrors, 'Could not save your operating hours. Please try again.', FIELDS);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={4} totalSteps={7} label="Operating Hours" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Operating Hours</Text>
          <Text style={styles.subtitle}>
            Set your store's working hours so customers know when you're open
          </Text>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextColumn}>
            <Text style={styles.toggleTitle}>Same hours every day</Text>
            <Text style={styles.toggleSubtitle}>Use the same open/close time for all days</Text>
          </View>
          <Switch
            value={sameEveryDay}
            onValueChange={setSameEveryDay}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Default Hours (All Days)</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Opening Time</Text>
              <SelectField
                value={defaultOpen}
                options={TIME_OPTIONS}
                onChange={value => {
                  setDefaultOpen(value);
                  if (errors.hours) setErrors({});
                }}
              />
            </View>
            <View style={styles.timeDash} />
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Closing Time</Text>
              <SelectField
                value={defaultClose}
                options={TIME_OPTIONS}
                onChange={value => {
                  setDefaultClose(value);
                  if (errors.hours) setErrors({});
                }}
              />
            </View>
          </View>
          {errors.hours ? <Text style={styles.errorText}>{errors.hours}</Text> : null}

          <View style={styles.breakRow}>
            <View style={styles.breakTextColumn}>
              <Text style={styles.breakTitle}>Break / Lunch Time</Text>
              <Text style={styles.breakSubtitle}>Temporarily pause orders during break</Text>
            </View>
            <Switch
              value={breakEnabled}
              onValueChange={setBreakEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <Button
            label="Apply to Weekly Schedule"
            variant="outline"
            icon={<Icon name="check" size={16} color={colors.primary} strokeWidth={2.5} />}
            onPress={handleApplyToWeekly}
          />
        </View>

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  toggleTextColumn: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  timeItem: {
    flex: 1,
    gap: spacing.sm,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeDash: {
    width: 20,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  breakTextColumn: {
    flex: 1,
    gap: 2,
  },
  breakTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  breakSubtitle: {
    ...typography.tiny,
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
