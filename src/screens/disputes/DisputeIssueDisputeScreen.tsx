import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes } from '../../context/DisputesContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeIssueDispute'>;

const MAX_LENGTH = 500;

const DISPUTE_BASIS_OPTIONS = [
  'Item was packed correctly (photo evidence available)',
  'Damage occurred during delivery',
  "Customer's claim is inaccurate",
  'Item was correctly substituted (with approval)',
];

export function DisputeIssueDisputeScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute, setVendorStatementDraft } = useDisputes();
  const dispute = getDispute(disputeId);

  const [selectedBasis, setSelectedBasis] = useState<string | null>(null);
  const [statement, setStatement] = useState('');

  const canContinue = statement.trim().length > 0;

  function handleNext() {
    if (!canContinue) return;
    // Stage the statement (and optional basis) on the dispute record itself so
    // DisputeSubmitScreen (F37) can read it back via useDisputes().getDispute,
    // without needing a separate draft context or navigation-param plumbing.
    const combined = selectedBasis ? `${selectedBasis}. ${statement.trim()}` : statement.trim();
    setVendorStatementDraft(disputeId, combined);
    navigation.navigate('DisputeUploadEvidence', { disputeId });
  }

  if (!dispute) {
    return (
      <View style={styles.screen}>
        <Header title="Dispute Issue" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This dispute could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Dispute Issue" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warningCard}>
          <Icon name="alert-triangle" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Only dispute if you have clear evidence the issue is not your fault.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispute Basis</Text>
          <View style={styles.basisList}>
            {DISPUTE_BASIS_OPTIONS.map(option => {
              const selected = selectedBasis === option;
              return (
                <Pressable
                  key={option}
                  style={styles.basisRow}
                  onPress={() => setSelectedBasis(selected ? null : option)}
                  hitSlop={4}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={styles.basisText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.statementTitleRow}>
            <Text style={styles.cardTitle}>DISPUTE STATEMENT </Text>
            <Text style={styles.required}>*</Text>
          </View>
          <TextInput
            style={styles.statementInput}
            value={statement}
            onChangeText={text => setStatement(text.slice(0, MAX_LENGTH))}
            placeholder="Describe your position clearly. Include any relevant details about packaging, delivery, or order accuracy..."
            placeholderTextColor="rgba(31,41,55,0.5)"
            multiline
            maxLength={MAX_LENGTH}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>
            {statement.length}/{MAX_LENGTH}
          </Text>
        </View>

        <Button label="Next: Upload Evidence" onPress={handleNext} disabled={!canContinue} />
      </ScrollView>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const sectionTitle = {
  ...typography.labelSemibold,
  color: colors.textSecondary,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg + 2,
    paddingBottom: spacing.huge,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md + 2,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FEC84B',
    borderRadius: radii.md,
    padding: spacing.lg + 2,
  },
  warningText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: '#92400E',
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardTitle: sectionTitle,
  basisList: {
    gap: spacing.lg - 2,
    paddingTop: spacing.lg,
  },
  basisRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  basisText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  statementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  required: {
    ...typography.labelSemibold,
    color: colors.error,
  },
  statementInput: {
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    minHeight: 100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
    marginTop: spacing.lg,
  },
  counter: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    paddingTop: spacing.sm,
  },
});
