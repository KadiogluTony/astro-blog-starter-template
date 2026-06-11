import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/auth.store';
import { useLocation } from '../../hooks/useLocation';
import { useJobs } from '../../hooks/useJobs';
import { usersService } from '../../services/users.service';
import { jobsService } from '../../services/jobs.service';
import { JobCard } from '../../components/JobCard';
import { Offer } from '../../types';

export const TradesmanHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuthStore();
  const { coords } = useLocation();
  const { jobs, fetchNearbyJobs, isLoading } = useJobs();
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);

  useEffect(() => {
    loadData();
  }, [coords]);

  const loadData = async () => {
    if (coords) {
      await fetchNearbyJobs(coords.latitude, coords.longitude);
    }
    if (user) {
      const offers = await jobsService.getOffersByTradesman(user.id);
      setMyOffers(offers.slice(0, 3));
    }
  };

  const toggleAvailability = async (val: boolean) => {
    setIsAvailable(val);
    await usersService.updateAvailability(user!.id, val);
    await updateUser({ isAvailable: val });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [coords]);

  const pendingOffers = myOffers.filter((o) => o.status === 'pending').length;
  const acceptedOffers = myOffers.filter((o) => o.status === 'accepted').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merhaba, {user?.fullName?.split(' ')[0]} 👋</Text>
            <View style={styles.availabilityRow}>
              <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? COLORS.success : COLORS.textLight }]} />
              <Text style={styles.availabilityText}>{isAvailable ? 'Müsaitim' : 'Meşgulüm'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: COLORS.border, true: `${COLORS.success}60` }}
              thumbColor={isAvailable ? COLORS.success : COLORS.textLight}
            />
            <TouchableOpacity style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Tamamlanan İş</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{pendingOffers}</Text>
            <Text style={styles.statLabel}>Bekleyen Teklif</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>★ {user?.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Puanım</Text>
          </View>
        </View>

        {/* Recent Offers */}
        {myOffers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Son Tekliflerim</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyOffers')}>
                <Text style={styles.seeAll}>Tümü</Text>
              </TouchableOpacity>
            </View>
            {myOffers.map((offer) => (
              <View key={offer.id} style={styles.offerItem}>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerJob} numberOfLines={1}>İş #{offer.jobId.slice(-6)}</Text>
                  <Text style={styles.offerPrice}>{offer.price}₺</Text>
                </View>
                <View style={[styles.offerStatus, { backgroundColor: offer.status === 'accepted' ? `${COLORS.success}20` : offer.status === 'rejected' ? `${COLORS.error}20` : `${COLORS.warning}20` }]}>
                  <Text style={[styles.offerStatusText, { color: offer.status === 'accepted' ? COLORS.success : offer.status === 'rejected' ? COLORS.error : COLORS.warning }]}>
                    {offer.status === 'accepted' ? 'Kabul edildi' : offer.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Nearby Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yakınındaki İşler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('JobsMap')}>
              <Text style={styles.seeAll}>Haritada Gör</Text>
            </TouchableOpacity>
          </View>
          {jobs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Yakınınızda iş bulunamadı</Text>
            </View>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  availabilityDot: { width: 8, height: 8, borderRadius: 4 },
  availabilityText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  notifButton: { padding: SPACING.sm },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary },
  seeAll: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  offerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  offerInfo: { flex: 1 },
  offerJob: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
  offerPrice: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  offerStatus: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.round },
  offerStatusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
});
