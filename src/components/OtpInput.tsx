import React, { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { colors, radii, typography } from '../theme';

export type OtpStatus = 'default' | 'error' | 'expired';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  status?: OtpStatus;
  editable?: boolean;
  autoFocus?: boolean;
};

export function OtpInput({
  length = 6,
  value,
  onChange,
  status = 'default',
  editable = true,
  autoFocus = false,
}: Props) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const digits = value.split('');

  function handleChangeDigit(text: string, index: number) {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (!sanitized) {
      const next = value.slice(0, index) + value.slice(index + 1);
      onChange(next);
      return;
    }
    const lastChar = sanitized[sanitized.length - 1];
    const next = value.slice(0, index) + lastChar + value.slice(index + 1);
    onChange(next.slice(0, length));
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, index) => {
        const digit = digits[index] ?? '';
        const isFilled = Boolean(digit);
        const isError = status === 'error';
        const isExpired = status === 'expired';

        return (
          <View
            key={index}
            style={[
              styles.box,
              isFilled && !isError && !isExpired && styles.boxFilled,
              (isError || isExpired) && styles.boxError,
            ]}
          >
            {isExpired ? (
              <Text style={styles.dotExpired}>•</Text>
            ) : (
              <TextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.digitInput, isError && styles.digitError]}
                value={digit}
                onChangeText={text => handleChangeDigit(text, index)}
                onKeyPress={event => handleKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={editable}
                autoFocus={autoFocus && index === 0}
                selectTextOnFocus
                textContentType="oneTimeCode"
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: colors.primarySurface,
  },
  boxError: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
  },
  digitInput: {
    ...typography.otpDigit,
    color: colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  digitError: {
    color: colors.error,
  },
  dotExpired: {
    ...typography.otpDigit,
    color: colors.error,
  },
});
