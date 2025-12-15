import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { loadOrders } from '@/store/ordersSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const orders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: any) => state.orders.orders);

  useEffect(() => {
    // Load orders from AsyncStorage on mount
    loadOrdersFromStorage();
  }, []);

  const loadOrdersFromStorage = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        dispatch(loadOrders(parsedOrders));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = (item: any) => {
    const price = parseFloat(item.price.toString().replace('₹', '').replace(',', ''));
    return (
      <View className="flex-row items-center mb-2 py-2 border-b border-gray-100">
        <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
          <Text className="text-xl">{item.image}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-xs text-gray-500">{item.category}</Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-gray-600">Qty: {item.quantity}</Text>
          <Text className="text-base font-bold text-emerald-600">
            ₹{(price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderOrder = ({ item }: { item: any }) => {
    return (
      <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm">
        {/* Order Header */}
        <View className="flex-row justify-between items-start mb-3 pb-3 border-b border-gray-200">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">Order ID</Text>
            <Text className="text-xs font-mono text-gray-700">{item.id}</Text>
          </View>
          <View className="items-end">
            <View className={`px-3 py-1 rounded-full ${
              item.status === 'completed' ? 'bg-green-100' : 
              item.status === 'pending' ? 'bg-yellow-100' : 
              'bg-red-100'
            }`}>
              <Text className={`text-xs font-semibold ${
                item.status === 'completed' ? 'text-green-700' : 
                item.status === 'pending' ? 'text-yellow-700' : 
                'text-red-700'
              }`}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Items:</Text>
          {item.items.map((orderItem: any, index: number) => (
            <View key={index}>
              {renderOrderItem(orderItem)}
            </View>
          ))}
        </View>

        {/* Billing Details */}
        {item.billingDetails && (
          <View className="mb-3 pb-3 border-b border-gray-200">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Delivery Address:</Text>
            <Text className="text-sm text-gray-600">{item.billingDetails.name}</Text>
            <Text className="text-sm text-gray-600">
              {item.billingDetails.address.line1}
              {item.billingDetails.address.line2 && `, ${item.billingDetails.address.line2}`}
            </Text>
            <Text className="text-sm text-gray-600">
              {item.billingDetails.address.city}, {item.billingDetails.address.state} - {item.billingDetails.address.postal_code}
            </Text>
            <Text className="text-sm text-gray-600">{item.billingDetails.address.country}</Text>
            {item.billingDetails.phone && (
              <Text className="text-sm text-gray-600 mt-1">Phone: {item.billingDetails.phone}</Text>
            )}
            {item.billingDetails.email && (
              <Text className="text-sm text-gray-600">Email: {item.billingDetails.email}</Text>
            )}
          </View>
        )}

        {/* Payment Info */}
        {item.paymentIntentId && (
          <View className="mb-3 pb-3 border-b border-gray-200">
            <Text className="text-sm font-semibold text-gray-700 mb-1">Payment ID:</Text>
            <Text className="text-xs font-mono text-gray-600">{item.paymentIntentId}</Text>
          </View>
        )}

        {/* Order Total */}
        <View className="flex-row justify-between items-center pt-2">
          <Text className="text-lg font-bold text-gray-800">Total Amount:</Text>
          <Text className="text-xl font-bold text-emerald-600">
            ₹{item.totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-emerald-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">My Orders</Text>
          <Text className="text-white/80 text-sm">Your order history</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-6xl mb-4">📦</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</Text>
          <Text className="text-gray-500 text-center px-8">
            Your completed orders will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-emerald-600 px-4 py-4">
          <Text className="text-white text-2xl font-bold">My Orders</Text>
          <Text className="text-white/80 text-sm">{orders.length} order(s)</Text>
        </View>

        {/* Orders List */}
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default orders;
