import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { InfoBanner, StatusChip } from '../../components';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';
import { findFlaggedItem } from './flowMock';

const AMBER_TEXT = '#A16207';

type Props = NativeStackScreenProps<AuthStackParamList, 'ItemAvailability'>;

export function ItemAvailabilityScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const flagged = findFlaggedItem(order.products);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Item Availability</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <InfoBanner
          variant="warning"
          message="1 item couldn't be found in your inventory. Choose how to handle it before proceeding."
        />

        {order.products.map((product, index) => {
          const isFlagged = flagged?.name === product.name;
          return (
            <View key={`${product.name}-${index}`} style={[styles.card, isFlagged && styles.cardMissing]}>
              <Pressable
                style={styles.cardTopRow}
                onPress={() =>
                  navigation.navigate('MissingItemDecision', {
                    orderId,
                    itemName: product.name,
                    itemPrice: product.price,
                    itemQty: product.qty,
                  })
                }
                disabled={!isFlagged}
              >
                <View style={[styles.iconAvatar, isFlagged && styles.iconAvatarMissing]}>
                  <Icon name="package" size={16} color={isFlagged ? colors.error : colors.primary} />
                </View>
                <View style={styles.textColumn}>
                  <Text style={styles.name} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.meta}>
                    ×{product.qty} · ₹{product.price * product.qty}
                  </Text>
                </View>
                <StatusChip
                  label={isFlagged ? 'Missing' : 'Available'}
                  color={isFlagged ? colors.error : colors.primary}
                  background={isFlagged ? colors.errorSurface : colors.primarySurface}
                />
              </Pressable>
              {isFlagged ? (
                <View style={styles.actionsRow}>
                  <Pressable
                    style={styles.replaceButton}
                    onPress={() =>
                      navigation.navigate('ReplaceItem', {
                        orderId,
                        itemName: product.name,
                        itemPrice: product.price,
                        itemQty: product.qty,
                        source: 'missing',
                      })
                    }
                  >
                    <Text style={styles.replaceButtonText}>Replace</Text>
                  </Pressable>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() =>
                      navigation.navigate('RemoveItem', {
                        orderId,
                        itemName: product.name,
                        itemPrice: product.price,
                        itemQty: product.qty,
                        source: 'missing',
                      })
                    }
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.blockedButton}>
          <Text style={styles.blockedButtonText}>Resolve Missing Item First</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardMissing: {
    borderColor: colors.errorBorder,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAvatarMissing: {
    backgroundColor: colors.errorSurface,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md + spacing.xs,
  },
  replaceButton: {
    flex: 1,
    height: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: colors.warningSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceButtonText: {
    ...typography.captionSemibold,
    color: AMBER_TEXT,
  },
  removeButton: {
    flex: 1,
    height: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    ...typography.captionSemibold,
    color: colors.error,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  blockedButton: {
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
