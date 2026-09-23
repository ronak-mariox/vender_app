import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'RejectOrderWarning'>;

export function RejectOrderWarningScreen({ navigation, route }: Props) {
  const { orderId } = route.params;

  return (
    <FlowStatusScreen
      headerTitle="Reject Order"
      onBack={() => navigation.goBack()}
      icon="x-circle"
      iconColor={colors.error}
      iconBg={colors.errorSurface}
      iconRingColor={colors.errorBorder}
      heading="Reject this order?"
      subtitle="Frequent rejections affect your store rating and visibility. Please provide a reason."
      footer={
        <View style={styles.footerRow}>
          <FlexButton
            label="← Go Back"
            onPress={() => navigation.goBack()}
            background={colors.primarySurface}
            textColor={colors.primary}
            borderColor={colors.primaryBorder}
            flex={1}
          />
          <FlexButton
            label="Choose Reason →"
            onPress={() => navigation.navigate('RejectReason', { orderId })}
            background={colors.error}
            textColor={colors.white}
            flex={1.9}
          />
        </View>
      }
    >
      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          ⚠️ Your acceptance rate is <Text style={styles.bold}>89%</Text>. Rejecting this order will bring it
          to 87%, which may reduce your store visibility.
        </Text>
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  },
  warningText: {
    ...typography.caption,
    color: '#B91C1C',
  },
  bold: {
    fontFamily: fontFamilies.bold,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
