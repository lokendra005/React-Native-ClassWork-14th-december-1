import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const BENGALURU = { latitude: 12.9716, longitude: 77.5946 };

const LocationPicker: React.FC<LocationPickerProps> = ({ visible, onClose, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(BENGALURU);
  const [address, setAddress] = useState('Bengaluru, Karnataka, India');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedLocation(BENGALURU);
      setAddress('Bengaluru, Karnataka, India');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [visible]);

  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Bengaluru, India')}&format=json&limit=5`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'FarmFreshApp' },
      });
      const data: SearchResult[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchPlaces(text), 500);
  };

  const selectResult = async (result: SearchResult) => {
    const lat = parseFloat(result.lat);// 57.1000
    const lng = parseFloat(result.lon);//  23.000
    setSelectedLocation({ latitude: lat, longitude: lng });
    setAddress(result.display_name);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      setSelectedLocation({ latitude, longitude });

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode?.[0]) {
        const addr = geocode[0];
        setAddress([addr.street, addr.city, addr.region].filter(Boolean).join(', ') || 'Current Location');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMapHtml = (lat: number, lng: number) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            * { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const map = L.map('map').setView([${lat}, ${lng}], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            const marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
            
            marker.on('dragend', (e) => {
              const pos = marker.getLatLng();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location',
                latitude: pos.lat,
                longitude: pos.lng
              }));
            });
            
            map.on('click', (e) => {
              marker.setLatLng(e.latlng);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'location',
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
              }));
            });
          </script>
        </body>
      </html>
    `;
  };

  const handleMapMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location') {
        const { latitude, longitude } = data;
        setSelectedLocation({ latitude, longitude });
        
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode?.[0]) {
          const addr = geocode[0];
          setAddress([addr.street, addr.city, addr.region].filter(Boolean).join(', ') || 'Selected Location');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConfirm = () => {
    onLocationSelect({ ...selectedLocation, address });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Location</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search places in Bengaluru..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.results}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => selectResult(item)}>
                  <Text style={styles.resultIcon}>📍</Text>
                  <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Map */}
        <WebView
          key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
          source={{ html: generateMapHtml(selectedLocation.latitude, selectedLocation.longitude) }}
          style={styles.map}
          onMessage={handleMapMessage}
          javaScriptEnabled={true}
        />

        {/* Address */}
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>📍 {address}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btn} onPress={getCurrentLocation} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <Text style={styles.btnText}>📍 Current Location</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleConfirm}>
            <Text style={[styles.btnText, styles.btnPrimaryText]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#10b981',
  },
  closeBtn: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  results: {
    maxHeight: 150,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  map: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addressBox: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
  },
  addressLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  btnPrimary: {
    backgroundColor: '#10b981',
  },
  btnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  btnPrimaryText: {
    color: '#fff',
  },
});

export default LocationPicker;
