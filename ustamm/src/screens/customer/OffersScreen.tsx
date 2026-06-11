import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants';
import { CustomerStackParamList } from '../../navigation/CustomerNavigator';
import { jobsService } from '../../services/jobs.service';
import { Offer } from '../../types';
import { OfferCard } from '../../components/OfferCard';

type RouteType = RouteProp<CustomerStackParamList, 'Offers'>;

export const OffersScreen: React.FC = () => {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<any>();
  const { jobId } = route.params;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const result = await jobsService.getOffersForJob(jobId);
      setOffers(result);
    } catch {}
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={offers}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Henüz teklif yok</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <OfferCard
            offer={item}
            onAccept={async () => {
              await jobsService.acceptOffer(jobId, item.id, item.tradesmanId);
              navigation.navigate('Payment', { jobId, amount: item.price, merchantOid: `${jobId}_${Date.now()}` });
            }}
            onChat={() => navigation.navigate('Chat', {
              receiverId: item.tradesmanId,
              jobId,
              receiverName: item.tradesmanName,
            })}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.lg, gap: SPACING.md },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
});
