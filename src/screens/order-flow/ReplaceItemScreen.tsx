import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';
import { replacementCandidatesFor } from './flowMock';

type Props = NativeStackScreenProps<AuthStackParamList, 'ReplaceItem'>;

function shortLabel(name: string) {
  const base = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return base;
  return `${words[0]} ${words[words.length - 1]}`;
}

export function ReplaceItemScreen({ navigation, route }: Props) {
  const { orderId, itemName, itemPrice, itemQty, source } = route.params;
  const { replaceOrderItem, removeOrderItem } = useOrders();
  const candidates = replacementCandidatesFor({ name: itemName, price: itemPrice, qty: itemQty });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = candidates[selectedIndex];

  function handleUseReplacement() {
    replaceOrderItem(orderId, itemName, { name: selected.name, price: selected.price, qty: itemQty });
    navigation.replace('OrderUpdated', {
      orderId,
      resolution: 'replaced',
      itemName: selected.name,
      itemPrice: selected.price,
      source,
    });
  }

  function handleRemoveInstead() {
    removeOrderItem(orderId, itemName);
    navigation.replace('OrderUpdated', { orderId, resolution: 'removed', itemName, itemPrice, source });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Replace Item</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Icon name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.bannerText}>
            Replacing: <Text style={styles.bannerTextBold}>{itemName.replace(/[()]/g, '')}</Text> (₹{itemPrice})
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Best Matches In Your Inventory</Text>

        {candidates.map((candidate, index) => {
          const active = index === selectedIndex;
          return (
            <Pressable
              key={candidate.name}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelectedIndex(index)}
            >
              <View style={[styles.iconAvatar, active && styles.iconAvatarActive]}>
                <Icon name="package" size={18} color={active ? colors.primary : colors.textSecondary} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.candidateName} numberOfLines={1}>
                  {candidate.name}
                </Text>
                <Text style={styles.candidateMeta}>
                  {candidate.stock} in stock · {candidate.matchPct}% match
                </Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={[styles.candidatePrice, active && styles.candidatePriceActive]}>
                  ₹{candidate.price}
                </Text>
                {candidate.bestMatch ? <Text style={styles.bestMatchText}>BEST MATCH</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Remove Item"
          onPress={handleRemoveInstead}
          background={colors.surface}
          textColor={colors.textSecondary}
          borderColor={colors.border}
          flex={1}
        />
        <FlexButton
          label={`Use ${shortLabel(selected.name)} →`}
          onPress={handleUseReplacement}
          background={colors.primary}
          textColor={colors.white}
          flex={2}
        />
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: '#B91C1C',
    flexShrink: 1,
  },
  bannerTextBold: {
    fontFamily: fontFamilies.bold,
    color: '#B91C1C',
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingTop: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  iconAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAvatarActive: {
    backgroundColor: 'rgba(28,166,114,0.13)',
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  priceColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  candidateName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  bestMatchText: {
    fontSize: 10,
    lineHeight: 15,
    fontFamily: fontFamilies.bold,
    color: colors.primary,
  },
  candidateMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  candidatePrice: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.extrabold,
    color: colors.textPrimary,
  },
  candidatePriceActive: {
    color: colors.primary,
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
