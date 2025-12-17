import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "../global.css";
export default function MainLayout() {
  return (
    <Tabs screenOptions={{headerShown:false}}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="categories"
       options={{
        title: "Categories",
        tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
      }}
       />

      <Tabs.Screen name="cart"
       options={{
        title: "Cart",
        tabBarIcon: ({ color, size }) => <Ionicons name="cart" color={color} size={size} />,
      }} />

      <Tabs.Screen name="orders" 
       options={{
        title: "Orders",
        tabBarIcon: ({ color, size }) => <Ionicons name="receipt" color={color} size={size} />,
      }}/>

      <Tabs.Screen 
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />

      <Tabs.Screen name="profile"
       options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
      }} />
      
      <Tabs.Screen 
        name="checkout"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
