
# Push Notification Setup Guide

## ✅ What Has Been Implemented

### 1. **Dependencies**
   - ✅ Installed `expo-notifications` package

### 2. **Notification Utility** (`utils/notifications.ts`)
   - ✅ `requestNotificationPermissions()` - Requests notification permissions from user
   - ✅ `sendLocalNotification()` - Sends a local notification
   - ✅ `sendOrderConfirmationNotification()` - Sends order confirmation notification
   - ✅ `getExpoPushToken()` - Gets Expo push token for remote notifications (optional)

### 3. **Notification Setup Component** (`components/NotificationSetup.tsx`)
   - ✅ Automatically requests notification permissions on app start
   - ✅ Added to root layout

### 4. **Checkout Integration** (`app/(main)/checkout.tsx`)
   - ✅ Sends notification when order is successfully placed
   - ✅ Notification includes order ID and delivery message

### 5. **App Configuration** (`app.json`)
   - ✅ Added `expo-notifications` plugin
   - ✅ Configured notification settings (icon, color, etc.)

## 📱 How It Works

1. **On App Start**: `NotificationSetup` component requests notification permissions
2. **On Order Placement**: After successful payment and order creation:
   - Order is added to Redux store
   - Cart is cleared
   - **Push notification is sent** with message: "Your order has been placed. It will be delivered soon."
   - User is redirected to orders page

## 🔔 Notification Details

**Title**: "Order Placed Successfully! 🎉"

**Body**: "Your order has been placed. It will be delivered soon. Order ID: [first 8 chars]..."

**Features**:
- Shows even when app is in foreground
- Plays sound
- Sets badge count
- High priority on Android

## 🚀 Next Steps

### Step 1: Rebuild the App

Since we added a native module (`expo-notifications`), you need to rebuild the app:

```bash
# For development
npx expo prebuild
npx expo run:ios
# or
npx expo run:android

# Or if using EAS
eas build --profile development
```

### Step 2: Test Notifications

1. Run the app on a physical device or emulator
2. Place an order through checkout
3. You should see a notification appear immediately after payment succeeds

### Step 3: (Optional) Configure Remote Push Notifications

If you want to send push notifications from your backend server:

1. **Get Expo Project ID**:
   - Sign up at https://expo.dev
   - Create a project or use existing one
   - Get your project ID

2. **Update `utils/notifications.ts`**:
   - Replace `'your-project-id'` in `getExpoPushToken()` with your actual Expo project ID

3. **Update `app.json`**:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-project-id"
         }
       }
     }
   }
   ```

4. **Send Push Notifications from Backend**:
   - Use Expo Push Notification API
   - Store user's Expo push token in your database
   - Send notifications when order status changes

## 📝 Files Created/Modified

### Created:
- `utils/notifications.ts` - Notification utility functions
- `components/NotificationSetup.tsx` - Permission request component
- `NOTIFICATION_SETUP.md` - This documentation

### Modified:
- `package.json` - Added expo-notifications dependency
- `app/_layout.tsx` - Added NotificationSetup component
- `app/(main)/checkout.tsx` - Added notification trigger on order placement
- `app.json` - Added expo-notifications plugin configuration

## 🧪 Testing

### Test on iOS:
- Make sure you're testing on a physical device or simulator
- Grant notification permissions when prompted
- Place an order and verify notification appears

### Test on Android:
- Make sure you're testing on a physical device or emulator
- Grant notification permissions when prompted
- Place an order and verify notification appears
- Check notification channel settings in Android settings

## ⚠️ Important Notes

1. **Permissions**: Users must grant notification permissions for notifications to work
2. **Physical Device**: Push notifications work best on physical devices. Some features may not work on simulators/emulators
3. **Background Notifications**: For remote push notifications, you'll need to set up Expo Push Notification service
4. **Notification Sounds**: You can add custom notification sounds by placing audio files in `assets/sounds/` and referencing them in `app.json`

## 🔧 Troubleshooting

### Notifications not showing?
1. Check if permissions are granted in device settings
2. Make sure app is rebuilt after adding expo-notifications
3. Check console logs for any errors
4. On Android, verify notification channel is created

### Permission denied?
- User can manually enable in device settings
- App will request again on next launch

### Notification not appearing immediately?
- Check if app is in foreground (notifications should still show)
- Verify notification handler is configured correctly
- Check device notification settings
