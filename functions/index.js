const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const stripeSecret = functions.config().stripe.secret;
const stripe = require('stripe')(stripeSecret);

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { items, taxAmount, shippingDetails, success_url, cancel_url, orderNumber } = req.body;

        try {
            // Create a Stripe customer
            const customer = await stripe.customers.create({
                email: shippingDetails.email,
                name: shippingDetails.name,
                phone: shippingDetails.phone,
                address: {
                    line1: shippingDetails.address.line1,
                    line2: shippingDetails.address.line2,
                    city: shippingDetails.address.city,
                    state: shippingDetails.address.state,
                    postal_code: shippingDetails.address.postal_code,
                    country: shippingDetails.address.country,
                },
            });

            // Generate metadata for items
            const itemMetadata = items.map(item => `Bike: ${item.name}, Size: ${item.size}`).join('; ');

            // Create a checkout session
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
                payment_intent_data: {
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
                        phone: shippingDetails.phone,
                    },
                    metadata: {
                        order_number: orderNumber,
                        items: itemMetadata, // Add items metadata here
                    },
                },
                customer: customer.id,
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
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error('Error creating Stripe Checkout session:', error);
            res.status(500).send({ error: `Unable to create Stripe Checkout session: ${error.message}` });
        }
    });
});

