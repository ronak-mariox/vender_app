import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer, Switch } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductAvailability'>;

const CHANNELS: { key: 'onlineStore' | 'inStorePos' | 'bulkOrders'; icon: IconName; title: string; subtitle: string }[] = [
  { key: 'onlineStore', icon: 'globe', title: 'Online Store', subtitle: 'Visible on Verdant platform' },
  { key: 'inStorePos', icon: 'home', title: 'In-Store / POS', subtitle: 'Available for walk-in sales' },
  { key: 'bulkOrders', icon: 'layers', title: 'Bulk Orders', subtitle: 'Enable wholesale/bulk purchasing' },
];

export function ProductAvailabilityScreen({ navigation }: Props) {
  const { draft, updateAvailability } = useProductDraft();
  const [onlineStore, setOnlineStore] = useState(draft.availability.onlineStore);
  const [inStorePos, setInStorePos] = useState(draft.availability.inStorePos);
  const [bulkOrders, setBulkOrders] = useState(draft.availability.bulkOrders);
  const [schedulePublish, setSchedulePublish] = useState(draft.availability.schedulePublish);

  const channelValues = { onlineStore, inStorePos, bulkOrders };
  const channelSetters = {
    onlineStore: setOnlineStore,
    inStorePos: setInStorePos,
    bulkOrders: setBulkOrders,
  };

  function handleContinue() {
    updateAvailability({ onlineStore, inStorePos, bulkOrders, schedulePublish });
    navigation.navigate('ReviewProduct');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Availability"
        currentStep={10}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard title="Sales Channels">
          {CHANNELS.map(channel => (
            <View key={channel.key} style={styles.channelRow}>
              <View style={styles.channelIcon}>
                <Icon name={channel.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.channelTextColumn}>
                <Text style={styles.channelTitle}>{channel.title}</Text>
                <Text style={styles.channelSubtitle}>{channel.subtitle}</Text>
              </View>
              <Switch
                value={channelValues[channel.key]}
                onChange={channelSetters[channel.key]}
              />
            </View>
          ))}
        </FormSectionCard>

        <View style={styles.card}>
          <View style={styles.scheduleRow}>
            <View style={styles.channelTextColumn}>
              <Text style={styles.channelTitle}>Schedule Publish</Text>
              <Text style={styles.channelSubtitle}>Set a date/time to go live</Text>
            </View>
            <Switch value={schedulePublish} onChange={setSchedulePublish} />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="Review Product" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTextColumn: {
    flex: 1,
    gap: 2,
  },
  channelTitle: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  channelSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
