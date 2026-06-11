import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = COLORS.primary, style }) => {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}40` }, style]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
});
