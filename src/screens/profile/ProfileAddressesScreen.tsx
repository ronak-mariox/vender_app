import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile, type Address } from '../../context/ProfileContext';
import { Badge, Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileAddresses'>;

export function ProfileAddressesScreen({ navigation }: Props) {
  const { addresses } = useProfile();

  function handleAddAddress() {
    navigation.navigate('ProfileAddAddress');
  }

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="Addresses" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {addresses.map(address => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={() => navigation.navigate('ProfileAddressDetails', { addressId: address.id })}
          />
        ))}

        <View style={styles.addButtonWrapper}>
          <Button
            label="Add New Address"
            variant="outline"
            icon={<Icon name="plus" size={16} color={colors.primary} />}
            onPress={handleAddAddress}
          />
        </View>

        <View style={styles.bannerWrapper}>
          <View style={styles.banner}>
            <Icon name="info" size={14} color={colors.primaryDark} />
            <Text style={styles.bannerText}>Store address determines your delivery zone.</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Icon name="pin" size={16} color={colors.primary} />
          <Text style={styles.cardLabel}>{address.label}</Text>
        </View>
        {address.isPrimary ? <Badge label="Primary" tone="success" /> : null}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardLine}>{address.line1}</Text>
        <Text style={styles.cardLine}>{address.line2}</Text>
        <Pressable style={styles.editButton} onPress={onEdit} hitSlop={8}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  cardBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xxs,
  },
  cardLine: {
    ...typography.body,
    color: colors.textPrimary,
  },
  editButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  editButtonText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  addButtonWrapper: {
    width: '100%',
  },
  bannerWrapper: {
    width: '100%',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm + 2,
    padding: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
});
