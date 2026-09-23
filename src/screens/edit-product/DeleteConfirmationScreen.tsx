import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DeleteConfirmation'>;

export function DeleteConfirmationScreen({ navigation, route }: Props) {
  const { productName, sku } = route.params;

  const deletedAt = useMemo(
    () =>
      new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon name="check-circle" size={52} color={colors.primary} />
          </View>
          <Text style={styles.heading}>Product Deleted</Text>
          <Text style={styles.subtitle}>{productName} has been permanently removed from your catalog.</Text>

          <View style={styles.detailsCard}>
            <DetailRow label="Product" value={productName} />
            <DetailRow label="SKU" value={sku} />
            <DetailRow label="Deleted at" value={deletedAt} last />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="View My Products"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'ProductCatalog' }] })}
          />
          <Button
            label="Go to Dashboard"
            variant="outline"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowDivider]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 9999,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heading: {
    ...typography.h1,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 80,
  },
  detailValue: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    gap: spacing.lg,
    paddingTop: spacing.huge,
  },
});
