import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  coords: { latitude: number; longitude: number } | null;
  address: string;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    coords: null,
    address: '',
    isLoading: false,
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({ ...s, hasPermission: false, isLoading: false, error: 'Konum izni verilmedi' }));
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = geocode
        ? `${geocode.street || ''} ${geocode.district || ''}, ${geocode.city || ''}`.trim()
        : '';

      setState({
        coords: { latitude: location.coords.latitude, longitude: location.coords.longitude },
        address,
        isLoading: false,
        error: null,
        hasPermission: true,
      });
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false, error: err.message }));
    }
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const [geocode] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      return geocode ? `${geocode.street || ''} ${geocode.district || ''}, ${geocode.city || ''}`.trim() : '';
    } catch {
      return '';
    }
  };

  return { ...state, requestLocation, getAddressFromCoords };
};
