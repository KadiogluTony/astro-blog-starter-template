export const COLORS = {
  primary: '#FF6B35',
  secondary: '#2C3E50',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  background: '#F8F9FA',
  white: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#ECF0F1',
};

export const CATEGORIES = [
  { id: 'elektrik', label: 'Elektrik', icon: 'flash', color: '#F39C12' },
  { id: 'su_tesisati', label: 'Su Tesisatı', icon: 'water', color: '#3498DB' },
  { id: 'tadilat', label: 'Tadilat', icon: 'construct', color: '#9B59B6' },
  { id: 'boyaci', label: 'Boyacı', icon: 'color-palette', color: '#E74C3C' },
  { id: 'marangoz', label: 'Marangoz', icon: 'hammer', color: '#8B4513' },
  { id: 'temizlik', label: 'Temizlik', icon: 'sparkles', color: '#1ABC9C' },
  { id: 'bahce', label: 'Bahçe', icon: 'leaf', color: '#27AE60' },
  { id: 'kombi', label: 'Kombi', icon: 'flame', color: '#E67E22' },
  { id: 'klima', label: 'Klima', icon: 'snow', color: '#2980B9' },
  { id: 'diger', label: 'Diğer', icon: 'ellipsis-horizontal', color: '#95A5A6' },
];

export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  round: 999,
};

export const JOB_STATUSES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: '#F39C12' },
  active: { label: 'Aktif', color: '#27AE60' },
  in_progress: { label: 'Devam Ediyor', color: '#3498DB' },
  completed: { label: 'Tamamlandı', color: '#2C3E50' },
  cancelled: { label: 'İptal Edildi', color: '#E74C3C' },
};

export const APP_NAME = 'Ustamm';
