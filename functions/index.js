const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Stripe } = require('stripe');

admin.initializeApp();

const stripe = Stripe(functions.config().stripe.secret);

exports.extFirestoreStripePaymentsCreateCheckoutSession = functions.https.onCall(async (data, context) => {
    const { price, success_url, cancel_url } = data;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: price,
            quantity: 1,
        }],
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
    });

    return { url: session.url };
});
