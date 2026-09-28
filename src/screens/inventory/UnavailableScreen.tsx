import React, { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, InventoryRow } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventoryRefresh } from './useInventoryRefresh';
import { isInventoryCategory, UNAVAILABLE_REASON_LABEL } from '../../utils/inventory';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Unavailable'>;

export function UnavailableScreen({ navigation }: Props) {
  const { products } = useProductCatalog();
  const { refreshing, onRefresh } = useInventoryRefresh();
  const unavailableProducts = useMemo(
    () => products.filter(product => isInventoryCategory(product, 'unavailable')),
    [products],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Unavailable</Text>
          <Text style={styles.headerSubtitle}>Products not visible to customers</Text>
        </View>
      </View>

      <FlatList
        data={unavailableProducts}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const reason = UNAVAILABLE_REASON_LABEL[item.status] ?? { label: item.status, tone: 'neutral' as const };
          return (
            <InventoryRow
              name={item.name}
              imageUrl={item.images?.[0]}
              sku={item.sku}
              muted
              onPress={() => navigation.navigate('ProductStockDetails', { productId: item.id })}
              subtitle={
                <View style={styles.badgeWrapper}>
                  <Badge label={reason.label} tone={reason.tone} />
                </View>
              }
              right={
                <Pressable
                  style={styles.fixButton}
                  onPress={() =>
                    navigation.navigate(
                      item.status === 'inactive' ? 'ActivateProduct' : 'EditProduct',
                      { productId: item.id },
                    )
                  }
                >
                  <Text style={styles.fixButtonText}>Fix</Text>
                </Pressable>
              }
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={32} color={colors.primary} />
            <Text style={styles.emptyText}>Every product is available to customers</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextColumn: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  badgeWrapper: {
    paddingTop: spacing.xs,
  },
  fixButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fixButtonText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.massive,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
