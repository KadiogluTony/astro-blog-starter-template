import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, CATEGORIES } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/auth.store';
import { jobsService } from '../../services/jobs.service';
import { useLocation } from '../../hooks/useLocation';
import { Category, JobStatus } from '../../types';

export const PostJobScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { coords, address } = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | undefined>();
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Bilgi', 'En fazla 5 fotoğraf ekleyebilirsiniz');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Hata', 'Başlık giriniz'); return; }
    if (!description.trim()) { Alert.alert('Hata', 'Açıklama giriniz'); return; }
    if (!category) { Alert.alert('Hata', 'Kategori seçiniz'); return; }
    if (!budgetMin || !budgetMax) { Alert.alert('Hata', 'Bütçe aralığı giriniz'); return; }

    setIsLoading(true);
    try {
      const job = await jobsService.createJob({
        customerId: user!.id,
        customerName: user!.fullName,
        customerPhoto: user!.profileImage,
        title: title.trim(),
        description: description.trim(),
        category,
        location: {
          lat: coords?.latitude || 41.0082,
          lng: coords?.longitude || 28.9784,
          address: address || 'İstanbul',
          city: 'İstanbul',
          district: '',
        },
        status: JobStatus.PENDING,
        budget: { min: parseInt(budgetMin), max: parseInt(budgetMax) },
        images: [],
        offerCount: 0,
      });

      // Upload images
      for (const imgUri of images) {
        await jobsService.addJobImage(job.id, imgUri);
      }

      Alert.alert('Başarılı', 'İlanınız yayınlandı!', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İlan yayınlanamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Input
          label="İş Başlığı"
          value={title}
          onChangeText={setTitle}
          placeholder="Örn: Elektrik tesisatı tamiri"
          leftIcon="document-text-outline"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Açıklama</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="İşin detaylarını açıklayın..."
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, category === cat.id && styles.categoryItemSelected]}
                onPress={() => setCategory(cat.id as Category)}
              >
                <Ionicons name={cat.icon as any} size={20} color={category === cat.id ? COLORS.white : cat.color} />
                <Text style={[styles.categoryItemText, category === cat.id && { color: COLORS.white }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bütçe Aralığı (₺)</Text>
          <View style={styles.budgetRow}>
            <Input
              value={budgetMin}
              onChangeText={setBudgetMin}
              placeholder="Min"
              keyboardType="numeric"
              style={{ flex: 1 }}
              containerStyle={{ flex: 1 }}
            />
            <Text style={styles.budgetDash}>—</Text>
            <Input
              value={budgetMax}
              onChangeText={setBudgetMax}
              placeholder="Max"
              keyboardType="numeric"
              style={{ flex: 1 }}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fotoğraflar ({images.length}/5)</Text>
          <View style={styles.imageRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageThumb}>
                <Image source={{ uri: img }} style={styles.image} />
                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(idx)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImage} onPress={pickImage}>
                <Ionicons name="camera-outline" size={28} color={COLORS.textLight} />
                <Text style={styles.addImageText}>Ekle</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.locationBox}>
          <Ionicons name="location" size={18} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {address || 'Konum alınıyor...'}
          </Text>
        </View>

        <Button
          title={isLoading ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, gap: SPACING.lg },
  field: { gap: SPACING.sm },
  label: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.secondary },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryItemSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryItemText: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '500' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  budgetDash: { fontSize: FONTS.sizes.lg, color: COLORS.textLight },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  imageThumb: { width: 80, height: 80, position: 'relative' },
  image: { width: 80, height: 80, borderRadius: BORDER_RADIUS.md },
  removeImage: { position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.white, borderRadius: 10 },
  addImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  addImageText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text },
  submitButton: { marginTop: SPACING.sm },
});
