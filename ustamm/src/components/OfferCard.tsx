import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../constants';
import { Offer } from '../types';
import { Avatar } from './ui/Avatar';
import { StarRating } from './ui/StarRating';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OfferCardProps {
  offer: Offer;
  onAccept?: () => void;
  onChat?: () => void;
  showActions?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onAccept,
  onChat,
  showActions = true,
}) => {
  const statusColors: Record<string, string> = {
    pending: COLORS.warning,
    accepted: COLORS.success,
    rejected: COLORS.error,
  };

  const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    accepted: 'Kabul Edildi',
    rejected: 'Reddedildi',
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar uri={offer.tradesmanPhoto} name={offer.tradesmanName} size={44} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{offer.tradesmanName}</Text>
          {offer.tradesmanRating !== undefined && (
            <View style={styles.ratingRow}>
              <StarRating rating={offer.tradesmanRating} size={12} />
              <Text style={styles.ratingText}>{offer.tradesmanRating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.price}>{offer.price.toLocaleString('tr-TR')}₺</Text>
          {offer.estimatedDuration && (
            <Text style={styles.duration}>{offer.estimatedDuration}</Text>
          )}
        </View>
      </View>

      <Text style={styles.message}>{offer.message}</Text>

      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[offer.status]}20` }]}>
          <Text style={[styles.statusText, { color: statusColors[offer.status] }]}>
            {statusLabels[offer.status]}
          </Text>
        </View>
        <Text style={styles.date}>{format(offer.createdAt, 'd MMM', { locale: tr })}</Text>
      </View>

      {showActions && offer.status === 'pending' && (
        <View style={styles.actions}>
          {onChat && (
            <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.chatBtnText}>Mesaj Yaz</Text>
            </TouchableOpacity>
          )}
          {onAccept && (
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
              <Text style={styles.acceptBtnText}>Kabul Et</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: SPACING.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  headerInfo: { flex: 1 },
  name: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.secondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  price: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary, textAlign: 'right' },
  duration: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, textAlign: 'right', marginTop: 2 },
  message: { fontSize: FONTS.sizes.sm, color: COLORS.text, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.round },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  date: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  actions: { flexDirection: 'row', gap: SPACING.md },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  chatBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.success,
  },
  acceptBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.white },
});
