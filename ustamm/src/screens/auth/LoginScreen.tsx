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
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { authService } from '../../services/auth.service';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.login(data.email, data.password);
    } catch (error: any) {
      const msg =
        error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
          ? 'E-posta veya şifre hatalı'
          : error.code === 'auth/too-many-requests'
          ? 'Çok fazla deneme. Lütfen bekleyin.'
          : 'Giriş yapılamadı. Tekrar deneyin.';
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
          <View style={styles.header}>
            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
          </View>
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="E-posta"
                  placeholder="ornek@email.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  leftIcon="mail-outline"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Şifre"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={errors.password?.message}
                  leftIcon="lock-closed-outline"
                />
              )}
            />
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </TouchableOpacity>
            <Button
              title="Giriş Yap"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              variant="primary"
              size="lg"
            />
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register', { role: route.params?.role })}
            >
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, flexGrow: 1 },
  backBtn: { marginBottom: SPACING.lg, width: 40, height: 40, justifyContent: 'center' },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textLight, marginTop: SPACING.xs },
  form: { gap: SPACING.md },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { fontSize: FONTS.sizes.md, color: COLORS.textLight },
  registerLink: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '600' },
});
