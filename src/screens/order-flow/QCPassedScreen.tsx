import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'QCPassed'>;

export function QCPassedScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  return (
    <FlowStatusScreen
      icon="check-circle"
      iconColor={colors.primary}
      iconBg="#F0FDF4"
      iconRingColor={colors.primaryBorder}
      iconCircleSize={100}
      iconSize={52}
      heading="All Items Passed!"
      headingSize={24}
      headingWeight="extrabold"
      subtitle={`All ${order.products.length} items passed quality inspection. Proceed to pack the order.`}
      footerDivider={false}
      footer={
        <FlexButton
          label="Start Packing →"
          onPress={() => navigation.replace('PackingStart', { orderId })}
          background={colors.primary}
          textColor={colors.white}
          flex={1}
        />
      }
    >
      <View style={styles.card}>
        {order.products.map((product, index) => (
          <View key={`${product.name}-${index}`} style={[styles.row, index < order.products.length - 1 && styles.rowDivider]}>
            <Icon name="check-circle" size={16} color={colors.primary} />
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.passed}>Passed</Text>
          </View>
        ))}
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  passed: {
    ...typography.tinyBold,
    color: colors.primary,
  },
});
