require('dotenv').config();
const strip = require('stripe')(process.env.STRIPE_SECRET_KEY);

const functions = require('firebase-functions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const cors = require('cors')({ origin: true });

exports.createPaymentIntent = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: req.body.amount,
                currency: 'usd',
            });

            res.status(200).send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            res.status(500).send({
                error: error.message,
            });
        }
    });
});
