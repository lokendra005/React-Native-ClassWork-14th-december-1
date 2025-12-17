import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../store/favoritesSlice';

interface FavoriteButtonProps {
  product: {
    id: number;
    name: string;
    image: string;
    category: string;
    price: string;
  };
  size?: number;
  showLabel?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  product, 
  size = 24,
  showLabel = false 
}) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: any) => state.favorites.items);
  const isFavorite = favorites.some((item: any) => item.id === product.id);

  const handleToggle = () => {
    dispatch(toggleFavorite(product));
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      className="flex-row items-center"
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? '#ef4444' : '#6b7280'}
      />
      {showLabel && (
        <Text className={`ml-1 text-sm ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}>
          {isFavorite ? 'Saved' : 'Save'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default FavoriteButton;
