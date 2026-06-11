import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES } from '../constants';
import { User } from '../types';
import { Avatar } from './ui/Avatar';
import { StarRating } from './ui/StarRating';

interface TradesmanCardProps {
  tradesman: User;
  onPress: () => void;
}

export const TradesmanCard: React.FC<TradesmanCardProps> = ({ tradesman, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.leftSection}>
        <Avatar uri={tradesman.profileImage} name={tradesman.fullName} size={56} />
        {tradesman.isAvailable && <View style={styles.availableDot} />}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{tradesman.fullName}</Text>
          {tradesman.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          )}
        </View>

        <View style={styles.ratingRow}>
          <StarRating rating={tradesman.rating || 0} size={13} />
          <Text style={styles.ratingText}>
            {tradesman.rating?.toFixed(1) || '0.0'} ({tradesman.totalReviews || 0})
          </Text>
        </View>

        <View style={styles.categories}>
          {tradesman.categories?.slice(0, 2).map((cat) => {
            const catInfo = CATEGORIES.find((c) => c.id === cat);
            return (
              <View key={cat} style={[styles.catChip, { backgroundColor: `${catInfo?.color || COLORS.primary}15` }]}>
                <Text style={[styles.catText, { color: catInfo?.color || COLORS.primary }]}>{catInfo?.label || cat}</Text>
              </View>
            );
          })}
          {(tradesman.categories?.length || 0) > 2 && (
            <Text style={styles.moreCategories}>+{(tradesman.categories?.length || 0) - 2}</Text>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.jobCount}>{tradesman.totalJobs || 0}</Text>
        <Text style={styles.jobCountLabel}>iş</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ marginTop: SPACING.sm }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: SPACING.md,
  },
  leftSection: { position: 'relative' },
  availableDot: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.success,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.secondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  ratingText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  categories: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  catChip: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.round },
  catText: { fontSize: 10, fontWeight: '600' },
  moreCategories: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, alignSelf: 'center' },
  stats: { alignItems: 'center', justifyContent: 'center' },
  jobCount: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary },
  jobCountLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
});
