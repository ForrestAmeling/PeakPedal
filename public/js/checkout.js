document.addEventListener('DOMContentLoaded', async () => {
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyAiw364-i1UvdCUBz3qeq31tLd06rXM140",
            authDomain: "peakpedal-9af93.firebaseapp.com",
            projectId: "peakpedal-9af93",
            storageBucket: "peakpedal-9af93.appspot.com",
            messagingSenderId: "344619285656",
            appId: "1:344619285656:web:7de2229b7d80d5f91d24ed",
            measurementId: "G-0S424MKF14"
        });
    }

    const db = firebase.firestore();
    const userId = localStorage.getItem('userId') || generateUUID();
    if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', userId);
    }

    const form = document.getElementById('checkout-form');
    const payNowButton = document.querySelector('.pay-now-button');

    const checkFormValidity = () => {
        payNowButton.disabled = !form.checkValidity();
    };

    const formElements = form.querySelectorAll('input, select');
    formElements.forEach(element => {
        element.addEventListener('input', checkFormValidity);
    });

    const loadCartItems = async () => {
        const orderSummaryItems = document.getElementById('order-summary-items');
        orderSummaryItems.innerHTML = ''; // Clear previous items
        let subtotal = 0;
        const cartItems = [];

        try {
            const querySnapshot = await db.collection('Carts').doc(userId).collection('Items').get();
            querySnapshot.forEach((doc) => {
                const cartItem = doc.data();
                if (cartItem.price && cartItem.quantity) {
                    subtotal += cartItem.price * cartItem.quantity;

                    cartItems.push({
                        name: cartItem.BikeName,
                        size: cartItem.size,
                        image: cartItem.image,
                        price: parseFloat(cartItem.price) * 100, // Convert to cents
                        quantity: cartItem.quantity
                    });

                    const orderSummaryItem = document.createElement('div');
                    orderSummaryItem.classList.add('order-summary-item');
                    orderSummaryItem.innerHTML = `
                        <img src="${cartItem.image}" alt="${cartItem.BikeName}">
                        <div class="order-summary-details">
                            <div class="order-summary-labels">
                                <p>Bike</p>
                                <p>Size</p>
                                <p>Quantity</p>
                                <p>Price</p>
                            </div>
                            <div class="order-summary-values">
                                <p>${cartItem.BikeName}</p>
                                <p>${cartItem.size}</p>
                                <p>${cartItem.quantity}</p>
                                <p><strong>$${cartItem.price.toFixed(2)}</strong></p>
                            </div>
                        </div>
                        <button class="remove-item" data-id="${doc.id}">Remove</button>
                    `;
                    orderSummaryItems.appendChild(orderSummaryItem);
                }
            });

            const shippingState = document.querySelector('select[name="state"]').value;
            const taxRate = salesTaxRates[shippingState] || 0;
            const tax = (subtotal * taxRate) / 100;
            const total = subtotal + tax;
            document.querySelector('select[name="state"]').addEventListener('change', loadCartItems);
            document.getElementById('order-subtotal').textContent = subtotal.toFixed(2);
            document.getElementById('order-tax').textContent = tax.toFixed(2);
            document.getElementById('order-total').textContent = total.toFixed(2);
            updateCartCount(); // Update the cart count when loading items
        } catch (error) {
            console.error("Error loading cart items: ", error);
        }

        return { cartItems, tax: parseFloat(document.getElementById('order-tax').textContent) * 100 };
    };

    const removeItemFromCart = async (itemId) => {
        try {
            await db.collection('Carts').doc(userId).collection('Items').doc(itemId).delete();
            loadCartItems(); // Refresh the cart items
        } catch (error) {
            console.error("Error removing item from cart: ", error);
        }
    };

    const updateCartCount = async () => {
        try {
            const querySnapshot = await db.collection('Carts').doc(userId).collection('Items').get();
            let totalCount = 0;
            querySnapshot.forEach((doc) => {
                const cartItem = doc.data();
                totalCount += parseInt(cartItem.quantity); // Ensure quantity is parsed as an integer
            });
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = totalCount;
            }
        } catch (error) {
            console.error("Error updating cart count: ", error);
        }
    };

    const generateOrderNumber = () => {
        return 'ORDER-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    };

    const createCheckoutSession = async () => {
        const { cartItems, tax } = await loadCartItems();
        const totalAmount = parseFloat(document.getElementById('order-total').textContent) * 100; // Convert to cents

        const shippingDetails = {
            name: form.querySelector('input[name="first-name"]').value + ' ' + form.querySelector('input[name="last-name"]').value,
            address: {
                line1: form.querySelector('input[name="address"]').value,
                line2: form.querySelector('input[name="apartment"]').value || '',
                city: form.querySelector('input[name="city"]').value,
                state: form.querySelector('select[name="state"]').value,
                postal_code: form.querySelector('input[name="zip-code"]').value,
                country: form.querySelector('select[name="country"]').value,
            },
            email: form.querySelector('input[name="email"]').value,
            phone: form.querySelector('input[name="phone"]').value
        };

        const orderNumber = generateOrderNumber();

        try {
            const response = await fetch('https://us-central1-peakpedal-9af93.cloudfunctions.net/createCheckoutSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    items: cartItems,
                    taxAmount: tax,
                    shippingDetails: shippingDetails,
                    orderNumber: orderNumber,
                    success_url: window.location.origin + '/success.html',
                    cancel_url: window.location.origin + '/checkout.html'
                })
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(errorDetails.error || 'Unknown error occurred');
            }

            const data = await response.json();
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('There was an issue with your payment. Please try again.');
        }
    };

    document.querySelector('.pay-now-button').addEventListener('click', async (event) => {
        event.preventDefault();
        createCheckoutSession();
    });

    loadCartItems();

    document.querySelector('.order-summary-items').addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item')) {
            const itemId = event.target.getAttribute('data-id');
            removeItemFromCart(itemId);
        }
    });

    // const billingSameAsShippingCheckbox = document.getElementById('billing-same-as-shipping');
    // const billingAddressFields = document.getElementById('billing-address-fields');

    // billingSameAsShippingCheckbox.addEventListener('change', () => {
    //     if (billingSameAsShippingCheckbox.checked) {
    //         billingAddressFields.style.display = 'none';
    //     } else {
    //         billingAddressFields.style.display = 'block';
    //     }
    // });

    const salesTaxRates = {
        AL: 9.25,
        AK: 1.76,
        AZ: 8.37,
        AR: 9.46,
        CA: 8.82,
        CO: 7.78,
        CT: 6.35,
        DE: 0,
        FL: 7.02,
        GA: 7.4,
        HI: 4.44,
        ID: 6.02,
        IL: 8.82,
        IN: 7,
        IA: 6.94,
        KS: 8.66,
        KY: 6,
        LA: 9.55,
        ME: 5.5,
        MD: 6,
        MA: 6.25,
        MI: 6,
        MN: 7.48,
        MS: 7.07,
        MO: 8.33,
        MT: 0,
        NE: 6.95,
        NV: 8.23,
        NH: 0,
        NJ: 6.59,
        NM: 7.72,
        NY: 8.52,
        NC: 6.99,
        ND: 6.97,
        OH: 7.24,
        OK: 8.98,
        OR: 0,
        PA: 6.34,
        RI: 7,
        SC: 7.43,
        SD: 6.4,
        TN: 9.55,
        TX: 8.2,
        UT: 7.19,
        VT: 6.3,
        VA: 5.75,
        WA: 8.86,
        WV: 6.55,
        WI: 5.43,
        WY: 5.36,
        DC: 6
    };

    checkFormValidity();
});
