import CartLoader from "@/components/CartLoader";
import OrdersLoader from "@/components/OrdersLoader";
import FavoritesLoader from "@/components/FavoritesLoader";
import NotificationSetup from "@/components/NotificationSetup";
import { store } from "../store/store";
import { Stack } from "expo-router";
import {Provider} from 'react-redux'
import { StripeProvider } from '@stripe/stripe-react-native';

// Replace with your Stripe publishable key
// Get it from: https://dashboard.stripe.com/test/apikeys
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51JKPQWSJULHQ0FL7VOkMrOMFh0AHMoCFit29EgNlVRSvFkDxSoIuY771mqGczvd6bdTHU1EkhJpojOflzoIFGmj300Uj4ALqXa';

export default function RootLayout() {

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <Provider store={store}>
          <CartLoader/>
          <OrdersLoader/>
          <FavoritesLoader/>
          <NotificationSetup/>
         <Stack screenOptions={{headerShown:false}} />
      </Provider>
    </StripeProvider>
  )

}
