# Stripe Integration Setup Instructions

## Step 1: Install Dependencies

### Frontend
```bash
cd my-app/my-app
npm install
# or
npx expo install @stripe/stripe-react-native
```

### Backend
```bash
cd my-app/my-app/server
npm install
# This will install the stripe package
```

## Step 2: Get Stripe API Keys

1. Go to https://stripe.com and create an account (or sign in)
2. Navigate to **Developers** → **API keys** in the Stripe Dashboard
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
   - ⚠️ **Important**: Never share your secret key publicly!

## Step 3: Configure Environment Variables

### Backend Configuration

Add to `server/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### Frontend Configuration

You have two options:

#### Option A: Environment Variable (Recommended for Production)
Create a `.env` file in the root of `my-app/my-app/`:
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Then update `app/_layout.tsx`:
```typescript
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';
```

#### Option B: Direct Configuration (Quick Setup for Development)
Update `app/_layout.tsx` and replace:
```typescript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';
```
with your actual publishable key.

## Step 4: Update Expo Configuration

Add the Stripe plugin to `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.yourapp.identifier"
        }
      ]
    ]
  }
}
```

**Note**: The merchant identifier is only needed for Apple Pay. You can skip it if not using Apple Pay.

## Step 5: Rebuild the App

Since we're adding a native module, you need to rebuild:

```bash
# For development
npx expo prebuild
npx expo run:ios
# or
npx expo run:android

# Or if using EAS
eas build --profile development
```

## Step 6: Test the Integration

1. Start your backend server:
   ```bash
   cd server
   npm start
   ```

2. Start your Expo app:
   ```bash
   cd ..
   npm start
   ```

3. Test with Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date (e.g., 12/25)
   - Use any 3-digit CVC (e.g., 123)
   - Use any postal code

## Troubleshooting

### "StripeProvider must be initialized"
- Make sure you've added the StripeProvider in `app/_layout.tsx`
- Verify your publishable key is correct

### "Payment intent creation failed"
- Check that your backend server is running
- Verify `STRIPE_SECRET_KEY` is set in `server/.env`
- Check backend logs for errors

### "Network request failed"
- Ensure your API_BASE_URL in `utils/api.js` is correct
- For physical devices, use your computer's IP address instead of `localhost`
- Check that CORS is properly configured on the backend

### Native module not found
- Run `npx expo prebuild` to generate native code
- Rebuild the app: `npx expo run:ios` or `npx expo run:android`

## Next Steps

1. **Create Order Model**: Implement order storage in your database
2. **Add Webhooks**: Set up Stripe webhooks for payment events
3. **Order History**: Display completed orders in the orders screen
4. **Error Handling**: Add more comprehensive error handling
5. **Receipt Generation**: Generate and email receipts to users

## Security Checklist

- ✅ Secret key only in backend `.env` file
- ✅ Publishable key in frontend (safe to expose)
- ✅ All payment confirmations verified on backend
- ✅ HTTPS in production
- ✅ Amount validation on backend
- ✅ User authentication required for payments

## Support

- Stripe Documentation: https://stripe.com/docs
- React Native SDK: https://stripe.dev/stripe-react-native/
- Stripe Dashboard: https://dashboard.stripe.com
