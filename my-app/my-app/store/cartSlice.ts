import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";



// product - price , name , quantity , image, category

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  image: string;
  category: string;
  price: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      AsyncStorage.setItem('cart' , JSON.stringify(state.items))

},

    loadCart: (state , action)=>{
        state.items = action.payload
    },

    clearCart: (state) => {
      state.items = [];
      AsyncStorage.setItem('cart', JSON.stringify([]));
    },

    // remove and update quantity


  },
});

export const { addToCart , loadCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
