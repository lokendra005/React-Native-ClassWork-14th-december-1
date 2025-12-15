import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { authApi, saveToken } from '../../utils/api.js';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login(email.trim(), password);
      console.log('Login response:', response);
      
      if (response && response.success && response.data?.token) {
        await saveToken(response.data.token);
        console.log('Token saved successfully');
        
        Alert.alert('Success', 'Logged in successfully!', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(main)/home');
            }
          }
        ]);
      } else {
        const errorMsg = response?.message || 'Login failed. Please try again.';
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error("Error on Login:", error);
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-emerald-60"
    >
      {/* Decorative blobs */}
      <View className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-emerald-200/60" />
      <View className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-lime-200/50" />

      <View style={styles.content} className="flex-1 justify-center px-6">
        {/* Logo + tagline */}
        <View className="items-center mb-6">
          <View className="h-16 w-16 rounded-2xl bg-emerald-600 items-center justify-center shadow">
           
          </View>
          <Text style={styles.title} className="mt-4 text-3xl font-extrabold text-emerald-800">
            Login
          </Text>
          <Text style={styles.subtitle} className="text-base text-emerald-700/70 mt-1">
            Fresh groceries, delivered fast
          </Text>
        </View>

        {/* Card */}
        <View className="bg-white/90 rounded-3xl p-5 shadow-md border border-emerald-100">
          <Text className="text-lg font-semibold text-emerald-900 mb-4">
            Welcome back 👋
          </Text>

          <View style={styles.form} className="w-full">
            {error ? (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <Text className="text-red-700 text-sm">{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer} className="mb-4">
              <Text style={styles.label} className="text-emerald-800 mb-2 font-medium">
                Email
              </Text>
              <TextInput
                style={styles.input}
                className="bg-white border border-emerald-200 rounded-2xl px-4 py-4 text-emerald-900"
                placeholder="you@example.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer} className="mb-2">
              <Text style={styles.label} className="text-emerald-800 mb-2 font-medium">
                Password
              </Text>
              <TextInput
                style={styles.input}
                className="bg-white border border-emerald-200 rounded-2xl px-4 py-4 text-emerald-900"
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity className="self-end mt-1 mb-3">
              <Text className="text-emerald-700 font-semibold">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText} className="text-white text-lg font-semibold">
                  Continue
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-emerald-100" />
              <Text className="mx-3 text-emerald-700/70">or</Text>
              <View className="flex-1 h-[1px] bg-emerald-100" />
            </View>

            <TouchableOpacity className="rounded-2xl py-3 border border-emerald-200 bg-white items-center">
              <Text className="text-emerald-800 font-semibold">Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              className="mt-6 items-center"
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.linkText} className="text-emerald-700">
                Don't have an account? <Text style={styles.linkTextBold} className="text-emerald-700 font-extrabold">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safe delivery footer */}
        <View className="items-center mt-5">
          <Text className="text-emerald-700/70 text-xs">
            🚚 Contactless delivery • ⏱️ Under 30 min • 🥬 Farm fresh
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // (kept for compatibility; Tailwind via className does the heavy lifting)
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1E88E5', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16, color: '#333' },
  loginButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#666' },
  linkTextBold: { color: '#1E88E5', fontWeight: '600' },
});
