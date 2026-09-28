import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { DetailCard, DetailRow } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { getNotificationMeta } from './notificationMeta';
import { useNotifications } from '../../context/NotificationsContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'LowStockNotification'>;

export function LowStockNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const { products } = useProductCatalog();

  const notification = getNotification(notificationId);
  const matchedProduct = notification?.productId
    ? products.find(product => product.id === notification.productId)
    : undefined;

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Low Stock Alert" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Notification not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = getNotificationMeta(notification.category);
  const productName = matchedProduct?.name ?? notification.productName;
  const maxCapacity = matchedProduct?.maxStock ?? 0;
  const stockRatio =
    matchedProduct && maxCapacity > 0 ? Math.min(1, Math.max(0, matchedProduct.stock / maxCapacity)) : null;
  const otherLowStockCount = products.filter(
    product => product.status === 'low-stock' && product.id !== matchedProduct?.id,
  ).length;

  function handleUpdateStock() {
    if (matchedProduct) {
      navigation.navigate('UpdateQuantity', { productId: matchedProduct.id });
    } else {
      navigation.navigate('LowStock');
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Low Stock Alert" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        {matchedProduct ? (
          <DetailCard>
            <DetailRow label="Product" value={matchedProduct.name} />
            <DetailRow label="Current Stock" value={`${matchedProduct.stock} units`} />
            <DetailRow label="Reorder Threshold" value={`${matchedProduct.reorderLevel} units`} />
            {maxCapacity > 0 ? <DetailRow label="Max Capacity" value={`${maxCapacity} units`} /> : null}
            {stockRatio !== null ? (
              <View style={styles.stockLevelBlock}>
                <View style={styles.stockLevelRow}>
                  <Text style={styles.stockLevelLabel}>Stock level</Text>
                  <Text style={[styles.stockLevelValue, { color: meta.accentColor }]}>
                    {matchedProduct.stock} / {maxCapacity} units
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${stockRatio * 100}%`, backgroundColor: meta.accentColor },
                    ]}
                  />
                </View>
              </View>
            ) : null}
          </DetailCard>
        ) : (
          <Text style={styles.emptyText}>
            {productName ? `"${productName}" is no longer in your catalog.` : 'This product is no longer in your catalog.'}
          </Text>
        )}

        {otherLowStockCount > 0 ? (
          <Pressable onPress={() => navigation.navigate('LowStock')} hitSlop={8}>
            <Text style={styles.linkText}>
              + {otherLowStockCount} other product{otherLowStockCount === 1 ? '' : 's'} also low — view all
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button label="Update Stock" onPress={handleUpdateStock} />
          </View>
          <View style={styles.footerButton}>
            <Button label="Alert Settings" variant="outline" onPress={() => navigation.navigate('LowStockAlert')} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  stockLevelBlock: {
    paddingTop: spacing.lg,
    width: '100%',
  },
  stockLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLevelLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stockLevelValue: {
    ...typography.captionSemibold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.xs,
    width: '100%',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  linkText: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
