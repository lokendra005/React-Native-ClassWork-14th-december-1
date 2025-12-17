import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadFavorites } from "../store/favoritesSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FavoritesLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadFavoritesFromStorage = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem("favorites");
        if (savedFavorites) {
          dispatch(loadFavorites(JSON.parse(savedFavorites)));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    loadFavoritesFromStorage();
  }, []);

  return null;
}
