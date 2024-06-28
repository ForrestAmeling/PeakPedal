const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Log the current environment
console.log(`Running in simplified mode`);

// Select the Stripe secret key from the Firebase configuration
const stripeSecret = functions.config().stripe.secret;

console.log(`Using Stripe key: ${stripeSecret}`);

const stripe = require('stripe')(stripeSecret);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { amount, items, success_url, cancel_url } = req.body;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: items.map(item => ({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name,
                            description: `Size: ${item.size}`,
                            images: [item.image],
                        },
                        unit_amount: item.price,
                    },
                    quantity: item.quantity,
                })),
                mode: 'payment',
                success_url: success_url,
                cancel_url: cancel_url || "https://peakpedal.store/checkout.html",
                amount_total: amount,
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error('Error creating Stripe Checkout session', error);
            res.status(500).send({ error: 'Unable to create Stripe Checkout session' });
        }
    });
});
