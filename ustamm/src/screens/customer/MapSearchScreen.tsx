import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { useLocation } from '../../hooks/useLocation';
import { usersService } from '../../services/users.service';
import { User } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import { StarRating } from '../../components/ui/StarRating';

const { height } = Dimensions.get('window');

export const MapSearchScreen: React.FC = () => {
  const mapRef = useRef<MapView>(null);
  const { coords, isLoading: locLoading, requestLocation } = useLocation();
  const [tradesmen, setTradesmen] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coords) {
      loadTradesmen();
      animateToUserLocation();
    }
  }, [coords]);

  const animateToUserLocation = () => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  const loadTradesmen = async () => {
    if (!coords) return;
    setLoading(true);
    try {
      const results = await usersService.getNearbyTradesmen(coords.latitude, coords.longitude, 10);
      setTradesmen(results);
    } catch {}
    setLoading(false);
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
        {coords && (
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={10000}
            strokeColor={`${COLORS.primary}40`}
            fillColor={`${COLORS.primary}10`}
          />
        )}
        {tradesmen.map((t) =>
          t.location ? (
            <Marker
              key={t.id}
              coordinate={{ latitude: t.location.lat, longitude: t.location.lng }}
              onPress={() => setSelected(t)}
            >
              <View style={[styles.markerContainer, selected?.id === t.id && styles.markerSelected]}>
                <Text style={styles.markerText}>⭐ {t.rating?.toFixed(1) || '0.0'}</Text>
              </View>
            </Marker>
          ) : null
        )}
      </MapView>

      {/* My location button */}
      <TouchableOpacity style={styles.locationBtn} onPress={() => { requestLocation(); animateToUserLocation(); }}>
        <Ionicons name="locate" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Bottom sheet for selected tradesman */}
      {selected && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          <View style={styles.tradesmanInfo}>
            <Avatar uri={selected.profileImage} name={selected.fullName} size={56} />
            <View style={styles.tradesmanDetails}>
              <Text style={styles.tradesmanName}>{selected.fullName}</Text>
              <StarRating rating={selected.rating || 0} size={14} />
              <Text style={styles.tradesmanReviews}>{selected.totalReviews || 0} değerlendirme</Text>
            </View>
          </View>
          <View style={styles.tradesmanCategories}>
            {selected.categories?.slice(0, 3).map((c) => (
              <View key={c} style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{c}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.white} />
            <Text style={styles.contactBtnText}>İletişime Geç</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
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
  locationBtn: {
    position: 'absolute',
    bottom: 200,
    right: SPACING.lg,
    width: 48,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  markerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: { backgroundColor: COLORS.primary },
  markerText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.secondary },
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
  tradesmanInfo: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  tradesmanDetails: { flex: 1, justifyContent: 'center', gap: 2 },
  tradesmanName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary },
  tradesmanReviews: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  tradesmanCategories: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap' },
  catBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  catBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600' },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  contactBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  loadingOverlay: {
    position: 'absolute',
    top: SPACING.xl,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
