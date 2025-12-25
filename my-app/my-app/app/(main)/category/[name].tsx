import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { productsApi } from "../../../utils/api.js";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/cartSlice";
import FavoriteButton from "../../../components/FavoriteButton";

const CategoryDetail = () => {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (name) {
      fetchProductsByCategory();
    }
  }, [name]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.getProducts(name as string);
      if (response.success) {
        setProducts(response.data);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-emerald-600 px-4 pt-2 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 bg-white/20 p-2 rounded-full"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">{name}</Text>
            <Text className="text-white/80 text-sm">
              {products.length} products found
            </Text>
          </View>
        </View>
      </View>

      {/* Products */}
      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-500 mt-2">Loading products...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-500 text-center">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-emerald-600 px-6 py-3 rounded-lg"
              onPress={fetchProductsByCategory}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : products.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">📦</Text>
            <Text className="text-gray-500 text-lg text-center">
              No products in {name}
            </Text>
            <TouchableOpacity
              className="mt-4 bg-emerald-600 px-6 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item: any) => item._id}
            renderItem={({ item }: { item: any }) => (
              <View
                className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100"
                style={{ width: "48%" }}
              >
                <View className="w-full h-24 bg-gray-50 rounded-lg items-center justify-center mb-2 relative">
                  <Text className="text-5xl">{item.image}</Text>
                  {/* Favorite Button */}
                  <View className="absolute top-1 right-1">
                    <FavoriteButton
                      product={{
                        id: item._id,
                        name: item.name,
                        image: item.image,
                        category: item.category,
                        price: `₹${item.price}`,
                      }}
                      size={20}
                    />
                  </View>
                </View>

                <Text
                  className="text-sm font-semibold text-gray-800"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500">{item.category}</Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-lg font-bold text-emerald-600">
                    ₹{item.price}
                  </Text>
                  <TouchableOpacity
                    className="bg-emerald-600 px-3 py-1 rounded-lg"
                    onPress={() => {
                      dispatch(
                        addToCart({
                          id: item._id,
                          name: item.name,
                          image: item.image,
                          category: item.category,
                          price: `₹${item.price}`,
                        })
                      );
                    }}
                  >
                    <Text className="text-white text-xs font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default CategoryDetail;

const styles = StyleSheet.create({});

