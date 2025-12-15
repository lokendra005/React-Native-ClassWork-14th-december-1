# Stripe Payment Gateway Integration Guide

## Overview
This guide explains how to integrate Stripe payment gateway into your React Native Expo app.

## What You'll Need

### 1. Stripe Account
- Sign up at https://stripe.com
- Get your **Publishable Key** (starts with `pk_`) for frontend
- Get your **Secret Key** (starts with `sk_`) for backend
- Use test keys during development, live keys for production

### 2. Required Packages

#### Frontend (React Native)
- `@stripe/stripe-react-native` - Official Stripe React Native SDK
- Already have: `expo` (for native modules)

#### Backend (Node.js/Express)
- `stripe` - Official Stripe Node.js SDK

### 3. Architecture Overview

```
┌─────────────────┐
│  React Native   │
│     App         │
│                 │
│  1. User clicks │
│     "Checkout"  │
└────────┬────────┘
         │
         │ 2. Request Payment Intent
         ▼
┌─────────────────┐
│  Express Server │
│                 │
│  3. Create      │
│     Payment     │
│     Intent      │
└────────┬────────┘
         │
         │ 4. Return client_secret
         ▼
┌─────────────────┐
│  React Native   │
│     App         │
│                 │
│  5. Collect     │
│     Payment     │
│     (Card)      │
└────────┬────────┘
         │
         │ 6. Confirm Payment
         ▼
┌─────────────────┐
│  Express Server │
│                 │
│  7. Verify &    │
│     Complete    │
│     Order       │
└─────────────────┘
```

## Implementation Steps

### Step 1: Install Dependencies

#### Frontend
```bash
cd my-app/my-app
npx expo install @stripe/stripe-react-native
```

#### Backend
```bash
cd my-app/my-app/server
npm install stripe
```

### Step 2: Configure Stripe Keys

#### Backend (.env file)
Add to `server/.env`:
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

#### Frontend
We'll use environment variables or a config file for the publishable key.

### Step 3: Backend Implementation

1. **Create Payment Intent Route** - Creates a payment intent with the order amount
2. **Confirm Payment Route** - Confirms the payment and creates order record
3. **Webhook Handler** (Optional) - For handling payment events asynchronously

### Step 4: Frontend Implementation

1. **Initialize Stripe** - Set up Stripe provider in app root
2. **Payment Screen** - Create checkout screen with card input
3. **Integrate with Cart** - Connect "Proceed to Checkout" button to payment flow

## Security Best Practices

1. **Never expose secret keys** - Only use publishable key in frontend
2. **Always verify on backend** - Never trust frontend payment confirmations
3. **Use HTTPS** - Required for production
4. **Validate amounts** - Always verify payment amounts on backend
5. **Handle errors** - Implement proper error handling for failed payments

## Testing

### Test Cards (Stripe Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Next Steps

After implementation:
1. Test with Stripe test cards
2. Set up webhooks for production
3. Add order history tracking
4. Implement payment method saving (optional)
5. Add receipt generation
