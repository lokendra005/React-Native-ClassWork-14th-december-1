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
import { useRouter } from "expo-router";
import { productsApi } from "../../utils/api.js";

// Categories data
const categories = [
  { id: 1, name: "Fruits", icon: "🍎", color: "bg-red-100" },
  { id: 2, name: "Vegetables", icon: "🥬", color: "bg-green-100" },
  { id: 3, name: "Dairy", icon: "🥛", color: "bg-blue-100" },
  { id: 4, name: "Electronics", icon: "📱", color: "bg-purple-100" },
  { id: 5, name: "Clothes", icon: "👕", color: "bg-pink-100" },
  { id: 6, name: "Snacks", icon: "🍿", color: "bg-yellow-100" },
];

// Category Card Component
const CategoryCard = ({
  category,
  productCount,
  onPress,
}: {
  category: { id: number; name: string; icon: string; color: string };
  productCount: number;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${category.color} rounded-xl p-4 mb-4 shadow-sm`}
      style={{ width: "48%" }}
      activeOpacity={0.7}
    >
      <Text className="text-4xl mb-2">{category.icon}</Text>
      <Text className="text-lg font-bold text-gray-800">{category.name}</Text>
      <Text className="text-sm text-gray-600">{productCount} products</Text>
    </TouchableOpacity>
  );
};

const Categories = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.getProducts();
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

  // Calculate product count for each category
  const getProductCount = (categoryName: string) => {
    return products.filter((p: any) => p.category === categoryName).length;
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push(`/category/${categoryName}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-emerald-600 px-4 pt-2 pb-4">
        <Text className="text-white text-2xl font-bold">Browse Categories</Text>
        <Text className="text-white/80 text-sm mt-1">
          Find products by category
        </Text>
      </View>

      {/* Categories Grid */}
      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
            <Text className="text-gray-500 mt-2">Loading categories...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-500 text-center">{error}</Text>
            <TouchableOpacity
              className="mt-4 bg-emerald-600 px-6 py-3 rounded-lg"
              onPress={fetchProducts}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">📦</Text>
            <Text className="text-gray-500 text-lg">No categories available</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                productCount={getProductCount(item.name)}
                onPress={() => handleCategoryPress(item.name)}
              />
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

export default Categories;

const styles = StyleSheet.create({});
