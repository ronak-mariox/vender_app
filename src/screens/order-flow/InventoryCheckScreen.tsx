import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { findFlaggedItem } from './flowMock';

type Props = NativeStackScreenProps<AuthStackParamList, 'InventoryCheck'>;

export function InventoryCheckScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('ProductPicking', { orderId });
    }, 1600);
    return () => clearTimeout(timer);
  }, [navigation, orderId]);

  if (!order) return null;

  const flagged = findFlaggedItem(order.products);

  return (
    <FlowStatusScreen
      headerTitle="Checking Inventory"
      onBack={() => navigation.goBack()}
      icon="package"
      iconColor={colors.primary}
      iconBg={colors.primarySurface}
      iconRingColor={colors.primaryBorder}
      iconCircleSize={100}
      iconSize={36}
      heading="Checking inventory..."
      headingSize={20}
      subtitle={`Verifying stock levels for all ${order.products.length} items in ${order.id}`}
    >
      <View style={styles.card}>
        {order.products.map((product, index) => {
          const isFlagged = flagged?.name === product.name;
          const beforeFlagged = flagged ? index < order.products.indexOf(flagged) : true;
          const state = isFlagged ? 'missing' : beforeFlagged ? 'available' : 'pending';
          return (
            <View
              key={`${product.name}-${index}`}
              style={[styles.row, index < order.products.length - 1 && styles.rowDivider]}
            >
              <View
                style={[
                  styles.statusIcon,
                  state === 'missing' && styles.statusIconMissing,
                  state === 'pending' && styles.statusIconPending,
                ]}
              >
                {state === 'pending' ? (
                  <Icon name="refresh-cw" size={11} color={colors.textTertiary} />
                ) : (
                  <Icon name={state === 'missing' ? 'x' : 'check'} size={11} color={colors.white} strokeWidth={3} />
                )}
              </View>
              <Text style={[styles.name, state === 'missing' && styles.nameMissing]} numberOfLines={1}>
                {product.name}
              </Text>
              <Text
                style={[
                  styles.statusLabel,
                  state === 'missing' && styles.statusLabelMissing,
                  state === 'available' && styles.statusLabelAvailable,
                ]}
              >
                {state === 'available' ? '✓ Available' : state === 'missing' ? '✗ Not found' : 'Checking...'}
              </Text>
            </View>
          );
        })}
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    marginTop: spacing.huge,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconMissing: {
    backgroundColor: colors.error,
  },
  statusIconPending: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  name: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  nameMissing: {
    color: colors.error,
    fontFamily: fontFamilies.semibold,
  },
  statusLabel: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  statusLabelAvailable: {
    color: colors.primary,
  },
  statusLabelMissing: {
    color: colors.error,
  },
});
