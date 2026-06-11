import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES } from '../../constants';
import { useLocation } from '../../hooks/useLocation';
import { useJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/auth.store';
import { usersService } from '../../services/users.service';
import { JobCard } from '../../components/JobCard';
import { TradesmanCard } from '../../components/TradesmanCard';
import { Category, User } from '../../types';
import { CustomerStackParamList } from '../../navigation/CustomerNavigator';

type NavProp = StackNavigationProp<CustomerStackParamList>;

export const CustomerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { coords, isLoading: locLoading } = useLocation();
  const { jobs, fetchNearbyJobs, fetchMyJobs, isLoading } = useJobs();
  const [tradesmen, setTradesmen] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'myJobs' | 'tradesmen'>('tradesmen');

  useEffect(() => {
    if (coords) {
      fetchNearbyJobs(coords.latitude, coords.longitude);
    }
    loadTradesmen();
  }, [coords, selectedCategory]);

  const loadTradesmen = async () => {
    try {
      let result: User[];
      if (selectedCategory) {
        result = await usersService.getTradesmenByCategory(selectedCategory);
      } else {
        result = await usersService.getTopRatedTradesmen(undefined, 10);
      }
      setTradesmen(result);
    } catch {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      coords ? fetchNearbyJobs(coords.latitude, coords.longitude) : fetchMyJobs(),
      loadTradesmen(),
    ]);
    setRefreshing(false);
  }, [coords]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {user?.fullName?.split(' ')[0]} 👋</Text>
          <Text style={styles.location}>
            <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
            {' '}İstanbul, Türkiye
          </Text>
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filter */}
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(undefined)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.id as Category)}
            >
              <Ionicons name={cat.icon as any} size={14} color={selectedCategory === cat.id ? COLORS.white : cat.color} />
              <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tradesmen' && styles.tabActive]}
            onPress={() => setActiveTab('tradesmen')}
          >
            <Text style={[styles.tabText, activeTab === 'tradesmen' && styles.tabTextActive]}>Ustalar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myJobs' && styles.tabActive]}
            onPress={() => { setActiveTab('myJobs'); fetchMyJobs(); }}
          >
            <Text style={[styles.tabText, activeTab === 'myJobs' && styles.tabTextActive]}>İlanlarım</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'tradesmen' ? (
          <View style={styles.list}>
            {tradesmen.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Bu kategoride usta bulunamadı</Text>
              </View>
            ) : (
              tradesmen.map((t) => (
                <TradesmanCard key={t.id} tradesman={t} onPress={() => {}} />
              ))
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {jobs.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Henüz ilan vermediniz</Text>
                <TouchableOpacity
                  style={styles.postJobLink}
                  onPress={() => navigation.navigate('PostJob')}
                >
                  <Text style={styles.postJobLinkText}>İlk ilanınızı verin</Text>
                </TouchableOpacity>
              </View>
            ) : (
              jobs.map((j) => (
                <JobCard
                  key={j.id}
                  job={j}
                  onPress={() => navigation.navigate('JobDetail', { jobId: j.id })}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PostJob')}>
        <Ionicons name="add" size={28} color={COLORS.white} />
        <Text style={styles.fabText}>İlan Ver</Text>
      </TouchableOpacity>
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
  location: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 2 },
  notifButton: { padding: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  categoryScroll: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.md },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '500' },
  categoryChipTextActive: { color: COLORS.white },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tab: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: COLORS.white },
  list: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  postJobLink: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round },
  postJobLinkText: { color: COLORS.white, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});
