const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Log the current environment
console.log(`Running in ${process.env.NODE_ENV} mode`);

// Force set NODE_ENV to development for testing purposes if not already set
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = functions.config().env.mode || 'development';
}

console.log(`Running in ${process.env.NODE_ENV} mode`);

// Select the Stripe secret key based on the environment
const stripeSecret = process.env.NODE_ENV === 'development'
    ? functions.config().stripe.test_secret
    : functions.config().stripe.secret;

console.log(`Using Stripe key: ${stripeSecret}`);

const stripe = require('stripe')(stripeSecret);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { amount, success_url, cancel_url } = req.body;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Bike Purchase',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: success_url,
                cancel_url: cancel_url || "https://peakpedal.store/checkout.html",
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error('Error creating Stripe Checkout session', error);
            res.status(500).send({ error: 'Unable to create Stripe Checkout session' });
        }
    });
});
