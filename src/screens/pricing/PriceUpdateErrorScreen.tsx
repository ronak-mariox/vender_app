import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PriceUpdateError'>;

export function PriceUpdateErrorScreen({ navigation, route }: Props) {
  const { productId, pendingMrp, pendingSellingPrice, headline, message, errorCode, errorField } = route.params;
  const { products, updateProduct } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  const [retrying, setRetrying] = useState(false);
  if (!product) return null;

  async function handleRetry() {
    if (retrying) return;
    const patch: { mrp?: number; sellingPrice?: number; updatedAt: number } = { updatedAt: Date.now() };
    if (pendingMrp !== undefined) patch.mrp = pendingMrp;
    if (pendingSellingPrice !== undefined) patch.sellingPrice = pendingSellingPrice;
    setRetrying(true);
    try {
      await updateProduct(productId, patch);
      navigation.replace('PriceUpdated', { productId, headline, message });
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setRetrying(false);
    }
  }

  return (
    <FlowStatusScreen
      icon="alert-circle"
      iconColor={colors.error}
      iconBg={colors.errorSurface}
      iconRingColor={colors.errorBorder}
      heading="Update Failed"
      subtitle="Price update could not be processed. The system returned an error."
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label={retrying ? 'Retrying…' : 'Retry'}
              onPress={handleRetry}
              background={colors.primary}
              textColor={colors.white}
              flex={1}
              disabled={retrying}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Contact Support"
              onPress={() => Alert.alert('Contact Support', 'Coming soon.')}
              background={colors.white}
              textColor={colors.primary}
              borderColor={colors.primary}
              flex={1}
            />
          </View>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>Error Details</Text>
        <Text style={styles.line}>
          Status: <Text style={styles.lineStrong}>422 Unprocessable Entity</Text>
        </Text>
        <Text style={styles.line}>
          Code: <Text style={styles.lineError}>{errorCode}</Text>
        </Text>
        <Text style={styles.line}>
          Field: <Text style={styles.lineStrong}>{errorField}</Text>
        </Text>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.caption,
    fontFamily: 'Courier',
    color: colors.textSecondary,
  },
  line: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 21.6,
  },
  lineStrong: {
    color: colors.textPrimary,
  },
  lineError: {
    color: colors.error,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
});
