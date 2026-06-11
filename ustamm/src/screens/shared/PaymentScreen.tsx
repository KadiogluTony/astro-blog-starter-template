import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { paymentService } from '../../services/payment.service';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';

type RouteType = RouteProp<{ Payment: { jobId: string; amount: number; merchantOid: string } }, 'Payment'>;

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { jobId, amount, merchantOid } = route.params;
  const { user } = useAuthStore();
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleStartPayment = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await paymentService.createPayTRPayment({
        jobId,
        customerId: user.id,
        tradesmanId: '',
        offerId: '',
        amount,
        customerEmail: user.email,
        customerName: user.fullName,
        customerPhone: user.phone,
        userIp: '127.0.0.1',
      });
      setIframeToken(result.iframeToken);
      setShowPayment(true);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Ödeme başlatılamadı');
    }
    setIsLoading(false);
  };

  const handleWebViewMessage = (event: any) => {
    const data = event.nativeEvent.data;
    if (data === 'success') {
      setPaymentStatus('success');
      setShowPayment(false);
    } else if (data === 'fail') {
      setPaymentStatus('fail');
      setShowPayment(false);
    }
  };

  if (showPayment && iframeToken) {
    const paytrUrl = `https://www.paytr.com/odeme/guvenli/${iframeToken}`;
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <WebView
          source={{ uri: paytrUrl }}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={(state) => {
            if (state.url.includes('/payment/success')) {
              setPaymentStatus('success');
              setShowPayment(false);
            } else if (state.url.includes('/payment/fail')) {
              setPaymentStatus('fail');
              setShowPayment(false);
            }
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultScreen}>
          <View style={[styles.resultIcon, { backgroundColor: `${COLORS.success}20` }]}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.resultTitle}>Ödeme Başarılı!</Text>
          <Text style={styles.resultSubtitle}>
            {amount.toLocaleString('tr-TR')}₺ güvenli emanet hesabına alındı. İş tamamlanınca ustaya aktarılacak.
          </Text>
          <Button title="Ana Sayfaya Dön" onPress={() => navigation.navigate('CustomerTabs')} style={styles.resultBtn} />
        </View>
      </SafeAreaView>
    );
  }

  if (paymentStatus === 'fail') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultScreen}>
          <View style={[styles.resultIcon, { backgroundColor: `${COLORS.error}20` }]}>
            <Ionicons name="close-circle" size={64} color={COLORS.error} />
          </View>
          <Text style={styles.resultTitle}>Ödeme Başarısız</Text>
          <Text style={styles.resultSubtitle}>Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.</Text>
          <Button title="Tekrar Dene" onPress={() => setPaymentStatus('idle')} style={styles.resultBtn} />
          <Button title="İptal Et" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Escrow explanation */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowHeader}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.success} />
            <Text style={styles.escrowTitle}>Güvenli Ödeme</Text>
          </View>
          <Text style={styles.escrowDescription}>
            Ödemeniz iş tamamlanana kadar güvenli emanet hesabında tutulur. İş tamamlandıktan sonra ustaya aktarılır.
          </Text>
          <View style={styles.escrowSteps}>
            {[
              { icon: 'lock-closed', text: 'Ödeme alınır ve güvenceye alınır' },
              { icon: 'construct', text: 'İş tamamlanır' },
              { icon: 'checkmark-circle', text: 'Onaylarsınız, ödeme ustaya aktarılır' },
            ].map((step, idx) => (
              <View key={idx} style={styles.escrowStep}>
                <View style={styles.escrowStepIcon}>
                  <Ionicons name={step.icon as any} size={18} color={COLORS.success} />
                </View>
                <Text style={styles.escrowStepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Amount summary */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Ödenecek Tutar</Text>
          <Text style={styles.amountValue}>{amount.toLocaleString('tr-TR')}₺</Text>
          <View style={styles.amountBreakdown}>
            <View style={styles.amountRow}>
              <Text style={styles.amountRowLabel}>İş Tutarı</Text>
              <Text style={styles.amountRowValue}>{amount.toLocaleString('tr-TR')}₺</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountRowLabel}>Hizmet Bedeli</Text>
              <Text style={styles.amountRowValue}>Ücretsiz</Text>
            </View>
          </View>
        </View>

        <Button
          title={isLoading ? 'Hazırlanıyor...' : 'Ödemeye Geç'}
          onPress={handleStartPayment}
          loading={isLoading}
          style={styles.payBtn}
        />

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={14} color={COLORS.textLight} />
          <Text style={styles.securityNoteText}>256-bit SSL şifreleme ile güvenli ödeme</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: SPACING.lg, gap: SPACING.lg },
  escrowCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  escrowHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  escrowTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary },
  escrowDescription: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, lineHeight: 20, marginBottom: SPACING.lg },
  escrowSteps: { gap: SPACING.md },
  escrowStep: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  escrowStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  escrowStepText: { fontSize: FONTS.sizes.sm, color: COLORS.text, flex: 1 },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  amountLabel: { fontSize: FONTS.sizes.md, color: COLORS.textLight, marginBottom: SPACING.sm },
  amountValue: { fontSize: 40, fontWeight: '800', color: COLORS.secondary, marginBottom: SPACING.lg },
  amountBreakdown: { width: '100%', gap: SPACING.sm },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountRowLabel: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  amountRowValue: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  payBtn: { marginTop: SPACING.sm },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  securityNoteText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  resultScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, gap: SPACING.lg },
  resultIcon: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.secondary },
  resultSubtitle: { fontSize: FONTS.sizes.md, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  resultBtn: { width: '100%' },
});
