import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES } from '../../constants';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import { Avatar } from '../../components/ui/Avatar';
import { StarRating } from '../../components/ui/StarRating';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const TradesmanProfileScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} disabled={uploading}>
            <Avatar uri={user.profileImage} name={user.fullName} size={88} />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user.fullName}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={user.rating || 0} size={16} />
            <Text style={styles.ratingText}>{user.rating?.toFixed(1) || '0.0'} ({user.totalReviews || 0} değerlendirme)</Text>
          </View>
          <View style={styles.badges}>
            <Badge label="Usta" color={COLORS.secondary} />
            {user.isVerified && <Badge label="Doğrulandı" color={COLORS.success} />}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>İş</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalReviews || 0}</Text>
            <Text style={styles.statLabel}>Yorum</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.experience || 0}</Text>
            <Text style={styles.statLabel}>Yıl Tecrübe</Text>
          </View>
        </View>

        {/* Categories */}
        {user.categories && user.categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uzmanlık Alanları</Text>
            <View style={styles.categoryChips}>
              {user.categories.map((cat) => {
                const catInfo = CATEGORIES.find((c) => c.id === cat);
                return (
                  <View key={cat} style={[styles.catChip, { borderColor: catInfo?.color }]}>
                    <Ionicons name={catInfo?.icon as any || 'construct'} size={14} color={catInfo?.color} />
                    <Text style={[styles.catChipText, { color: catInfo?.color }]}>{catInfo?.label || cat}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bio */}
        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hakkımda</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuCard}>
          {[
            { icon: 'create-outline', label: 'Profili Düzenle' },
            { icon: 'images-outline', label: 'Portfolyo' },
            { icon: 'star-outline', label: 'Değerlendirmelerim' },
            { icon: 'card-outline', label: 'Banka Bilgileri' },
            { icon: 'notifications-outline', label: 'Bildirimler' },
            { icon: 'settings-outline', label: 'Ayarlar' },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
              {idx < arr.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <Button title="Çıkış Yap" onPress={handleLogout} variant="outline" style={styles.logoutBtn} />
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
  name: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary, marginBottom: SPACING.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  ratingText: { fontSize: FONTS.sizes.sm, color: COLORS.textLight },
  badges: { flexDirection: 'row', gap: SPACING.sm },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, padding: SPACING.lg, marginBottom: SPACING.md },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  section: { backgroundColor: COLORS.white, padding: SPACING.lg, marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, marginBottom: SPACING.md },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1.5,
    backgroundColor: COLORS.background,
  },
  catChipText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  bio: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },
  menuCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  menuIconContainer: { width: 36, height: 36, backgroundColor: `${COLORS.secondary}10`, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: FONTS.sizes.md, color: COLORS.text, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 68 },
  logoutContainer: { padding: SPACING.lg },
  logoutBtn: { borderColor: COLORS.error },
});
