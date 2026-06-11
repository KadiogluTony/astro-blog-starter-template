import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, JOB_STATUSES, CATEGORIES } from '../../constants';
import { CustomerStackParamList } from '../../navigation/CustomerNavigator';
import { jobsService } from '../../services/jobs.service';
import { Job, Offer } from '../../types';
import { OfferCard } from '../../components/OfferCard';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type RouteType = RouteProp<CustomerStackParamList, 'JobDetail'>;

export const CustomerJobDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { jobId } = route.params;
  const [job, setJob] = useState<Job | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [j, o] = await Promise.all([
        jobsService.getJobById(jobId),
        jobsService.getOffersForJob(jobId),
      ]);
      setJob(j);
      setOffers(o);
    } catch {}
    setIsLoading(false);
  };

  const handleAcceptOffer = async (offer: Offer) => {
    Alert.alert('Teklifi Kabul Et', `${offer.tradesmanName} adlı ustanın ${offer.price}₺ teklifini kabul etmek istiyor musunuz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Kabul Et',
        onPress: async () => {
          try {
            await jobsService.acceptOffer(jobId, offer.id, offer.tradesmanId);
            navigation.navigate('Payment', { jobId, amount: offer.price, merchantOid: `${jobId}_${Date.now()}` });
          } catch (err: any) {
            Alert.alert('Hata', err.message);
          }
        },
      },
    ]);
  };

  if (isLoading || !job) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const catInfo = CATEGORIES.find((c) => c.id === job.category);
  const statusInfo = JOB_STATUSES[job.status] || { label: job.status, color: COLORS.textLight };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {job.images.length > 0 && (
          <FlatList
            data={job.images}
            horizontal
            pagingEnabled
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.jobImage} />}
            showsHorizontalScrollIndicator={false}
          />
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{job.title}</Text>
            <Badge label={statusInfo.label} color={statusInfo.color} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name={catInfo?.icon as any || 'construct'} size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>{catInfo?.label}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.metaText}>{job.location.address}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.metaText}>{format(job.createdAt, 'd MMM', { locale: tr })}</Text>
            </View>
          </View>

          <View style={styles.budgetBox}>
            <Ionicons name="cash-outline" size={20} color={COLORS.success} />
            <Text style={styles.budgetText}>Bütçe: {job.budget.min}₺ - {job.budget.max}₺</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teklifler ({offers.length})</Text>
            {offers.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="time-outline" size={32} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Henüz teklif gelmedi</Text>
              </View>
            ) : (
              offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onAccept={() => handleAcceptOffer(offer)}
                  onChat={() => navigation.navigate('Chat', {
                    receiverId: offer.tradesmanId,
                    jobId,
                    receiverName: offer.tradesmanName,
                  })}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  jobImage: { width: 300, height: 200, marginRight: 2 },
  content: { padding: SPACING.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary, flex: 1, marginRight: SPACING.sm },
  metaRow: { gap: SPACING.sm, marginBottom: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  budgetText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.success },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, marginBottom: SPACING.md },
  description: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 24 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
});
