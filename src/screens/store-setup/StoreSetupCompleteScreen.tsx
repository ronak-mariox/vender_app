import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreSetupComplete'>;

const COMPLETED_ITEMS = [
  'Store Profile & Description',
  'Logo & Cover Image',
  'Address & Location',
  'Operating Hours & Schedule',
  'Delivery Settings',
  'Service Availability',
];

export function StoreSetupCompleteScreen({ navigation }: Props) {
  const { data } = useStoreSetup();
  const storeName = data.profile?.storeName ?? 'Your store';
  const [finalizing, setFinalizing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api.post('/vendor/store-setup/complete');
      } catch (err) {
        if (!cancelled) {
          Alert.alert('Could not finish store setup', getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setFinalizing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const statusLabel =
    data.storeStatus === 'open'
      ? 'Store Status: Open'
      : data.storeStatus === 'closed'
        ? 'Store Status: Closed'
        : 'Store Status: Temporarily Closed';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={44} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={styles.heading}>Store Setup{'\n'}Complete!</Text>
            <Text style={styles.subtitle}>{storeName} is ready to go live on Verdant</Text>

            <View style={styles.completedCard}>
              <Text style={styles.completedTitle}>Completed</Text>
              {[...COMPLETED_ITEMS, statusLabel].map((item, index) => (
                <View
                  key={item}
                  style={[styles.completedRow, index > 0 && styles.completedRowDivider]}
                >
                  <View style={styles.completedIcon}>
                    <Icon name="check" size={11} color={colors.white} strokeWidth={3} />
                  </View>
                  <Text style={styles.completedText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              label="Go to Dashboard"
              loading={finalizing}
              onPress={() => navigation.replace('Dashboard')}
            />
            <Button
              label="Add First Product"
              variant="outline"
              disabled={finalizing}
              onPress={() => navigation.navigate('AddProduct')}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTop: {
    width: 260,
    height: 260,
    top: -80,
    right: -90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobBottom: {
    width: 200,
    height: 200,
    bottom: -60,
    left: -60,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xxl,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  heading: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 34.5,
    letterSpacing: -0.9,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: -spacing.lg,
  },
  completedCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  completedTitle: {
    ...typography.tinyBold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.md,
  },
  completedRowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  completedIcon: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    gap: spacing.lg,
  },
});
