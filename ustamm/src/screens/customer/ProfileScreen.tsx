import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

export const CustomerProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0] && user) {
      setUploading(true);
      try {
        const url = await authService.uploadProfilePhoto(user.id, result.assets[0].uri);
        await updateUser({ profileImage: url });
      } catch (err: any) {
        Alert.alert('Hata', err.message);
      }
      setUploading(false);
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: 'document-text-outline', label: 'İlanlarım', onPress: () => {} },
    { icon: 'receipt-outline', label: 'Teklifler', onPress: () => {} },
    { icon: 'card-outline', label: 'Ödeme Geçmişi', onPress: () => {} },
    { icon: 'star-outline', label: 'Değerlendirmelerim', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Bildirimler', onPress: () => {} },
    { icon: 'settings-outline', label: 'Ayarlar', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Yardım', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} disabled={uploading}>
            <Avatar uri={user.profileImage} name={user.fullName} size={80} />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="person" size={14} color={COLORS.primary} />
            <Text style={styles.roleText}>Müşteri</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>İlan</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalReviews || 0}</Text>
            <Text style={styles.statLabel}>Değerlendirme</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={16} color={user.isVerified ? COLORS.success : COLORS.textLight} />
            <Text style={styles.statLabel}>{user.isVerified ? 'Doğrulandı' : 'Doğrulanmadı'}</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
              {idx < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingVertical: SPACING.xl, backgroundColor: COLORS.white, marginBottom: SPACING.md },
  avatarContainer: { position: 'relative', marginBottom: SPACING.md },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  name: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  email: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.sm,
  },
  roleText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  menuIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
  logoutContainer: { padding: SPACING.lg },
  logoutBtn: { borderColor: COLORS.error },
});
