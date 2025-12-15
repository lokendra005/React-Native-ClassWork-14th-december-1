import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // Added to match NotificationBehavior type
    shouldShowList: true,   // Added to match NotificationBehavior type
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

/**
 * Request notification permissions from the user
 * @returns true if permissions are granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // For Android, we need to set the notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Send a local notification
 * @param notification - Notification data with title, body, and optional data
 */
export async function sendLocalNotification(notification: NotificationData): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      console.warn('Cannot send notification: permissions not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // null means show immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Send an order confirmation notification
 * @param orderId - The order ID
 * @param totalAmount - The total amount of the order
 */
export async function sendOrderConfirmationNotification(
  orderId: string,
  totalAmount: number
): Promise<void> {
  await sendLocalNotification({
    title: 'Order Placed Successfully! 🎉',
    body: `Your order has been placed. It will be delivered soon. Order ID: ${orderId.substring(0, 8)}...`,
    data: {
      type: 'order_confirmation',
      orderId,
      totalAmount,
    },
  });
}

/**
 * Get the Expo push token (for remote notifications)
 * @returns The push token or null if unavailable
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // You'll need to set this in app.json
    });

    return token.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

