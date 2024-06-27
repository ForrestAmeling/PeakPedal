const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);
const cors = require('cors')({ origin: true });

admin.initializeApp();

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
