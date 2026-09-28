import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreLocationConfirm'>;

export function StoreLocationConfirmScreen({ navigation }: Props) {
  const { data } = useStoreSetup();
  const address = data.address;

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={3} totalSteps={7} label="Store Address" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Confirm Store Location</Text>
          <Text style={styles.subtitle}>Check the saved address and coordinates before continuing</Text>
        </View>

        {address ? (
          <FormSectionCard title="Saved Location">
            <View style={styles.locationRow}>
              <Icon name="pin" size={16} color={colors.primary} />
              <View style={styles.locationTextColumn}>
                <Text style={styles.locationAddress}>
                  {address.buildingShopNo}, {address.street}
                </Text>
                <Text style={styles.locationCityState}>
                  {address.area}, {address.city}, {address.state} {address.pincode}
                </Text>
                <Text style={styles.locationCityState}>Landmark: {address.landmark}</Text>
              </View>
            </View>
            <View style={styles.coordRow}>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <Text style={styles.coordValue}>{address.location.latitude}</Text>
              </View>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <Text style={styles.coordValue}>{address.location.longitude}</Text>
              </View>
            </View>
          </FormSectionCard>
        ) : (
          <Text style={styles.emptyText}>No store address saved yet.</Text>
        )}

        <View style={styles.footer}>
          <Button
            label="Confirm & Continue"
            disabled={!address}
            onPress={() => navigation.navigate('OperatingHours')}
          />
          <Button label="Edit Address" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.xxs,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  locationTextColumn: {
    flex: 1,
    gap: 2,
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
  coordRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  coordItem: {
    flex: 1,
    gap: 2,
  },
  coordLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  coordValue: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
