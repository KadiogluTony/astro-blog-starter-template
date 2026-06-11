import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';
import { UserRole } from '../../types';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        <View style={styles.logoContainer}>
          <Ionicons name="construct" size={56} color={COLORS.white} />
          <Text style={styles.appName}>USTAMM</Text>
          <Text style={styles.tagline}>Türkiye'nin Usta Platformu</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Usta</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>İş Tamamlandı</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>81</Text>
            <Text style={styles.statLabel}>İl</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.bottomTitle}>Nasıl devam etmek istiyorsunuz?</Text>
        <TouchableOpacity
          style={styles.tradesmanBtn}
          onPress={() => navigation.navigate('RoleSelect', { preSelectedRole: UserRole.TRADESMAN })}
        >
          <Ionicons name="hammer" size={24} color={COLORS.primary} style={styles.btnIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tradesmanBtnTitle}>Usta mısınız?</Text>
            <Text style={styles.tradesmanBtnSubtitle}>İş bulun ve kazanın</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.customerBtn}
          onPress={() => navigation.navigate('RoleSelect', { preSelectedRole: UserRole.CUSTOMER })}
        >
          <Ionicons name="search" size={24} color={COLORS.white} style={styles.btnIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.customerBtnTitle}>İş mi arıyorsunuz?</Text>
            <Text style={styles.customerBtnSubtitle}>Güvenilir usta bulun</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    left: -60,
  },
  circle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: 40,
    left: 20,
  },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 8,
    marginTop: SPACING.sm,
  },
  tagline: {
    fontSize: FONTS.sizes.lg,
    color: 'rgba(255,255,255,0.85)',
    marginTop: SPACING.xs,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  bottomSection: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  bottomTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  tradesmanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  btnIcon: { width: 36 },
  tradesmanBtnTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  tradesmanBtnSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 2 },
  customerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  customerBtnTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  customerBtnSubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
