const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to create a payment intent
app.post('/api/payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    // Create a payment intent using Stripe. For a real app, the amount would come from your product pricing.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 5000, // default amount in smallest currency unit (e.g. cents)
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Unable to create payment intent' });
  }
});

// API endpoint to fetch sample templates for the website builder
app.get('/api/templates', (req, res) => {
  // For demonstration purposes, return a few simple HTML templates. These could be replaced by a database or file system lookup.
  const templates = [
    {
      id: 'template1',
      name: 'Business Landing Page',
      html: `<section style="padding: 40px; text-align: center;">
                <h1>Welcome to Your Business</h1>
                <p>Describe your amazing business here.</p>
                <button style="padding: 10px 20px; font-size: 16px;">Learn More</button>
             </section>`
    },
    {
      id: 'template2',
      name: 'Portfolio Gallery',
      html: `<div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 20px;">
                <div style="flex: 1 1 200px; background: #f0f0f0; padding: 20px;">Project 1</div>
                <div style="flex: 1 1 200px; background: #f0f0f0; padding: 20px;">Project 2</div>
                <div style="flex: 1 1 200px; background: #f0f0f0; padding: 20px;">Project 3</div>
             </div>`
    },
    {
      id: 'template3',
      name: 'E-commerce Product',
      html: `<section style="padding: 40px;">
                <h2>Featured Product</h2>
                <img src="https://images.pexels.com/photos/5717089/pexels-photo-5717089.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" alt="Product" style="max-width: 100%; height: auto;">
                <p style="margin-top: 20px;">This is a description of the product. It's the best product ever!</p>
                <button style="padding: 10px 20px; font-size: 16px;">Buy Now</button>
             </section>`
    }
  ];
  res.json(templates);
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve the production build of the React app located in the `frontend` folder.
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});