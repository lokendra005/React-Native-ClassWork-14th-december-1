import {configureStore} from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import ordersReducer from './ordersSlice'

export const store = configureStore({
    reducer:{
       cart : cartReducer,
       orders: ordersReducer
    }
})

