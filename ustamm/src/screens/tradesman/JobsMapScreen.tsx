import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES } from '../../constants';
import { useLocation } from '../../hooks/useLocation';
import { useJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/auth.store';
import { Job, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const JobsMapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const { coords, isLoading: locLoading } = useLocation();
  const { jobs, fetchNearbyJobs, isLoading, addOffer } = useJobs();
  const { user } = useAuthStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [offerPrice, setOfferPrice] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (coords) {
      fetchNearbyJobs(coords.latitude, coords.longitude);
    }
  }, [coords]);

  const filteredJobs = selectedCategory
    ? jobs.filter((j) => j.category === selectedCategory)
    : jobs;

  const handleMakeOffer = async () => {
    if (!selectedJob || !user) return;
    if (!offerPrice) {
      Alert.alert('Hata', 'Teklif fiyatı giriniz');
      return;
    }
    try {
      await addOffer({
        jobId: selectedJob.id,
        tradesmanId: user.id,
        tradesmanName: user.fullName,
        tradesmanPhoto: user.profileImage,
        tradesmanRating: user.rating,
        price: parseInt(offerPrice),
        message: `Merhaba, ${selectedJob.title} için teklif veriyorum.`,
        status: 'pending',
      });
      Alert.alert('Başarılı', 'Teklifiniz gönderildi!');
      setShowOfferModal(false);
      setSelectedJob(null);
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    }
  };

  if (locLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Konum alınıyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Category Filter */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
            onPress={() => setSelectedCategory(undefined)}
          >
            <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>Tümü</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat.id as Category)}
            >
              <Ionicons name={cat.icon as any} size={12} color={selectedCategory === cat.id ? COLORS.white : cat.color} />
              <Text style={[styles.filterChipText, selectedCategory === cat.id && styles.filterChipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: coords?.latitude || 41.0082,
          longitude: coords?.longitude || 28.9784,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredJobs.map((job) => (
          <Marker
            key={job.id}
            coordinate={{ latitude: job.location.lat, longitude: job.location.lng }}
            onPress={() => { setSelectedJob(job); setShowOfferModal(false); }}
          >
            <View style={[styles.jobMarker, selectedJob?.id === job.id && styles.jobMarkerSelected]}>
              <Ionicons
                name={(CATEGORIES.find((c) => c.id === job.category)?.icon as any) || 'construct'}
                size={14}
                color={selectedJob?.id === job.id ? COLORS.white : COLORS.primary}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Job count badge */}
      <View style={styles.countBadge}>
        <Ionicons name="briefcase" size={14} color={COLORS.primary} />
        <Text style={styles.countText}>{filteredJobs.length} iş</Text>
      </View>

      {/* Selected job bottom sheet */}
      {selectedJob && !showOfferModal && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedJob(null)}>
            <Ionicons name="close" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.jobTitle} numberOfLines={2}>{selectedJob.title}</Text>
          <Text style={styles.jobCategory}>{CATEGORIES.find((c) => c.id === selectedJob.category)?.label}</Text>
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
              <Text style={styles.metaText}>{selectedJob.location.address}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={COLORS.success} />
              <Text style={styles.metaText}>{selectedJob.budget.min}₺ - {selectedJob.budget.max}₺</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <Button
              title="Detaylar"
              onPress={() => navigation.navigate('JobDetail', { jobId: selectedJob.id })}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="Teklif Ver"
              onPress={() => setShowOfferModal(true)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.background },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  filterBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScroll: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONTS.sizes.xs, color: COLORS.text, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.white },
  jobMarker: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  jobMarkerSelected: { backgroundColor: COLORS.primary },
  countBadge: {
    position: 'absolute',
    top: 56,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  closeBtn: { position: 'absolute', top: SPACING.md, right: SPACING.md, padding: SPACING.sm },
  jobTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, marginBottom: 4, paddingRight: 40 },
  jobCategory: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.md },
  jobMeta: { gap: SPACING.sm, marginBottom: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  actionRow: { flexDirection: 'row', gap: SPACING.md },
});
