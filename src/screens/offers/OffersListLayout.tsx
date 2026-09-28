import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Offer, useOffers } from '../../context/OffersContext';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { getApiErrorMessage } from '../../services/api';
import { OfferActionsSheet } from './OfferActionsSheet';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

export type OffersTab = 'all' | 'active' | 'scheduled' | 'expired';

const TAB_ROUTES: Record<OffersTab, keyof AuthStackParamList> = {
  all: 'OffersOverview',
  active: 'ActiveOffers',
  scheduled: 'ScheduledOffers',
  expired: 'ExpiredOffers',
};

/** Paused offers live in the Active tab (with a paused badge) since they resume in place. */
export function offersForTab(offers: Offer[], tab: OffersTab): Offer[] {
  if (tab === 'all') return offers;
  if (tab === 'active') return offers.filter(offer => offer.status === 'active' || offer.status === 'paused');
  return offers.filter(offer => offer.status === tab);
}

/** Shared edit / pause-resume / duplicate / delete actions plus the "more" sheet for offer lists. */
export function useOfferActions() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { resumeOffer, isOfferPending } = useOffers();
  const { loadFromOffer } = useOfferDraft();
  const [menuOffer, setMenuOffer] = useState<Offer | null>(null);

  const editOffer = useCallback(
    (offer: Offer) => navigation.navigate('CreateOffer', { offerId: offer.id }),
    [navigation],
  );

  const duplicateOffer = useCallback(
    (offer: Offer) => {
      loadFromOffer(offer, null);
      navigation.navigate('CreateOffer', {});
    },
    [loadFromOffer, navigation],
  );

  const deleteOffer = useCallback(
    (offer: Offer) => navigation.navigate('DeleteOffer', { offerId: offer.id }),
    [navigation],
  );

  const togglePause = useCallback(
    async (offer: Offer) => {
      if (isOfferPending(offer.id)) return;
      if (offer.status !== 'paused') {
        navigation.navigate('PauseOffer', { offerId: offer.id });
        return;
      }
      try {
        await resumeOffer(offer.id);
      } catch (err) {
        Alert.alert('Could not resume offer', getApiErrorMessage(err));
      }
    },
    [isOfferPending, navigation, resumeOffer],
  );

  const sheet = (
    <OfferActionsSheet
      visible={!!menuOffer}
      offer={menuOffer}
      onClose={() => setMenuOffer(null)}
      onEdit={() => menuOffer && editOffer(menuOffer)}
      onPauseResume={() => menuOffer && togglePause(menuOffer)}
      onDuplicate={() => menuOffer && duplicateOffer(menuOffer)}
      onDelete={() => menuOffer && deleteOffer(menuOffer)}
    />
  );

  return { openMenu: setMenuOffer, sheet, editOffer, duplicateOffer, deleteOffer, togglePause, isOfferPending };
}

type Props = {
  activeTab: OffersTab;
  children: React.ReactNode;
  emptyText: string;
  itemCount: number;
  beforeList?: React.ReactNode;
  overlay?: React.ReactNode;
};

export function OffersListLayout({ activeTab, children, emptyText, itemCount, beforeList, overlay }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { offers, loading, error, refresh } = useOffers();
  const { resetDraft } = useOfferDraft();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => {});
    }, [refresh]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch {
      // error surfaces through context.error
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const tabs = useMemo(
    () =>
      (['all', 'active', 'scheduled', 'expired'] as OffersTab[]).map(tab => ({
        key: tab,
        label: `${tab.charAt(0).toUpperCase()}${tab.slice(1)} (${offersForTab(offers, tab).length})`,
        active: tab === activeTab,
      })),
    [offers, activeTab],
  );

  const initialLoading = loading && offers.length === 0;
  const showError = Boolean(error) && offers.length === 0 && !initialLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Promotions</Text>
        <Pressable
          style={styles.createButton}
          onPress={() => {
            resetDraft();
            navigation.navigate('CreateOffer', {});
          }}
        >
          <Icon name="plus" size={16} color={colors.white} />
          <Text style={styles.createButtonText}>Create Offer</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.tabRow}>
          {tabs.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tabPill, tab.active && styles.tabPillActive]}
              onPress={() => {
                if (!tab.active) navigation.navigate(TAB_ROUTES[tab.key] as never);
              }}
            >
              <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        {initialLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : showError ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {beforeList}
            <View style={styles.list}>
              {itemCount === 0 ? <Text style={styles.stateText}>{emptyText}</Text> : children}
            </View>
          </>
        )}
      </ScrollView>
      {overlay}
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
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  createButtonText: {
    ...typography.labelSemibold,
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    ...typography.labelSemibold,
    color: colors.white,
  },
  list: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  stateBlock: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.huge,
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.huge,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryButtonText: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
});
