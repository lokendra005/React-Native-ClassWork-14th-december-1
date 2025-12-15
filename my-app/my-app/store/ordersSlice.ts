import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
  category: string;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentIntentId?: string;
  billingDetails?: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    email?: string;
    phone?: string;
  };
}

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action) => {
      const newOrder: Order = {
        id: action.payload.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: action.payload.items,
        totalAmount: action.payload.totalAmount,
        date: action.payload.date || new Date().toISOString(),
        status: action.payload.status || 'completed',
        paymentIntentId: action.payload.paymentIntentId,
        billingDetails: action.payload.billingDetails,
      };
      state.orders.unshift(newOrder); // Add to beginning of array
      AsyncStorage.setItem('orders', JSON.stringify(state.orders));
    },
    loadOrders: (state, action) => {
      state.orders = action.payload;
    },
  },
});

export const { addOrder, loadOrders } = ordersSlice.actions;
export default ordersSlice.reducer;

