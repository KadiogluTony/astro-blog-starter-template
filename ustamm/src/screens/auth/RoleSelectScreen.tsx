import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { UserRole } from '../../types';

export default function RoleSelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    route.params?.preSelectedRole ?? UserRole.CUSTOMER
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Hesap Türü Seçin</Text>
        <Text style={styles.subtitle}>Platformu nasıl kullanmak istediğinizi seçin</Text>
        <View style={styles.cardsRow}>
          <TouchableOpacity
            style={[styles.card, selectedRole === UserRole.CUSTOMER && styles.cardSelected]}
            onPress={() => setSelectedRole(UserRole.CUSTOMER)}
          >
            <View style={[styles.cardIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Müşteri</Text>
            <Text style={styles.cardDesc}>Usta bul ve iş yaptır</Text>
            <View style={styles.featureList}>
              <FeatureItem text="Usta ara ve karşılaştır" />
              <FeatureItem text="Teklif al ve seç" />
              <FeatureItem text="Güvenli ödeme yap" />
            </View>
            {selectedRole === UserRole.CUSTOMER && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, selectedRole === UserRole.TRADESMAN && styles.cardSelected]}
            onPress={() => setSelectedRole(UserRole.TRADESMAN)}
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#2C3E5020' }]}>
              <Ionicons name="construct" size={40} color={COLORS.secondary} />
            </View>
            <Text style={styles.cardTitle}>Usta</Text>
            <Text style={styles.cardDesc}>İş bul ve kazan</Text>
            <View style={styles.featureList}>
              <FeatureItem text="İlanları gör ve teklif ver" />
              <FeatureItem text="Profilini sergile" />
              <FeatureItem text="Güvenli öde al" />
            </View>
            {selectedRole === UserRole.TRADESMAN && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('Login', { role: selectedRole })}
        >
          <Text style={styles.continueBtnText}>Devam Et</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Register', { role: selectedRole })}
          style={styles.registerLink}
        >
          <Text style={styles.registerLinkText}>
            Hesabınız yok mu? <Text style={styles.registerLinkBold}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark" size={14} color={COLORS.success} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingTop: SPACING.md },
  backBtn: { marginBottom: SPACING.md, width: 40, height: 40, justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginBottom: SPACING.xl },
  cardsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  cardSelected: { borderColor: COLORS.primary },
  cardIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  featureList: { gap: SPACING.xs },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 12, color: COLORS.text, flex: 1 },
  checkBadge: { position: 'absolute', top: 8, right: 8 },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  registerLink: { alignItems: 'center', paddingVertical: SPACING.sm },
  registerLinkText: { fontSize: 15, color: COLORS.textLight },
  registerLinkBold: { color: COLORS.primary, fontWeight: '600' },
});
