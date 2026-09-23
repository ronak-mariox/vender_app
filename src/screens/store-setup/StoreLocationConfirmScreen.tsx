import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreLocationConfirm'>;

export function StoreLocationConfirmScreen({ navigation }: Props) {
  const { data, updateAddress } = useStoreSetup();
  const address = data.address;

  function handleConfirm() {
    if (address) {
      updateAddress(address);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
      <View style={styles.mapBackground}>
        {MAP_BLOCKS.map((block, index) => (
          <View key={index} style={[styles.mapBlock, block]} />
        ))}
      </View>

      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={colors.textSecondary} />
            <Text style={styles.searchText} numberOfLines={1}>
              {address?.buildingShopNo ?? 'Plot 42, MG Road, Dadar West'}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.pinWrapper}>
        <View style={styles.pinHalo} />
        <View style={styles.pin}>
          <Icon name="home" size={18} color={colors.white} />
        </View>
      </View>

      <Pressable style={styles.crosshairButton}>
        <Icon name="crosshair" size={20} color={colors.primary} />
      </Pressable>

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetContent}>
          <Text style={styles.sectionLabel}>Confirmed Store Location</Text>
          <View style={styles.locationRow}>
            <Icon name="pin" size={16} color={colors.primary} />
            <View style={styles.locationTextColumn}>
              <Text style={styles.locationAddress}>
                {address?.buildingShopNo ?? 'Plot 42, MG Road, Ground Floor'}
              </Text>
              <Text style={styles.locationCityState}>
                {address?.area ?? 'Dadar West'}, {address?.city ?? 'Mumbai'}, {address?.state ?? 'Maharashtra'}{' '}
                {address?.pincode ?? '400028'}
              </Text>
              <View style={styles.accuracyRow}>
                <View style={styles.accuracyDot} />
                <Text style={styles.accuracyText}>Accuracy: ±3 meters · GPS verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonRowItem}>
              <Button
                label="Adjust Pin"
                variant="outline"
                icon={<Icon name="edit" size={15} color={colors.primary} />}
                onPress={() => undefined}
              />
            </View>
            <View style={styles.buttonRowItem}>
              <Button
                label="Confirm"
                icon={<Icon name="check" size={15} color={colors.white} strokeWidth={3} />}
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const MAP_BLOCKS: ViewStyle[] = [
  { left: '2%', top: '15%', width: '30%', height: '9%' },
  { left: '38%', top: '14%', width: '35%', height: '11%' },
  { left: '78%', top: '15%', width: '18%', height: '9%' },
  { left: '2%', top: '26%', width: '22%', height: '10%' },
  { left: '30%', top: '27%', width: '25%', height: '9%' },
  { left: '62%', top: '26%', width: '20%', height: '10%' },
  { left: '15%', top: '38%', width: '28%', height: '10%', backgroundColor: '#C5DDB5' },
];

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF0EB',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mapBlock: {
    position: 'absolute',
    backgroundColor: '#DAE0D5',
    borderRadius: 4,
  },
  topOverlay: {
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  pinWrapper: {
    position: 'absolute',
    left: '50%',
    top: '38%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHalo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(28,166,114,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(28,166,114,0.3)',
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderBottomLeftRadius: 0,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  crosshairButton: {
    position: 'absolute',
    right: spacing.xl,
    top: 140,
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl + 8,
    borderTopRightRadius: radii.xl + 8,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  sheetContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  sectionLabel: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  locationTextColumn: {
    flex: 1,
    gap: 1,
  },
  locationAddress: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  locationCityState: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  accuracyDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  accuracyText: {
    ...typography.tiny,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  buttonRowItem: {
    flex: 1,
  },
});
