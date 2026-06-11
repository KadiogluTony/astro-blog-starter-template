import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES, JOB_STATUSES } from '../../constants';
import { TradesmanStackParamList } from '../../navigation/TradesmanNavigator';
import { jobsService } from '../../services/jobs.service';
import { useAuthStore } from '../../store/auth.store';
import { Job } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type RouteType = RouteProp<TradesmanStackParamList, 'JobDetail'>;

export const TradesmanJobDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { jobId } = route.params;
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyOffered, setAlreadyOffered] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const j = await jobsService.getJobById(jobId);
      setJob(j);
      if (j && user) {
        const offers = await jobsService.getOffersForJob(jobId);
        setAlreadyOffered(offers.some((o) => o.tradesmanId === user.id));
      }
    } catch {}
    setIsLoading(false);
  };

  const handleSubmitOffer = async () => {
    if (!offerPrice) { Alert.alert('Hata', 'Teklif fiyatı giriniz'); return; }
    if (!offerMessage.trim()) { Alert.alert('Hata', 'Teklif mesajı giriniz'); return; }
    if (!user || !job) return;

    setSubmitting(true);
    try {
      await jobsService.createOffer({
        jobId,
        tradesmanId: user.id,
        tradesmanName: user.fullName,
        tradesmanPhoto: user.profileImage,
        tradesmanRating: user.rating,
        price: parseInt(offerPrice),
        message: offerMessage.trim(),
        status: 'pending',
      });
      setAlreadyOffered(true);
      Alert.alert('Başarılı', 'Teklifiniz gönderildi!');
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    }
    setSubmitting(false);
  };

  if (isLoading || !job) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
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

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name={catInfo?.icon as any || 'construct'} size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>{catInfo?.label}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color={COLORS.textLight} />
              <Text style={styles.infoText} numberOfLines={1}>{job.location.address}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={18} color={COLORS.success} />
              <Text style={[styles.infoText, { color: COLORS.success }]}>{job.budget.min}₺ - {job.budget.max}₺</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
              <Text style={styles.infoText}>{format(job.createdAt, 'd MMMM', { locale: tr })}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İş Açıklaması</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          <View style={styles.customerCard}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.textLight} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{job.customerName}</Text>
              <Text style={styles.customerLabel}>İş Sahibi</Text>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Chat', {
                receiverId: job.customerId,
                jobId: job.id,
                receiverName: job.customerName,
              })}
            >
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Offer form */}
          {job.status === 'pending' && !alreadyOffered && (
            <View style={styles.offerForm}>
              <Text style={styles.sectionTitle}>Teklif Ver</Text>
              <View style={styles.priceInput}>
                <Ionicons name="cash-outline" size={18} color={COLORS.textLight} />
                <TextInput
                  style={styles.priceField}
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                  keyboardType="numeric"
                  placeholder="Teklif fiyatınız (₺)"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <TextInput
                style={styles.messageField}
                value={offerMessage}
                onChangeText={setOfferMessage}
                multiline
                numberOfLines={3}
                placeholder="Müşteriye mesajınızı yazın..."
                placeholderTextColor={COLORS.textLight}
                textAlignVertical="top"
              />
              <Button
                title={submitting ? 'Gönderiliyor...' : 'Teklif Gönder'}
                onPress={handleSubmitOffer}
                loading={submitting}
              />
            </View>
          )}

          {alreadyOffered && (
            <View style={styles.alreadyOffered}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.alreadyOfferedText}>Bu iş için teklif verdiniz</Text>
            </View>
          )}
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary, flex: 1, marginRight: SPACING.sm },
  infoGrid: { gap: SPACING.sm, marginBottom: SPACING.lg },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  infoText: { fontSize: FONTS.sizes.md, color: COLORS.text, flex: 1 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, marginBottom: SPACING.md },
  description: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 24 },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  customerInfo: { flex: 1 },
  customerName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.secondary },
  customerLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  chatBtn: { padding: SPACING.sm, backgroundColor: `${COLORS.primary}15`, borderRadius: BORDER_RADIUS.round },
  offerForm: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  priceField: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },
  messageField: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    minHeight: 80,
  },
  alreadyOffered: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  alreadyOfferedText: { fontSize: FONTS.sizes.md, color: COLORS.success, fontWeight: '600' },
});
