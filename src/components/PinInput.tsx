import React, { useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { colors, radii } from '../theme';

export type PinInputStatus = 'default' | 'error';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  status?: PinInputStatus;
  autoFocus?: boolean;
};

export function PinInput({ length = 4, value, onChange, status = 'default', autoFocus = false }: Props) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const digits = value.split('');
  const isError = status === 'error';

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

  function handleKeyPress(event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, index) => {
        const digit = digits[index] ?? '';
        const isFilled = Boolean(digit);

        return (
          <View key={index} style={[styles.box, isError && styles.boxError]}>
            {isFilled ? <View style={[styles.dot, isError && styles.dotError]} /> : null}
            <TextInput
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={styles.hiddenInput}
              value={digit}
              onChangeText={text => handleChangeDigit(text, index)}
              onKeyPress={event => handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={autoFocus && index === 0}
              selectTextOnFocus
              secureTextEntry
              textContentType="oneTimeCode"
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  box: {
    flex: 1,
    height: 52,
    borderRadius: radii.md - 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxError: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.errorBorder,
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textPrimary,
  },
  dotError: {
    backgroundColor: colors.error,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
});
