import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.middleware.js';


const router = express.Router();

// Initialize Stripe with secret key from environment
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY is not set in environment variables!');
  console.error('Please add STRIPE_SECRET_KEY to your server/.env file');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payment/create-intent
 * Creates a payment intent for the order
 * Requires authentication
 */
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'inr', 
      metadata = {}, 
      description,
      billingDetails 
    } = req.body;

    // Debug: Log received billing details (remove in production)
    console.log('Received billing details:', JSON.stringify(billingDetails, null, 2));

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be greater than 0.',
      });
    }

    // Validate billing details for Indian compliance
    // Stripe requires name and address for Indian payment processing
    if (!billingDetails) {
      return res.status(400).json({
        success: false,
        message: 'Billing details are required for Indian payment compliance.',
      });
    }

    if (!billingDetails.name || !billingDetails.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Billing name is required for Indian payment compliance.',
      });
    }

    if (!billingDetails.address) {
      return res.status(400).json({
        success: false,
        message: 'Billing address is required for Indian payment compliance.',
      });
    }

    // Validate required address fields for India (check for empty strings too)
    const requiredAddressFields = ['line1', 'city', 'state', 'postal_code', 'country'];
    const missingFields = requiredAddressFields.filter(
      field => !billingDetails.address[field] || !String(billingDetails.address[field]).trim()
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or empty required address fields: ${missingFields.join(', ')}`,
        receivedFields: Object.keys(billingDetails.address),
      });
    }

    // Convert amount to smallest currency unit (paise for INR)
    // Stripe expects amounts in smallest currency unit
    const amountInSmallestUnit = Math.round(amount * 100);

    // Generate description for Indian regulations compliance
    // Stripe requires a description field for Indian payment processing (RBI compliance)
    // If description is provided, use it; otherwise generate from metadata
    let paymentDescription = description;
    if (!paymentDescription) {
      // Try to generate description from order items in metadata
      if (metadata.orderItems) {
        try {
          const orderItems = JSON.parse(metadata.orderItems);
          if (Array.isArray(orderItems) && orderItems.length > 0) {
            const itemNames = orderItems
              .slice(0, 3)
              .map((item) => item.name || 'Item')
              .join(', ');
            const itemCount = orderItems.length;
            paymentDescription = itemCount > 3
              ? `Order: ${itemNames} and ${itemCount - 3} more item(s)`
              : `Order: ${itemNames}`;
          }
        } catch (e) {
          // If parsing fails, use default
        }
      }
      // Fallback to default description
      if (!paymentDescription) {
        paymentDescription = `Payment for order - ₹${amount.toFixed(2)}`;
      }
    }

    // Prepare billing details for Indian compliance
    // Stripe requires billing details (name and address) for Indian payment processing
    // These will be passed to the payment sheet on the frontend
    const billingInfo = {
      name: billingDetails.name,
      address: {
        line1: billingDetails.address.line1,
        line2: billingDetails.address.line2 || '',
        city: billingDetails.address.city,
        state: billingDetails.address.state,
        postal_code: billingDetails.address.postal_code,
        country: billingDetails.address.country || 'IN', // Default to India
      },
      email: billingDetails.email || req.user.email,
      phone: billingDetails.phone || '',
    };

    // Create payment intent with description (required for Indian regulations)
    // Billing details will be passed to payment sheet on frontend
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      description: paymentDescription, // Required for Indian Stripe compliance
      metadata: {
        userId: req.user.id || req.user._id,
        userName: billingDetails.name,
        userAddress: `${billingDetails.address.line1}, ${billingDetails.address.city}, ${billingDetails.address.state} ${billingDetails.address.postal_code}`,
        ...metadata,
      },
      // Optional: Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return billing details along with client secret so frontend can use them
    // This ensures Indian compliance requirements are met

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      billingDetails: billingInfo, // Return billing details for payment sheet initialization
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
});

/**
 * POST /api/payment/confirm
 * Confirms a payment and creates order record
 * Requires authentication
 */
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, orderData } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required',
      });
    }

    // Retrieve payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
        status: paymentIntent.status,
      });
    }

    // TODO: Create order record in database here
    // Example:
    // const order = await Order.create({
    //   userId: req.user.id,
    //   paymentIntentId: paymentIntent.id,
    //   amount: paymentIntent.amount / 100,
    //   currency: paymentIntent.currency,
    //   status: 'completed',
    //   items: orderData.items,
    //   ...orderData,
    // });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      // orderId: order._id, // Uncomment when order model is created
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
});

/**
 * GET /api/payment/intent/:id
 * Retrieves payment intent status
 * Requires authentication
 */
router.get('/intent/:id',protect, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
    });
  }
});

export default router;
