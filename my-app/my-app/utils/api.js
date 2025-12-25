import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL for your API - change this to your server URL
// IMPORTANT: For React Native on physical devices, use your computer's IP address instead of localhost
// Example: 'http://192.168.1.100:3000/api' (replace with your actual IP)
// For iOS Simulator/Android Emulator, you can use 'http://localhost:3000/api'
// To find your IP: On Mac/Linux run 'ifconfig', on Windows run 'ipconfig'
const API_BASE_URL = "http://localhost:3000";

// API Calls for Login Signup and getCurrentUser

// Helper functions for Tokens

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error("Token cannot be retrieved:", error);
    return null;
  }
};

export const saveToken = async(token) => {
  try {
      await AsyncStorage.setItem('authToken', token)
      return token
  } catch (error) {
    console.error("Token cannot be Saved")
    return null
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    return true;
  } catch (error) {
    console.error("Token cannot be removed:", error);
    return false;
  }
};




const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  requiresAuth = false
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
    };

    // Add JWT token to headers if authentication is required
    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        throw new Error("No authentication token found. Please login again.");
      }
    }

    const config = {
      method,
      headers,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data;
    
    try {
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // If not JSON, get text response (likely HTML error page)
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 200));
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}. Please check if the server is running at ${url}`);
        }
        throw new Error("Server returned non-JSON response. Please check the API endpoint.");
      }
    } catch (parseError) {
      // If JSON parsing fails, it might be HTML or other content
      if (parseError instanceof SyntaxError && parseError.message.includes("JSON")) {
        throw new Error(`Server returned invalid JSON. Please check if the server is running at ${url}. The server might be returning an HTML error page.`);
      }
      throw parseError;
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    // Handle JSON parse errors specifically
    if (error && error.message && error.message.includes("JSON")) {
      throw new Error("Server returned invalid response. Please check if the server is running and the endpoint is correct.");
    }
    // Otherwise, wrap it in an Error
    throw new Error(error.message || "Network error occurred");
  }
};

// login and Sign up
export const authApi = {
  // signup
  signup: async (name, email, password) => {
    return apiRequest("/api/auth/signup", "POST", { name, email, password });
  },

  login: async (email, password) => {
    return apiRequest("/api/auth/login", "POST", { email, password });
  },

  // Get current user (verify token)
  getCurrentUser: async () => {
    return apiRequest("/api/auth/me", "GET", null, true);
  },

  // Logout
  logout: async () => {
    await removeToken();
    return { success: true, message: "Logged out successfully" };
  },
};

// Products API
export const productsApi = {
  // Get all products (optional filter by category or search query)
  getProducts: async (category = null, q = null) => {
    let endpoint = '/api/products';
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;
    return apiRequest(endpoint, 'GET');
  },

  // Get single product by ID
  getProduct: async (id) => {
    return apiRequest(`/api/products/${id}`, 'GET');
  },

  // Create a product
  createProduct: async (productData) => {
    return apiRequest('/api/products', 'POST', productData);
  },
};

// Payment API
export const paymentApi = {
  // Create payment intent
  // description is optional - backend will auto-generate from orderItems if not provided
  // billingDetails is required for Indian compliance: { name, address: { line1, city, state, postal_code, country, line2? }, email?, phone? }
  createPaymentIntent: async (amount, currency = 'inr', metadata = {}, description = null, billingDetails = null) => {
    return apiRequest(
      '/api/payment/create-intent',
      'POST',
      { 
        amount, 
        currency, 
        metadata, 
        ...(description && { description }),
        ...(billingDetails && { billingDetails })
      },
      true // requiresAuth
    );
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, orderData = {}) => {
    return apiRequest(
      '/api/payment/confirm',
      'POST',
      { paymentIntentId, orderData },
      true // requiresAuth
    );
  },

  // Get payment intent status
  getPaymentIntent: async (paymentIntentId) => {
    return apiRequest(
      `/api/payment/intent/${paymentIntentId}`,
      'GET',
      null,
      true // requiresAuth
    );
  },
};
