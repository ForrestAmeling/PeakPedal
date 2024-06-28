const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

console.log(`Running in simplified mode`);

const stripeSecret = functions.config().stripe.secret;

console.log(`Using Stripe key: ${stripeSecret}`);

const stripe = require('stripe')(stripeSecret);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { items, taxAmount, shippingDetails, success_url, cancel_url } = req.body;

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    ...items.map(item => ({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: item.name,
                                images: [item.image],
                                metadata: {
                                    size: item.size
                                }
                            },
                            unit_amount: item.price,
                        },
                        quantity: item.quantity,
                    })),
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Sales Tax',
                            },
                            unit_amount: taxAmount,
                        },
                        quantity: 1,
                    }
                ],
                mode: 'payment',
                shipping_address_collection: {
                    allowed_countries: ['US'],
                },
                shipping_options: [{
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'usd',
                        },
                        display_name: 'Free shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 10,
                            },
                        },
                    },
                }],
                success_url: success_url,
                cancel_url: cancel_url || "https://peakpedal.store/checkout.html",
                customer_email: shippingDetails.email,
                shipping: {
                    name: shippingDetails.name,
                    address: {
                        line1: shippingDetails.address.line1,
                        line2: shippingDetails.address.line2,
                        city: shippingDetails.address.city,
                        state: shippingDetails.address.state,
                        postal_code: shippingDetails.address.postal_code,
                        country: shippingDetails.address.country,
                    },
                },
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error('Error creating Stripe Checkout session', error);
            res.status(500).send({ error: 'Unable to create Stripe Checkout session' });
        }
    });
});
