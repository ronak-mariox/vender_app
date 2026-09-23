import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  label?: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  leftIcon?: IconName;
  isPassword?: boolean;
  error?: string;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  maxLength?: number;
  rightElement?: React.ReactNode;
  testID?: string;
};

export function Input({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  isPassword = false,
  error,
  helperText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  maxLength,
  rightElement,
  testID,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(isPassword);
  const hasError = Boolean(error);
  const ringColor = hasError ? colors.errorFocusRing : colors.primaryFocusRing;
  const borderColor = hasError ? colors.error : focused ? colors.primary : colors.border;
  const showRing = focused || hasError;

  return (
    <View style={styles.container} testID={testID}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.required}> *</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.ringWrapper,
          { borderColor: showRing ? ringColor : 'transparent' },
        ]}
      >
        <View
          style={[
            styles.field,
            { borderColor },
            hasError && styles.fieldError,
            !editable && styles.fieldDisabled,
          ]}
        >
          {leftIcon ? (
            <Icon name={leftIcon} size={16} color={colors.textSecondary} />
          ) : null}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            secureTextEntry={secure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {isPassword ? (
            <Pressable onPress={() => setSecure(s => !s)} hitSlop={8}>
              <Icon name={secure ? 'eye-off' : 'eye'} size={16} color={colors.textSecondary} />
            </Pressable>
          ) : (
            rightElement
          )}
        </View>
      </View>

      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
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
    alignItems: 'center',
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  ringWrapper: {
    borderRadius: radii.md + 3,
    borderWidth: 3,
  },
  field: {
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
  fieldError: {
    backgroundColor: colors.errorSurface,
  },
  fieldDisabled: {
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
