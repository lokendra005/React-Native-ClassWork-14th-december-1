import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import {useRouter} from 'expo-router'
import { getToken, authApi } from '../utils/api.js'

const index = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = await getToken()
      
      if (token) {
        // Verify token by getting current user
        try {
          const response = await authApi.getCurrentUser()
          if (response && response.success) {
            // Token is valid, redirect to home
            router.replace('/(main)/home')
            return
          }
        } catch (error) {
          // Token is invalid, clear it and show login screen
          console.log('Token verification failed:', error)
        }
      }
      // No token or invalid token, stay on login screen
      setLoading(false)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
       <View style={styles.content}>
           <Text style={styles.title}>Welcome</Text>
           <Text style={styles.subtitle}>Login or Singup to FarmFresh</Text>

           <TouchableOpacity style={[styles.button , styles.loginButton]} onPress={()=>router.push('/(auth)/login')} >
              <Text style={styles.buttonText} >Login</Text>
           </TouchableOpacity>


           <TouchableOpacity style={[styles.button , styles.signupButton]} onPress={()=>router.push('/(auth)/signup')}>
              <Text style={styles.signupButtonText} >Sign Up</Text>
           </TouchableOpacity>

       </View>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1E88E5",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: "#1E88E5",
  },
  signupButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#1E88E5",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  signupButtonText: {
    color: "#1E88E5",
  },
});