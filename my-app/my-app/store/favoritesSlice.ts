import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

// Product interface matching the cart item structure
export interface FavoriteItem {
  id: number;
  name: string;
  image: string;
  category: string;
  price: string;
}

interface FavoritesState {
  items: FavoriteItem[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (!existingItem) {
        state.items.push(action.payload);
        AsyncStorage.setItem('favorites', JSON.stringify(state.items));
      }
    },

    removeFromFavorites: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      AsyncStorage.setItem('favorites', JSON.stringify(state.items));
    },

    loadFavorites: (state, action) => {
      state.items = action.payload;
    },

    clearFavorites: (state) => {
      state.items = [];
      AsyncStorage.setItem('favorites', JSON.stringify([]));
    },

    toggleFavorite: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        // Remove from favorites
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        // Add to favorites
        state.items.push(action.payload);
      }
      AsyncStorage.setItem('favorites', JSON.stringify(state.items));
    },
  },
});

export const { 
  addToFavorites, 
  removeFromFavorites, 
  loadFavorites, 
  clearFavorites,
  toggleFavorite 
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
