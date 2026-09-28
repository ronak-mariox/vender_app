import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type HolidayClosureItem } from '../../context/StoreSetupContext';
import { api } from '../../services/api';
import { handleFormSaveError } from '../registration/registrationHelpers';
import { isRequired, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'HolidayForm'>;

const FIELDS = ['title', 'date', 'daysClosed', 'note'] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

type FormState = {
  title: string;
  date: string;
  daysClosed: string;
  note: string;
};

function parseDisplayDate(display: string): Date | null {
  if (!display) return null;
  const parsed = new Date(display);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatHolidayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function HolidayFormScreen({ navigation, route }: Props) {
  const { data, addHoliday, updateHoliday } = useStoreSetup();
  const holidayId = route.params?.holidayId;
  const existing = holidayId ? data.holidays.find(item => item.id === holidayId) : undefined;
  const isEditing = Boolean(existing);

  const [form, setForm] = useState<FormState>({
    title: existing?.title ?? '',
    date: existing?.date ?? '',
    daysClosed: existing ? String(existing.daysClosed) : '1',
    note: existing?.note ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    set('date', formatHolidayDate(selectedDate));
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  }

  async function handleSave() {
    const nextErrors: Errors = {};
    if (!isRequired(form.title)) nextErrors.title = 'Enter a title for this closure';
    if (!isRequired(form.date)) nextErrors.date = 'Select a date';
    const daysClosed = parseInt(form.daysClosed, 10);
    if (!Number.isInteger(daysClosed) || daysClosed < 1) nextErrors.daysClosed = 'Enter at least 1 day';
    if (!isRequired(form.note)) nextErrors.note = 'Add a short note';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const draft = { title: form.title.trim(), date: form.date, daysClosed, note: form.note.trim() };
    setSaving(true);
    try {
      if (isEditing && existing) {
        const { data: updated } = await api.patch<HolidayClosureItem>(
          `/vendor/store-setup/holidays/${existing.id}`,
          draft,
        );
        updateHoliday(updated);
      } else {
        const { data: created } = await api.post<HolidayClosureItem>('/vendor/store-setup/holidays', draft);
        addHoliday(created);
      }
      navigation.goBack();
    } catch (err) {
      handleFormSaveError<Errors>(err, setErrors, 'Could not save this closure. Please try again.', FIELDS);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title={isEditing ? 'Edit Closure' : 'Add Holiday or Closure'} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>{isEditing ? 'Edit Closure' : 'Add Holiday or Closure'}</Text>
          <Text style={styles.subtitle}>Block out a date or date range when your store won't accept orders</Text>
        </View>

        <FormSectionCard title="Closure Details">
          <Input
            label="Title"
            required
            value={form.title}
            onChangeText={text => set('title', text)}
            placeholder="e.g. Festival break"
            error={errors.title}
          />

          <View style={styles.dateField}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <Pressable
              style={[styles.datePressable, errors.date && styles.datePressableError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateValue, !form.date && styles.datePlaceholder]}>
                {form.date || 'Select a date'}
              </Text>
            </Pressable>
            {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
          </View>
          {showDatePicker ? (
            <DateTimePicker
              value={parseDisplayDate(form.date) ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          ) : null}

          <Input
            label="Days Closed"
            required
            value={form.daysClosed}
            onChangeText={text => set('daysClosed', text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="1"
            error={errors.daysClosed}
          />
          <Input
            label="Note"
            required
            value={form.note}
            onChangeText={text => set('note', text)}
            placeholder="Festival closure"
            error={errors.note}
          />
        </FormSectionCard>

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label={isEditing ? 'Save Changes' : 'Add Closure'} onPress={handleSave} loading={saving} />
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
  dateField: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  datePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  datePressableError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  dateValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  datePlaceholder: {
    color: colors.textTertiary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
