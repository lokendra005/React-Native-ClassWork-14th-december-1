import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe, PaymentSheet } from '@stripe/stripe-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { paymentApi, authApi } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCart } from '@/store/cartSlice';
import { addOrder } from '@/store/ordersSlice';
import { sendOrderConfirmationNotification } from '@/utils/notifications';

const Checkout = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.cart.items);
  const [loading, setLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  // Billing details state (required for Indian compliance)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'IN',
    },
    email: '',
    phone: '',
  });

  const calculateTotal = () => {
    return cartItems.reduce((total: any, item: any) => {
      const price = parseFloat(item.price.replace('₹', '').replace(',', ''));
      return total + price * item.quantity;
    }, 0);
  };

  const totalAmount = calculateTotal();

  // Load user info and saved address on mount
  useEffect(() => {
    loadUserInfo();
    loadSavedAddress();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userResponse = await authApi.getCurrentUser();
      if (userResponse.success && userResponse.data?.user) {
        setBillingDetails(prev => ({
          ...prev,
          name: userResponse.data.user.name || '',
          email: userResponse.data.user.email || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadSavedAddress = async () => {
    try {
      const saved = await AsyncStorage.getItem('userLocation');
      if (saved) {
        const location = JSON.parse(saved);
        if (location.address) {
          // Try to parse address components
          const addressParts = location.address.split(',');
          setBillingDetails(prev => ({
            ...prev,
            address: {
              ...prev.address,
              line1: addressParts[0]?.trim() || '',
              city: addressParts[1]?.trim() || '',
              state: addressParts[2]?.trim() || '',
            },
          }));
        }
      }
    } catch (error) {
      console.error('Error loading saved address:', error);
    }
  };

  const validateBillingDetails = () => {
    if (!billingDetails.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }
    if (!billingDetails.address.line1.trim()) {
      Alert.alert('Validation Error', 'Please enter your address line 1');
      return false;
    }
    if (!billingDetails.address.city.trim()) {
      Alert.alert('Validation Error', 'Please enter your city');
      return false;
    }
    if (!billingDetails.address.state.trim()) {
      Alert.alert('Validation Error', 'Please enter your state');
      return false;
    }
    if (!billingDetails.address.postal_code.trim()) {
      Alert.alert('Validation Error', 'Please enter your postal code');
      return false;
    }
    return true;
  };

  const initializePaymentSheet = async () => {
    try {
      // Validate billing details first
      if (!validateBillingDetails()) {
        return;
      }

      setLoading(true);

      // Ensure country is set (required for Indian compliance)
      const billingDataToSend = {
        ...billingDetails,
        address: {
          ...billingDetails.address,
          country: billingDetails.address.country || 'IN', // Ensure country is set
        },
      };

      // Debug: Log billing details being sent (remove in production)
      console.log('Sending billing details to backend:', JSON.stringify(billingDataToSend, null, 2));

      // Create payment intent on backend with billing details (required for Indian compliance)
      // @ts-ignore - billingDetails type is correctly handled in JS API
      const response = await paymentApi.createPaymentIntent(
        totalAmount,
        'inr',
        {
          orderItems: JSON.stringify(cartItems),
          itemCount: cartItems.length.toString(),
        },
        null, // description (auto-generated)
        billingDataToSend as any // billing details for Indian compliance
      );

      if (!response.success || !response.clientSecret) {
        throw new Error(response.message || 'Failed to create payment intent');
      }

      // Store payment intent ID for confirmation later
      if (response.paymentIntentId) {
        setPaymentIntentId(response.paymentIntentId);
      }

      // Prepare billing details for payment sheet (ensure all required fields are present)
      const paymentSheetBillingDetails = {
        name: billingDataToSend.name.trim(),
        email: billingDataToSend.email?.trim() || '',
        phone: billingDataToSend.phone?.trim() || '',
        address: {
          line1: billingDataToSend.address.line1.trim(),
          line2: billingDataToSend.address.line2?.trim() || '',
          city: billingDataToSend.address.city.trim(),
          state: billingDataToSend.address.state.trim(),
          postalCode: billingDataToSend.address.postal_code.trim(),
          country: billingDataToSend.address.country || 'IN',
        },
      };

      // Debug: Log billing details being sent to payment sheet
      console.log('Initializing payment sheet with billing details:', JSON.stringify(paymentSheetBillingDetails, null, 2));

      // Initialize payment sheet with billing details (required for Indian compliance)
      // CRITICAL: billingDetailsCollectionConfiguration makes fields REQUIRED
      // Without this, Stripe will reject payments for Indian compliance
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'My App',
        paymentIntentClientSecret: response.clientSecret,
        // REQUIRED: Make billing details mandatory for Indian compliance
        // This ensures Stripe collects and validates billing details before payment
        // @ts-ignore - Type definitions may vary, but these are valid values for Indian compliance
        billingDetailsCollectionConfiguration: {
          name: 'always' as any,    // Name is mandatory for Indian regulations
          email: 'never' as any,   // Email is optional (we already have it)
          phone: 'never' as any,    // Phone is optional
          address: 'full' as any,   // Full address is MANDATORY for Indian regulations
        },
        // Pre-fill with collected billing details (improves UX)
        defaultBillingDetails: paymentSheetBillingDetails,
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        throw new Error(initError.message);
      }

      setPaymentSheetReady(true);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to initialize payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentSheetReady || !paymentIntentId) {
      // Re-initialize payment sheet if not ready or paymentIntentId is missing
      await initializePaymentSheet();
      if (!paymentSheetReady || !paymentIntentId) {
        Alert.alert('Payment Not Ready', 'Please wait for payment to initialize');
        return;
      }
    }

    try {
      setLoading(true);

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or error occurred
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Error', presentError.message);
        }
        return;
      }

      // Payment succeeded - confirm on backend
      if (paymentIntentId) {
        try {
          // Confirm payment on backend
          const confirmResponse = await paymentApi.confirmPayment(paymentIntentId, {
            items: cartItems,
            totalAmount: totalAmount,
            billingDetails: billingDetails,
          });

          if (confirmResponse.success) {
            // Generate order ID
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create order object
            const orderData = {
              id: orderId,
              items: cartItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                image: item.image,
                category: item.category,
                price: item.price,
              })),
              totalAmount: totalAmount,
              paymentIntentId: paymentIntentId,
              billingDetails: billingDetails,
              status: 'completed' as const,
            };

            // Add order to orders slice
            dispatch(addOrder(orderData));

            // Clear cart
            dispatch(clearCart());

            // Send order confirmation notification
            await sendOrderConfirmationNotification(orderId, totalAmount);

            Alert.alert(
              'Payment Successful!',
              'Your order has been placed successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/(main)/orders');
                  },
                },
              ]
            );
          } else {
            throw new Error(confirmResponse.message || 'Failed to confirm payment');
          }
        } catch (confirmError: any) {
          console.error('Payment confirmation error:', confirmError);
          Alert.alert(
            'Payment Confirmation Error',
            'Payment was successful but there was an error confirming it. Please contact support.'
          );
        }
      } else {
        // Fallback: If paymentIntentId is not available, still create order
        // Generate order ID
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const orderData = {
          id: orderId,
          items: cartItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
            price: item.price,
          })),
          totalAmount: totalAmount,
          billingDetails: billingDetails,
          status: 'completed' as const,
        };

        dispatch(addOrder(orderData));
        dispatch(clearCart());

        // Send order confirmation notification
        await sendOrderConfirmationNotification(orderId, totalAmount);

        Alert.alert(
          'Payment Successful!',
          'Your order has been placed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(main)/orders');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Payment Error', error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-emerald-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">Checkout</Text>
          <Text className="text-white/80 text-sm">Complete your payment</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Billing Details Form (Required for Indian Compliance) */}
          <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-3">Billing Details</Text>
            <Text className="text-xs text-gray-500 mb-3">Required for Indian payment compliance</Text>
            
            {/* Name */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Full Name *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="Enter your full name"
                value={billingDetails.name}
                onChangeText={(text) => setBillingDetails(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Email */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="Enter your email"
                value={billingDetails.email}
                onChangeText={(text) => setBillingDetails(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Phone</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="Enter your phone number"
                value={billingDetails.phone}
                onChangeText={(text) => setBillingDetails(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Line 1 */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Address Line 1 *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="Street address, building, house no."
                value={billingDetails.address.line1}
                onChangeText={(text) => setBillingDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, line1: text }
                }))}
              />
            </View>

            {/* Address Line 2 */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Address Line 2</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="Apartment, suite, etc. (optional)"
                value={billingDetails.address.line2}
                onChangeText={(text) => setBillingDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, line2: text }
                }))}
              />
            </View>

            {/* City, State, Postal Code Row */}
            <View className="flex-row mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-sm font-semibold text-gray-700 mb-1">City *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                  placeholder="City"
                  value={billingDetails.address.city}
                  onChangeText={(text) => setBillingDetails(prev => ({
                    ...prev,
                    address: { ...prev.address, city: text }
                  }))}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm font-semibold text-gray-700 mb-1">State *</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                  placeholder="State"
                  value={billingDetails.address.state}
                  onChangeText={(text) => setBillingDetails(prev => ({
                    ...prev,
                    address: { ...prev.address, state: text }
                  }))}
                />
              </View>
            </View>

            {/* Postal Code */}
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Postal Code *</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="PIN code"
                value={billingDetails.address.postal_code}
                onChangeText={(text) => setBillingDetails(prev => ({
                  ...prev,
                  address: { ...prev.address, postal_code: text }
                }))}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          {/* Order Summary */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Order Summary</Text>
            {cartItems.map((item: any) => {
              const price = parseFloat(item.price.replace('₹', '').replace(',', ''));
              return (
                <View key={item.id} className="flex-row justify-between mb-2">
                  <Text className="text-gray-700 flex-1">
                    {item.name} x {item.quantity}
                  </Text>
                  <Text className="text-gray-800 font-semibold">
                    ₹{(price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })}
            <View className="border-t border-gray-300 mt-3 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total:</Text>
                <Text className="text-xl font-bold text-emerald-600">
                  ₹{totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Info */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-sm text-blue-800">
              💳 Secure payment powered by Stripe
            </Text>
            <Text className="text-xs text-blue-600 mt-2">
              Your payment information is encrypted and secure
            </Text>
          </View>

          {/* Test Card Info (Development Only) */}
          {__DEV__ && (
            <View className="bg-yellow-50 rounded-xl p-4 mb-4">
              <Text className="text-sm font-semibold text-yellow-800 mb-2">
                Test Mode - Use Test Cards:
              </Text>
              <Text className="text-xs text-yellow-700">
                • Success: 4242 4242 4242 4242{'\n'}
                • Decline: 4000 0000 0000 0002{'\n'}
                • Use any future expiry, any CVC
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Payment Button */}
        <View className="bg-white border-t border-gray-200 px-4 py-4">
          <TouchableOpacity
            className={`bg-emerald-600 rounded-xl py-4 items-center ${
              loading ? 'opacity-50' : ''
            }`}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {paymentSheetReady ? `Pay ₹${totalAmount.toFixed(2)}` : 'Initialize Payment'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;
