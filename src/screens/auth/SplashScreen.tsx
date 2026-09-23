import React, { useEffect, useRef, useState } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { resolveVendorEntryRoute } from '../../utils/vendorRouting';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const MIN_VISIBLE_MS = 2200;

export function SplashScreen({ navigation }: Props) {
  const { isLoading, isAuthenticated } = useVendorAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const navigated = useRef(false);

  // Shows the splash for a fixed minimum duration regardless of how fast the
  // session-restore check finishes, so it never just flashes.
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  // Previously this always sent every vendor to 'Welcome' once the timer above
  // fired, ignoring VendorAuthContext entirely — so a vendor with a perfectly
  // valid restored session was forced to log in again on every app open. Now it
  // waits for BOTH the minimum splash duration AND the real session-restore
  // check (VendorAuthContext's own effect, which already retries past network
  // blips without dropping a valid session) before deciding where to go.
  useEffect(() => {
    if (isLoading || !minTimeElapsed || navigated.current) return;
    navigated.current = true;

    if (!isAuthenticated) {
      navigation.replace('Welcome');
      return;
    }

    resolveVendorEntryRoute()
      .then(route => {
        (navigation as unknown as { replace: (name: string, params?: object) => void }).replace(
          route.name,
          route.params,
        );
      })
      .catch(() => {
        // Couldn't reach the server to resolve the exact step — fall back to
        // Welcome rather than guessing; the vendor can log in again from there.
        navigation.replace('Welcome');
      });
  }, [isLoading, minTimeElapsed, isAuthenticated, navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.decorCircle, styles.decorTopRight]} />
      <View style={[styles.decorCircle, styles.decorTopRightSmall]} />
      <View style={[styles.decorCircle, styles.decorBottomLeft]} />
      <View style={[styles.decorCircle, styles.decorBottomLeftSmall]} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/splash-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Grow your business with India's fastest commerce platform
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.version}>Version 2.4.1</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorTopRight: {
    width: 300,
    height: 300,
    top: -80,
    right: -106,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorTopRightSmall: {
    width: 180,
    height: 180,
    top: 80,
    right: -46,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decorBottomLeft: {
    width: 260,
    height: 260,
    bottom: -80,
    left: -60,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  decorBottomLeftSmall: {
    width: 140,
    height: 140,
    bottom: -20,
    left: -20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 35,
    paddingHorizontal: spacing.huge,
  },
  logo: {
    width: 220,
    height: 88,
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.overlayLight,
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.huge,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: colors.overlayLight40,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.white,
  },
  version: {
    ...typography.tiny,
    color: colors.overlayLight50,
  },
});
