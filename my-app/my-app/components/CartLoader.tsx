
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadCart } from "../store/cartSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CartLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadCartFromStorage = async () => {
      try {
        const savedCart = await AsyncStorage.getItem("cart");
        if (savedCart) {
          dispatch(loadCart(JSON.parse(savedCart)));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };
    loadCartFromStorage();
  }, []);

  return null;
}
