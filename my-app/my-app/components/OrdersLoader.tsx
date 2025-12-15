import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadOrders } from "../store/ordersSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrdersLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadOrdersFromStorage = async () => {
      try {
        const savedOrders = await AsyncStorage.getItem("orders");
        if (savedOrders) {
          dispatch(loadOrders(JSON.parse(savedOrders)));
        }
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };
    loadOrdersFromStorage();
  }, []);

  return null;
}

