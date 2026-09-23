import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreLocation'>;

export function StoreLocationScreen({ navigation }: Props) {
  const { data, updateStoreInfo } = useRegistration();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(data.storeInfo?.location ?? null);
  const [error, setError] = useState('');

  function handleSearchSubmit() {
    const query = search.trim();
    if (!query) return;
    setLocation({
      address: query,
      cityState: location?.cityState ?? '',
      latitude: location?.latitude ?? 19.0176,
      longitude: location?.longitude ?? 72.8459,
    });
    setError('');
  }

  function handleConfirm() {
    if (!location) {
      setError('Please search for your store address before confirming');
      return;
    }
    if (data.storeInfo) {
      updateStoreInfo({ ...data.storeInfo, location });
    }
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
      <View style={styles.mapBackground}>
        {MAP_BLOCKS.map((block, index) => (
          <View key={index} style={[styles.mapBlock, block]} />
        ))}
        <View style={styles.pinWrapper}>
          <View style={styles.pin}>
            <Icon name="pin" size={20} color={colors.white} />
          </View>
          <View style={styles.pinShadow} />
        </View>
      </View>

      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            placeholder="Search for your store address..."
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Pressable style={styles.myLocationPill}>
        <Icon name="crosshair" size={16} color={colors.primary} />
        <Text style={styles.myLocationText}>Use My Location</Text>
      </Pressable>

      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetContent}>
          <Text style={styles.sectionLabel}>Selected Location</Text>
          {location ? (
            <View style={styles.locationRow}>
              <Icon name="pin" size={16} color={colors.textSecondary} />
              <View style={styles.locationTextColumn}>
                <Text style={styles.locationAddress}>{location.address}</Text>
                {location.cityState ? (
                  <Text style={styles.locationCityState}>{location.cityState}</Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.locationRow}>
              <Icon name="pin" size={16} color={colors.textSecondary} />
              <Text style={styles.locationPlaceholder}>No address selected yet</Text>
            </View>
          )}

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.hintBanner}>
              <Icon name="alert-triangle" size={14} color={colors.warningDark} />
              <Text style={styles.hintText}>Search above to set your exact store address</Text>
            </View>
          )}

          <Button label="Confirm Location" onPress={handleConfirm} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const MAP_BLOCKS: ViewStyle[] = [
  { left: '2%', top: '15%', width: '28%', height: '9%' },
  { left: '37%', top: '14%', width: '43%', height: '11%' },
  { left: '2%', top: '26%', width: '24%', height: '10%' },
  { left: '30%', top: '27%', width: '19%', height: '8%' },
  { left: '53%', top: '15%', width: '22%', height: '12%' },
  { left: '80%', top: '14%', width: '17%', height: '11%' },
  { left: '2%', top: '39%', width: '20%', height: '10%' },
  { left: '28%', top: '38%', width: '24%', height: '11%', borderRadius: 999 },
  { left: '58%', top: '36%', width: '19%', height: '9%', backgroundColor: '#C5DDB5' },
  { left: '83%', top: '38%', width: '15%', height: '10%' },
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
  pinWrapper: {
    position: 'absolute',
    left: '48%',
    top: '38%',
    alignItems: 'center',
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
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 4,
  },
  topOverlay: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  cancelText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  myLocationPill: {
    position: 'absolute',
    right: spacing.xl,
    top: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  myLocationText: {
    ...typography.captionSemibold,
    color: colors.primary,
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
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
  },
  locationRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
  locationPlaceholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    padding: spacing.lg,
    borderRadius: radii.md,
  },
  hintText: {
    ...typography.caption,
    color: colors.warningDark,
  },
});
