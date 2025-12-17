import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadFavorites, removeFromFavorites } from '../../store/favoritesSlice';
import { addToCart } from '../../store/cartSlice';
import FavoriteButton from '../../components/FavoriteButton';

const Favorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.favorites.items);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadSavedFavorites();
  }, []);

  const loadSavedFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favorites');
      if (saved) {
        const favoritesData = JSON.parse(saved);
        dispatch(loadFavorites(favoritesData));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleRemoveFavorite = (id: number) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this item from your favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeFromFavorites(id));
          },
        },
      ]
    );
  };

  const handleAddToCart = (item: any) => {
    dispatch(addToCartAction({
      id: item.id,
      name: item.name,
      image: item.image,
      category: item.category,
      price: item.price,
    }));
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-emerald-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">My Favorites</Text>
          <Text className="text-white/80 text-sm">Your saved items</Text>
        </View>
        
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="heart-outline" size={80} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-800 mt-4">
            No Favorites Yet
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Start adding products to your favorites to see them here
          </Text>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-xl mt-6"
            onPress={() => router.push('/(main)/home')}
          >
            <Text className="text-white font-semibold">Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-emerald-600 px-4 py-4">
        <Text className="text-white text-2xl font-bold">My Favorites</Text>
        <Text className="text-white/80 text-sm">{favorites.length} item(s) saved</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center">
              {/* Product Image */}
              <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center mr-4">
                <Text className="text-4xl">{item.image}</Text>
              </View>

              {/* Product Info */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500">{item.category}</Text>
                <Text className="text-lg font-bold text-emerald-600 mt-1">
                  {item.price}
                </Text>

                {/* Action Buttons */}
                <View className="flex-row items-center mt-3 gap-3">
                  <TouchableOpacity
                    className="bg-emerald-600 px-4 py-2 rounded-lg flex-1"
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text className="text-white text-xs font-semibold text-center">
                      Add to Cart
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="px-3 py-2"
                    onPress={() => handleRemoveFavorite(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default Favorites;
