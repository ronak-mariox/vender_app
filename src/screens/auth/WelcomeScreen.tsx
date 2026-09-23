import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer backgroundColor={colors.surface} edges={['top', 'bottom']} scrollable>
      <View style={styles.hero}>
        <LinearGradient
          colors={['#E8F5EF', '#F0FAF5', '#F7F9F8']}
          locations={[0.0849, 0.583, 0.9151]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobBottom]} />

        <View style={styles.categoryRow}>
          <View style={styles.categoryItem}>
            <View style={[styles.categoryImage, { backgroundColor: '#FFE4B5' }]}>
              <Image
                source={require('../../assets/images/welcome-groceries.png')}
                style={styles.categoryImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.categoryLabel}>Groceries</Text>
          </View>
          <View style={styles.categoryItem}>
            <View
              style={[
                styles.categoryImage,
                styles.categoryImageTall,
                styles.categoryImageWideShadow,
                { backgroundColor: '#B8E4FF' },
              ]}
            >
              <Image
                source={require('../../assets/images/welcome-electronics.png')}
                style={styles.categoryImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.categoryLabel}>Electronics</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={[styles.categoryImage, styles.categoryImageShort, { backgroundColor: '#FFB8D9' }]}>
              <Image
                source={require('../../assets/images/welcome-fashion.png')}
                style={styles.categoryImg}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.categoryLabel}>Fashion</Text>
          </View>
        </View>

        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>Your store, ready in minutes</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View>
          <View style={styles.headingBlock}>
            <Text style={styles.heading}>
              Welcome to{'\n'}
              <Text style={styles.headingBrand}>Verdant</Text>
            </Text>
            <Text style={styles.subtitle}>
              Join 50,000+ vendors growing their business on India's most trusted commerce
              platform.
            </Text>
          </View>

          <View style={styles.actions}>
            <Button label="Login to my Account" onPress={() => navigation.navigate('Login')} />
            <Button
              label="Create Vendor Account"
              variant="outline"
              onPress={() =>
                navigation.navigate('MobileNumber', { intent: 'create-account' })
              }
            />
          </View>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text>{' '}
          and <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 400,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  blob: {
    position: 'absolute',
    backgroundColor: colors.primaryBorder,
    borderRadius: 9999,
  },
  blobTop: {
    width: 200,
    height: 200,
    opacity: 0.5,
    top: -30,
    right: -30,
  },
  blobBottom: {
    width: 120,
    height: 120,
    opacity: 0.4,
    bottom: 20,
    left: -20,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  categoryItem: {
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryImage: {
    width: 72,
    height: 80,
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  categoryImageTall: {
    height: 100,
  },
  categoryImageWideShadow: {
    shadowRadius: 16,
  },
  categoryImageShort: {
    height: 70,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
  },
  categoryLabel: {
    ...typography.captionSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radii.xl,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  pillText: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxxl,
    justifyContent: 'space-between',
  },
  headingBlock: {
    gap: spacing.md,
    paddingBottom: spacing.huge,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  headingBrand: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.lg,
  },
  terms: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingBottom: spacing.md,
  },
  termsLink: {
    ...typography.tiny,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
});
