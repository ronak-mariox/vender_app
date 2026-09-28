import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'HolidayClosure'>;

export function HolidayClosureScreen({ navigation }: Props) {
  const { data, removeHoliday } = useStoreSetup();
  const [busy, setBusy] = useState(false);

  async function handleRemoveHoliday(id: string) {
    setBusy(true);
    try {
      await api.delete(`/vendor/store-setup/holidays/${id}`);
      removeHoliday(id);
    } catch (err) {
      Alert.alert('Could not remove holiday', getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={4} totalSteps={7} label="Holidays" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Holiday & Special Closures</Text>
          <Text style={styles.subtitle}>Block out dates when your store won't be accepting orders</Text>
        </View>

        <Pressable style={styles.addButton} disabled={busy} onPress={() => navigation.navigate('HolidayForm')}>
          <View style={styles.addIcon}>
            <Icon name="plus" size={18} color={colors.primary} />
          </View>
          <View style={styles.addTextColumn}>
            <Text style={styles.addTitle}>Add Holiday or Closure</Text>
            <Text style={styles.addSubtitle}>Block a date or date range</Text>
          </View>
        </Pressable>

        <View>
          <Text style={styles.sectionTitle}>Upcoming Closures ({data.holidays.length})</Text>
          <View style={styles.closuresList}>
            {data.holidays.length === 0 ? (
              <Text style={styles.emptyText}>No closures planned. Adding holidays is optional.</Text>
            ) : null}
            {data.holidays.map(item => (
              <View key={item.id} style={styles.closureCard}>
                <View style={styles.closureIcon}>
                  <Icon name="flag" size={20} color="#D97706" />
                </View>
                <View style={styles.closureTextColumn}>
                  <Text style={styles.closureTitle}>{item.title}</Text>
                  <Text style={styles.closureMeta}>
                    {item.date} · {item.daysClosed} day{item.daysClosed > 1 ? 's' : ''} closed
                  </Text>
                  <Text style={styles.closureNote}>{item.note}</Text>
                </View>
                <View style={styles.closureActions}>
                  <Pressable
                    hitSlop={6}
                    onPress={() => navigation.navigate('HolidayForm', { holidayId: item.id })}
                  >
                    <Icon name="edit" size={15} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable hitSlop={6} disabled={busy} onPress={() => handleRemoveHoliday(item.id)}>
                    <Icon name="trash" size={15} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="Save & Continue" onPress={() => navigation.navigate('DeliverySettings')} />
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.white,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTextColumn: {
    gap: 1,
  },
  addTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  addSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  closuresList: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  closureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  closureIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closureTextColumn: {
    flex: 1,
    gap: 1,
  },
  closureTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  closureMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  closureNote: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  closureActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
