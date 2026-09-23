import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from '../order-flow/FlowStatusScreen';
import { FlexButton } from '../order-flow/FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PriceUpdated'>;

export function PriceUpdatedScreen({ navigation, route }: Props) {
  const { productId, headline, message } = route.params;
  const { products } = useProductCatalog();
  const product = products.find(item => item.id === productId);
  if (!product) return null;

  const discountPct = product.mrp > 0 ? ((product.mrp - product.sellingPrice) / product.mrp) * 100 : 0;

  return (
    <FlowStatusScreen
      icon="check-circle"
      iconColor={colors.primary}
      iconBg={colors.primarySurface}
      iconRingColor={colors.primaryBorder}
      heading="Price Updated!"
      subtitle={message}
      footer={
        <View style={styles.footerColumn}>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="View Product"
              onPress={() => navigation.replace('ProductPricingDetail', { productId })}
              background={colors.white}
              textColor={colors.primary}
              borderColor={colors.primary}
              flex={1}
            />
          </View>
          <View style={styles.fullWidthRow}>
            <FlexButton
              label="Update More Prices"
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PricingOverview' }] })}
              background={colors.primary}
              textColor={colors.white}
              flex={1}
            />
          </View>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>Updated Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>New {headline}</Text>
          <Text style={styles.value}>
            {headline === 'Tax' ? `${product.gstRate}% GST` : `₹${headline === 'MRP' ? product.mrp : product.sellingPrice}`}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>
          <Text style={styles.value}>{discountPct.toFixed(1)}%</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.label}>Effective</Text>
          <Text style={styles.value}>Immediately</Text>
        </View>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.primarySurface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  rowLast: {
    paddingBottom: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  footerColumn: {
    gap: spacing.sm,
  },
  fullWidthRow: {
    flexDirection: 'row',
  },
});
