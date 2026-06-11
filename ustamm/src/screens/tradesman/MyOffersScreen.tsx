import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/auth.store';
import { jobsService } from '../../services/jobs.service';
import { Offer } from '../../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const MyOffersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    if (!user) return;
    try {
      const result = await jobsService.getOffersByTradesman(user.id);
      setOffers(result);
    } catch {}
    setIsLoading(false);
  };

  const filtered = activeTab === 'all' ? offers : offers.filter((o) => o.status === activeTab);

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

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.jobId })}
    >
      <View style={styles.offerHeader}>
        <Text style={styles.offerJob} numberOfLines={1}>İş #{item.jobId.slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {statusLabels[item.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.offerPrice}>{item.price.toLocaleString('tr-TR')}₺</Text>
      <Text style={styles.offerMessage} numberOfLines={2}>{item.message}</Text>
      <Text style={styles.offerDate}>{format(item.createdAt, 'd MMM yyyy', { locale: tr })}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tekliflerim</Text>
      </View>

      <View style={styles.tabs}>
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'Tümü' : statusLabels[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Teklif bulunamadı</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.background },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, fontWeight: '500' },
  tabTextActive: { color: COLORS.white, fontWeight: '700' },
  list: { padding: SPACING.lg, gap: SPACING.md },
  offerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  offerJob: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.secondary, flex: 1 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.round },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  offerPrice: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
  offerMessage: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, lineHeight: 18, marginBottom: SPACING.sm },
  offerDate: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
});
