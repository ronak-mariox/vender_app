import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { usePayments } from '../../context/PaymentsContext';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DownloadInvoice'>;

type DownloadPhase = 'downloading' | 'downloaded';

export function DownloadInvoiceScreen({ navigation, route }: Props) {
  const { settlementId } = route.params;
  const { getSettlement } = usePayments();
  const settlement = getSettlement(settlementId);
  const invoiceNumber = settlement ? settlement.id.replace('STL', 'INV') : 'Invoice';
  const fileName = `${invoiceNumber}.pdf`;

  const [phase, setPhase] = useState<DownloadPhase>('downloading');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('downloaded'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        {phase === 'downloading' ? (
          <View style={styles.centered}>
            <View style={styles.spinnerWrap}>
              <ActivityIndicator size="large" color={colors.textTertiary} />
            </View>
            <Text style={styles.heading}>Preparing Invoice...</Text>
            <Text style={styles.subtitle}>{fileName}</Text>
          </View>
        ) : (
          <View style={styles.centered}>
            <View style={styles.successIconCircle}>
              <Icon name="check" size={36} color={colors.primary} strokeWidth={3} />
            </View>
            <Text style={styles.heading}>Invoice Downloaded</Text>
            <Text style={styles.subtitle}>{fileName} saved to your device</Text>

            <View style={styles.fileCard}>
              <Icon name="file-text" size={16} color={colors.textSecondary} />
              <View style={styles.fileTextColumn}>
                <Text style={styles.fileName}>{fileName}</Text>
                <Text style={styles.fileMeta}>124 KB · PDF Document</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                label="Open File"
                onPress={() => Alert.alert('Open File', 'Coming soon.')}
              />
              <Button
                label="Share"
                variant="outline"
                onPress={() => Alert.alert('Share', 'Coming soon.')}
              />
              <Button
                label="Done"
                variant="text"
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  centered: {
    alignItems: 'center',
    width: '100%',
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    borderWidth: 4,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  fileTextColumn: {
    gap: 2,
  },
  fileName: {
    ...typography.captionSemibold,
    color: colors.textPrimary,
  },
  fileMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.huge,
  },
});
