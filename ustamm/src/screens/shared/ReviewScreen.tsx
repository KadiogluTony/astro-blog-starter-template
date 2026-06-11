import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants';
import { reviewsService } from '../../services/reviews.service';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';

type RouteType = RouteProp<{ Review: { jobId: string; targetId: string; targetName: string } }, 'Review'>;

export const ReviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteType>();
  const { jobId, targetId, targetName } = route.params;
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen puan verin');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Hata', 'Lütfen yorum yazın');
      return;
    }
    if (!user) return;

    setIsLoading(true);
    try {
      await reviewsService.addReview({
        jobId,
        reviewerId: user.id,
        reviewerName: user.fullName,
        reviewerPhoto: user.profileImage,
        targetId,
        rating,
        comment: comment.trim(),
      });
      Alert.alert('Teşekkürler', 'Değerlendirmeniz kaydedildi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message);
    }
    setIsLoading(false);
  };

  const ratingLabels = ['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.targetInfo}>
          <View style={styles.targetIcon}>
            <Ionicons name="person" size={40} color={COLORS.textLight} />
          </View>
          <Text style={styles.targetName}>{targetName}</Text>
          <Text style={styles.subtitle}>Bu usta için değerlendirme yapın</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Puan</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= rating ? '#F39C12' : COLORS.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
          )}
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.label}>Yorum</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            placeholder="Deneyiminizi paylaşın..."
            placeholderTextColor={COLORS.textLight}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        <Button
          title={isLoading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitBtn}
        />

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.skipText}>Şimdi değil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, gap: SPACING.xl },
  targetInfo: { alignItems: 'center', gap: SPACING.sm },
  targetIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.secondary },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  ratingSection: { alignItems: 'center', gap: SPACING.md },
  label: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.secondary, alignSelf: 'flex-start' },
  stars: { flexDirection: 'row', gap: SPACING.sm },
  starBtn: { padding: SPACING.xs },
  ratingLabel: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: '#F39C12' },
  commentSection: { gap: SPACING.sm },
  commentInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 120,
  },
  charCount: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, alignSelf: 'flex-end' },
  submitBtn: { marginTop: SPACING.sm },
  skipBtn: { alignItems: 'center', paddingVertical: SPACING.md },
  skipText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
});
