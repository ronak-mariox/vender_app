import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { colors, typography } from '../theme';

export type TimelineStepStatus = 'done' | 'active' | 'pending';

export type TimelineStep = {
  label: string;
  sublabel: string;
  status: TimelineStepStatus;
};

type Props = {
  steps: TimelineStep[];
};

export function StatusTimeline({ steps }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <View key={step.label} style={styles.row}>
            <View style={styles.markerColumn}>
              <Marker status={step.status} />
              {!isLast ? (
                <View
                  style={[
                    styles.connector,
                    step.status === 'done' && styles.connectorDone,
                  ]}
                />
              ) : null}
            </View>
            <View style={[styles.textColumn, !isLast && styles.textColumnSpacing]}>
              <Text
                style={[
                  styles.label,
                  step.status === 'pending' && styles.labelPending,
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.sublabel}>{step.sublabel}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Marker({ status }: { status: TimelineStepStatus }) {
  if (status === 'done') {
    return (
      <View style={[styles.marker, styles.markerDone]}>
        <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
      </View>
    );
  }
  if (status === 'active') {
    return (
      <View style={[styles.marker, styles.markerActive]}>
        <View style={styles.markerActiveDot} />
      </View>
    );
  }
  return (
    <View style={[styles.marker, styles.markerPending]}>
      <View style={styles.markerPendingDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  markerColumn: {
    alignItems: 'center',
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: {
    backgroundColor: colors.primary,
  },
  markerActive: {
    backgroundColor: colors.primarySurface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  markerActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  markerPending: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  markerPendingDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: colors.border,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  connectorDone: {
    backgroundColor: colors.primary,
  },
  textColumn: {
    flex: 1,
  },
  textColumnSpacing: {
    paddingBottom: 16,
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  labelPending: {
    color: colors.textSecondary,
  },
  sublabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    paddingTop: 2,
  },
});
