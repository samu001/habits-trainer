import { StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../theme/tokens';
import { Card } from './Card';

type TodaySummaryCardProps = {
  summary: string;
};

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  return (
    <Card
      style={styles.card}
      accessibilityLabel={`Today summary: ${summary}`}
    >
      <Text style={styles.eyebrow}>Today</Text>
      <Text style={styles.summary}>{summary}</Text>
      <Text style={styles.help}>
        Compact summary format — ready for a future home-screen widget.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  help: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
