import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES, JOB_STATUSES } from '../constants';
import { Job } from '../types';
import { Badge } from './ui/Badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const catInfo = CATEGORIES.find((c) => c.id === job.category);
  const statusInfo = JOB_STATUSES[job.status] || { label: job.status, color: COLORS.textLight };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={[styles.categoryIcon, { backgroundColor: `${catInfo?.color || COLORS.primary}20` }]}>
          <Ionicons name={catInfo?.icon as any || 'construct'} size={20} color={catInfo?.color || COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.category}>{catInfo?.label}</Text>
        </View>
        <Badge label={statusInfo.label} color={statusInfo.color} />
      </View>

      <Text style={styles.description} numberOfLines={2}>{job.description}</Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.footerText} numberOfLines={1}>{job.location.address || job.location.city}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="cash-outline" size={14} color={COLORS.success} />
          <Text style={[styles.footerText, { color: COLORS.success, fontWeight: '700' }]}>
            {job.budget.min}₺ - {job.budget.max}₺
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.footerText}>{job.offerCount || 0} teklif</Text>
        </View>
      </View>

      {job.images.length > 0 && (
        <Image source={{ uri: job.images[0] }} style={styles.jobImage} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: SPACING.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  categoryIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.secondary },
  category: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 2 },
  description: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 18 },
  footer: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, maxWidth: 120 },
  jobImage: {
    width: '100%',
    height: 160,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
});
