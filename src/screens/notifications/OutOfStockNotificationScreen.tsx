import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { DetailCard, DetailRow } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { getNotificationMeta } from './notificationMeta';
import { useNotifications } from '../../context/NotificationsContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OutOfStockNotification'>;

export function OutOfStockNotificationScreen({ navigation, route }: Props) {
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
        <NavHeader title="Out of Stock" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Notification not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = getNotificationMeta(notification.category);
  const productName = matchedProduct?.name ?? notification.productName ?? 'This product';

  function handleAddStock() {
    if (matchedProduct) {
      navigation.navigate('UpdateQuantity', { productId: matchedProduct.id });
    } else {
      Alert.alert('Product not found', `"${productName}" is no longer in your catalog.`);
    }
  }

  function handleMarkUnavailable() {
    if (matchedProduct) {
      navigation.navigate('DeactivateProduct', { productId: matchedProduct.id });
    } else {
      Alert.alert('Product not found', `"${productName}" is no longer in your catalog.`);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Out of Stock" onBack={() => navigation.goBack()} />
      <View style={styles.heroWrapper}>
        <NotificationHero
          icon={meta.icon}
          iconColor={meta.iconColor}
          iconBg={meta.iconBg}
          title={notification.title}
          subtitle={notification.subtitle}
          timeLabel={notification.timeLabel}
        />
        <View style={styles.urgencyDot} pointerEvents="none" />
      </View>
      <View style={styles.content}>
        {matchedProduct ? (
          <DetailCard>
            <DetailRow label="Product" value={matchedProduct.name} />
            <DetailRow label="Current Stock" value={`${matchedProduct.stock} units`} bold />
          </DetailCard>
        ) : (
          <InfoBanner variant="neutral" message={`${productName} is no longer in your catalog.`} />
        )}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button label="Add Stock Now" onPress={handleAddStock} disabled={!matchedProduct} />
          </View>
          <View style={styles.footerButton}>
            <Button
              label="Mark Unavailable"
              variant="outline"
              onPress={handleMarkUnavailable}
              disabled={!matchedProduct}
            />
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
  heroWrapper: {
    position: 'relative',
    width: '100%',
  },
  urgencyDot: {
    position: 'absolute',
    top: spacing.xxl - 4,
    left: '50%',
    marginLeft: 18,
    width: 14,
    height: 14,
    borderRadius: radii.full,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
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
