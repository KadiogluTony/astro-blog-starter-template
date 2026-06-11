import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/auth.store';
import { paymentService } from '../../services/payment.service';
import { PaymentTransaction } from '../../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const EarningsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    // In production, fetch all transactions for this tradesman
    setIsLoading(false);
  }, []);

  const releasedAmount = transactions
    .filter((t) => t.status === 'released')
    .reduce((sum, t) => sum + t.amount, 0);

  const escrowAmount = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kazançlarım</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.success }]}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.white} />
            <Text style={styles.summaryAmount}>{releasedAmount.toLocaleString('tr-TR')}₺</Text>
            <Text style={styles.summaryLabel}>Toplam Kazanç</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.warning }]}>
            <Ionicons name="time-outline" size={24} color={COLORS.white} />
            <Text style={styles.summaryAmount}>{escrowAmount.toLocaleString('tr-TR')}₺</Text>
            <Text style={styles.summaryLabel}>Bekleyen</Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bu Ay</Text>
            <Text style={styles.statValue}>0₺</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tamamlanan İş</Text>
            <Text style={styles.statValue}>{user?.totalJobs || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Ortalama Puan</Text>
            <Text style={styles.statValue}>★ {user?.rating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : transactions.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
              <Text style={styles.emptySubText}>Tamamladığınız işler burada görünecek</Text>
            </View>
          ) : (
            transactions.map((t) => (
              <View key={t.id} style={styles.transactionItem}>
                <View style={[styles.transIcon, { backgroundColor: t.status === 'released' ? `${COLORS.success}20` : `${COLORS.warning}20` }]}>
                  <Ionicons name="cash-outline" size={20} color={t.status === 'released' ? COLORS.success : COLORS.warning} />
                </View>
                <View style={styles.transInfo}>
                  <Text style={styles.transJob}>İş #{t.jobId.slice(-6)}</Text>
                  <Text style={styles.transDate}>{t.paidAt ? format(t.paidAt, 'd MMM', { locale: tr }) : '-'}</Text>
                </View>
                <Text style={[styles.transAmount, { color: t.status === 'released' ? COLORS.success : COLORS.warning }]}>
                  +{t.amount.toLocaleString('tr-TR')}₺
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  summaryRow: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  summaryAmount: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white },
  summaryLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  statsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  statLabel: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  statValue: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.secondary },
  statDivider: { height: 1, backgroundColor: COLORS.border },
  section: { paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, marginBottom: SPACING.md },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textLight, fontWeight: '500' },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, textAlign: 'center' },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  transIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  transInfo: { flex: 1 },
  transJob: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.secondary },
  transDate: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  transAmount: { fontSize: FONTS.sizes.md, fontWeight: '700' },
});
