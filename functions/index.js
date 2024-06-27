const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

admin.initializeApp();

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    const { amount, success_url, cancel_url } = data;

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
            cancel_url: cancel_url,
        });

        return { url: session.url };
    } catch (error) {
        console.error('Error creating Stripe Checkout session', error);
        throw new functions.https.HttpsError('internal', 'Unable to create Stripe Checkout session');
    }
});
