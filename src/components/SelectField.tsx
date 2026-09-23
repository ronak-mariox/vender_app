import React, { useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../icons/Icon';
import { colors, radii, spacing, typography } from '../theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const LIST_MAX_HEIGHT = SHEET_MAX_HEIGHT - 96;

type Props = {
  label?: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

export function SelectField({
  label,
  required,
  value,
  options,
  onChange,
  placeholder = 'Select',
  disabled = false,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.required}> *</Text> : null}
        </View>
      ) : null}

      <Pressable
        style={[styles.field, hasError && styles.fieldError, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setOpen(true)}
      >
        <Text style={[styles.valueText, !value && styles.placeholderText]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={16} color={colors.textSecondary} />
      </Pressable>

      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
            <SafeAreaView edges={['bottom']} style={styles.sheet}>
              <View style={styles.sheetHandle} />
              {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
              <FlatList
                data={options}
                keyExtractor={item => item}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator
                initialNumToRender={20}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                    {item === value ? (
                      <Icon name="check" size={16} color={colors.primary} strokeWidth={3} />
                    ) : null}
                  </Pressable>
                )}
              />
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  fieldDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  fieldError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  valueText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: colors.textTertiary,
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
    maxHeight: SHEET_MAX_HEIGHT,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.textPrimary,
    paddingBottom: spacing.md,
  },
  list: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
