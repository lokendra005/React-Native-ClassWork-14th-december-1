import {configureStore} from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import ordersReducer from './ordersSlice'
import favoritesReducer from './favoritesSlice'

export const store = configureStore({
    reducer:{
       cart : cartReducer,
       orders: ordersReducer,
       favorites: favoritesReducer
    }
})

