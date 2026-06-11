import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, BORDER_RADIUS, SPACING } from '../constants';

interface MapMarkerProps {
  type: 'job' | 'tradesman';
  label?: string;
  isSelected?: boolean;
  categoryIcon?: string;
  color?: string;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  type,
  label,
  isSelected = false,
  categoryIcon = 'construct',
  color = COLORS.primary,
}) => {
  return (
    <View style={[styles.container, isSelected && styles.containerSelected]}>
      <View style={[styles.marker, { borderColor: color }, isSelected && { backgroundColor: color }]}>
        <Ionicons name={categoryIcon as any} size={16} color={isSelected ? COLORS.white : color} />
      </View>
      {label && (
        <View style={[styles.labelBadge, { backgroundColor: color }]}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
      <View style={[styles.tail, { borderTopColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  containerSelected: { transform: [{ scale: 1.2 }] },
  marker: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  labelBadge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.round,
  },
  labelText: { fontSize: 9, color: COLORS.white, fontWeight: '700' },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
