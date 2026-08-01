import { StyleSheet, Text, View } from 'react-native';

import { formatLevel } from '../lib/habits';
import type { HabitLevel } from '../types/habit';
import { colors, radii, spacing, typography } from '../theme/tokens';

type PathMeterProps = {
  start: HabitLevel;
  current: HabitLevel;
  target: HabitLevel;
  progress: number;
  tone?: 'light' | 'dark';
};

export function PathMeter({
  start,
  current,
  target,
  progress,
  tone = 'light',
}: PathMeterProps) {
  const dark = tone === 'dark';

  return (
    <View style={styles.container}>
      <View style={[styles.track, dark && styles.trackDark]}>
        <View style={[styles.fill, { width: `${Math.max(8, progress * 100)}%` }]} />
        <View style={[styles.marker, styles.markerStart, dark && styles.markerOnDark]} />
        <View
          style={[
            styles.marker,
            styles.markerCurrent,
            { left: `${Math.min(92, Math.max(8, progress * 100))}%` },
          ]}
        />
        <View style={[styles.marker, styles.markerTarget]} />
      </View>
      <View style={styles.labels}>
        <View style={styles.labelBlock}>
          <Text style={[styles.labelTitle, dark && styles.textMutedOnDark]}>Start</Text>
          <Text style={[styles.labelValue, dark && styles.textOnDark]}>
            {formatLevel(start)}
          </Text>
        </View>
        <View style={[styles.labelBlock, styles.labelCenter]}>
          <Text style={[styles.labelTitle, dark && styles.textMutedOnDark]}>Now</Text>
          <Text style={[styles.labelValueNow, dark && styles.nowOnDark]}>
            {formatLevel(current)}
          </Text>
        </View>
        <View style={[styles.labelBlock, styles.labelEnd]}>
          <Text style={[styles.labelTitle, dark && styles.textMutedOnDark]}>Target</Text>
          <Text style={[styles.labelValue, dark && styles.textOnDark]}>
            {formatLevel(target)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  track: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'visible',
    justifyContent: 'center',
  },
  trackDark: {
    backgroundColor: '#314866',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: radii.pill,
    borderWidth: 2,
    top: -2,
  },
  markerStart: {
    left: 0,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  markerOnDark: {
    backgroundColor: colors.surfaceInk,
    borderColor: colors.textOnInkMuted,
  },
  markerCurrent: {
    marginLeft: -8,
    backgroundColor: colors.primary,
    borderColor: colors.surface,
  },
  markerTarget: {
    right: 0,
    backgroundColor: colors.success,
    borderColor: colors.surface,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  labelBlock: {
    flex: 1,
    gap: 2,
  },
  labelCenter: {
    alignItems: 'center',
  },
  labelEnd: {
    alignItems: 'flex-end',
  },
  labelTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  labelValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelValueNow: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  textOnDark: {
    color: colors.textOnInkMuted,
  },
  textMutedOnDark: {
    color: '#9AA8C3',
  },
  nowOnDark: {
    color: colors.primary,
  },
});
