import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { InfoBanner } from '../../components';
import { Icon } from '../../icons/Icon';
import { ORDER_STATUS_META } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';
import { formatMoney, openOrder, placedTime, useOrder, useOrderAction } from '../orders/orderHelpers';
import { OrderLoadState } from '../orders/OrderLoadState';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'NewOrderReceived'>;

export function NewOrderReceivedScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { order, loading, error, retry } = useOrder(orderId);
  const { perform, busy } = useOrderAction(navigation);

  if (!order) {
    return (
      <OrderLoadState
        title="New Order"
        loading={loading}
        error={error}
        onBack={() => navigation.goBack()}
        onRetry={retry}
      />
    );
  }

  const stillNew = order.status === 'placed';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.banner}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.bannerIcon}>
          <Icon name="arrow-left" size={20} color={colors.white} />
        </Pressable>
        <View style={styles.bannerTextColumn}>
          <Text style={styles.bannerTitle}>{stillNew ? 'New Order Received!' : 'Order Updated'}</Text>
          <Text style={styles.bannerSubtitle}>
            {order.orderNumber} · {order.itemsCount} items · {formatMoney(order.amount)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!stillNew ? (
          <InfoBanner
            variant="warning"
            message={`This order is now "${ORDER_STATUS_META[order.status].label}" and can no longer be accepted or rejected here.`}
            bordered
          />
        ) : null}

        <View style={styles.card}>
          <View style={styles.orderTopRow}>
            <View>
              <Text style={styles.orderId}>{order.orderNumber}</Text>
              <Text style={styles.orderMeta}>
                {placedTime(order)} · {order.paymentMethod}
              </Text>
            </View>
            <Text style={styles.orderAmount}>{formatMoney(order.amount)}</Text>
          </View>

          <View style={styles.customerRow}>
            <Icon name="user" size={16} color={colors.textSecondary} />
            <View style={styles.customerTextColumn}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              {order.location ? <Text style={styles.customerMeta}>{order.location}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Items ({order.products.length})</Text>
          {order.products.map((product, index) => (
            <View
              key={`${product.productId}-${product.variantId}`}
              style={[styles.itemRow, index < order.products.length - 1 && styles.itemRowDivider]}
            >
              <ProductThumb
                imageUrl={product.imageUrl}
                style={styles.itemIcon}
                iconSize={14}
                iconColor={colors.textSecondary}
              />
              <Text style={styles.itemName} numberOfLines={1}>
                {product.name}
                {product.variantLabel ? ` · ${product.variantLabel}` : ''}
              </Text>
              <Text style={styles.itemQty}>×{product.qty}</Text>
              <Text style={styles.itemPrice}>{formatMoney(product.subtotal)}</Text>
            </View>
          ))}
        </View>

        {order.specialInstructions ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Special Instructions</Text>
            <View style={styles.instructionsBox}>
              <Icon name="alert-triangle" size={13} color={colors.warningDark} />
              <Text style={styles.instructionsText}>&quot;{order.specialInstructions}&quot;</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {stillNew ? (
          <>
            <FlexButton
              label="Reject"
              onPress={() => navigation.navigate('RejectReason', { orderId })}
              background={colors.errorSurface}
              textColor={colors.error}
              borderColor={colors.errorBorder}
              flex={1}
              disabled={busy}
            />
            <FlexButton
              label={busy ? 'Accepting…' : 'Accept Order →'}
              onPress={() => perform('accept', orderId)}
              background={colors.primary}
              textColor={colors.white}
              flex={1.9}
              disabled={busy}
            />
          </>
        ) : (
          <FlexButton
            label="View Order"
            onPress={() => {
              navigation.goBack();
              openOrder(navigation, order);
            }}
            background={colors.primary}
            textColor={colors.white}
            flex={1}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#1570EF',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextColumn: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.extrabold,
    color: colors.white,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontFamily: 'Courier',
    fontWeight: '700',
    fontSize: 13,
    color: colors.textPrimary,
  },
  orderMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
    paddingTop: 2,
  },
  orderAmount: {
    ...typography.h3,
    fontSize: 18,
    color: colors.primary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  customerTextColumn: {
    flex: 1,
    gap: 1,
  },
  customerName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  customerMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  itemQty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemPrice: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  instructionsBox: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  instructionsText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
