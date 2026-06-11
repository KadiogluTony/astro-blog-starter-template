import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, CATEGORIES } from '../../constants';
import { authService } from '../../services/auth.service';
import { UserRole } from '../../types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z
  .object({
    fullName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const role: UserRole = route.params?.role ?? UserRole.CUSTOMER;
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: FormData) => {
    if (role === UserRole.TRADESMAN && selectedCategories.length === 0) {
      Alert.alert('Hata', 'En az bir kategori seçin');
      return;
    }
    setLoading(true);
    try {
      await authService.register(
        data.email,
        data.password,
        data.phone,
        data.fullName,
        role,
        role === UserRole.TRADESMAN ? selectedCategories : undefined
      );
    } catch (error: any) {
      const msg =
        error.code === 'auth/email-already-in-use'
          ? 'Bu e-posta zaten kullanımda'
          : 'Kayıt oluşturulamadı. Tekrar deneyin.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            {role === UserRole.TRADESMAN ? 'Usta olarak kayıt olun' : 'Müşteri olarak kayıt olun'}
          </Text>
          <View style={styles.form}>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <Input label="Ad Soyad" placeholder="Ad Soyad" value={value} onChangeText={onChange} error={errors.fullName?.message} leftIcon="person-outline" />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input label="E-posta" placeholder="ornek@email.com" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} leftIcon="mail-outline" />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input label="Telefon" placeholder="0500 000 00 00" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} leftIcon="call-outline" />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input label="Şifre" placeholder="••••••••" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} leftIcon="lock-closed-outline" />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input label="Şifre Tekrar" placeholder="••••••••" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} leftIcon="lock-closed-outline" />
              )}
            />
            {role === UserRole.TRADESMAN && (
              <View>
                <Text style={styles.catLabel}>Kategoriler (en az 1 seçin)</Text>
                <View style={styles.catGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, selectedCategories.includes(cat.id) && styles.catChipSelected]}
                      onPress={() => toggleCategory(cat.id)}
                    >
                      <Ionicons name={cat.icon as any} size={16} color={selectedCategories.includes(cat.id) ? COLORS.white : COLORS.text} />
                      <Text style={[styles.catChipText, selectedCategories.includes(cat.id) && styles.catChipTextSelected]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <Button title="Kayıt Ol" onPress={handleSubmit(onSubmit)} loading={loading} variant="primary" size="lg" />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  backBtn: { marginBottom: SPACING.md, width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginTop: SPACING.xs, marginBottom: SPACING.xl },
  form: { gap: SPACING.md },
  catLabel: { fontSize: 15, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.sm },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  catChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 13, color: COLORS.text },
  catChipTextSelected: { color: COLORS.white },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { fontSize: 15, color: COLORS.textLight },
  loginLink: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
});
