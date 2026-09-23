import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { isValidBarcode, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductBarcode'>;

type Errors = FormErrors<'barcode'>;

function generateEan13() {
  let code = '890';
  for (let i = 0; i < 10; i += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

export function ProductBarcodeScreen({ navigation }: Props) {
  const { draft, updateIdentifiers } = useProductDraft();
  const [barcode, setBarcode] = useState(draft.identifiers?.barcode ?? '');
  const [scanning, setScanning] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isValid = isValidBarcode(barcode.trim());

  function handleScan() {
    setScanning(true);
    setTimeout(() => {
      setBarcode(generateEan13());
      setScanning(false);
      setErrors({});
    }, 600);
  }

  function handleContinue() {
    const trimmed = barcode.trim();
    const nextErrors: Errors = {};
    if (trimmed && !isValidBarcode(trimmed)) {
      nextErrors.barcode = 'Enter a valid 13-digit barcode number';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateIdentifiers({ sku: draft.identifiers?.sku ?? '', barcode: trimmed });
    navigation.navigate('ProductStockQuantity');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Barcode"
        currentStep={8}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.scanner} onPress={handleScan}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.scanLine} />
          </View>
          <Text style={styles.scannerHint}>{scanning ? 'Scanning...' : 'Tap to simulate a barcode scan'}</Text>
        </Pressable>

        <FormSectionCard title="Or Enter Manually">
          <View>
            <Text style={styles.label}>Barcode Number</Text>
            <View style={[styles.field, errors.barcode && styles.fieldError]}>
              <Icon name="barcode" size={16} color={colors.textSecondary} />
              <TextInput
                value={barcode}
                onChangeText={text => {
                  setBarcode(text.replace(/[^0-9]/g, ''));
                  if (errors.barcode) setErrors({});
                }}
                placeholder="e.g. 8901058000356"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                maxLength={13}
                style={styles.input}
              />
              {isValid ? <Icon name="check-circle" size={16} color={colors.primary} /> : null}
            </View>
            {errors.barcode ? (
              <Text style={styles.errorText}>{errors.barcode}</Text>
            ) : (
              <Text style={styles.helperText}>EAN-13 / UPC / QR barcode number</Text>
            )}
          </View>

          {isValid ? (
            <View style={styles.verifiedBanner}>
              <Icon name="check-circle" size={14} color={colors.primaryDark} />
              <Text style={styles.verifiedText}>
                Product matched: {draft.basicInfo?.name || 'This product'} · EAN-13
              </Text>
            </View>
          ) : null}
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  scanner: {
    backgroundColor: '#1F2937',
    borderRadius: radii.xl,
    paddingVertical: spacing.huge,
    alignItems: 'center',
    gap: spacing.lg,
  },
  scanFrame: {
    width: 200,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.primary,
  },
  scannerHint: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'Courier',
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  fieldError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
