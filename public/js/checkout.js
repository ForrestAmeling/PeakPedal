document.addEventListener('DOMContentLoaded', async () => {
    // Ensure Firebase is initialized properly
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
    const functions = firebase.functions();
    const userId = localStorage.getItem('userId') || generateUUID();
    if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', userId);
    }

    const loadCartItems = async () => {
        const orderSummaryItems = document.getElementById('order-summary-items');
        orderSummaryItems.innerHTML = ''; // Clear previous items
        let total = 0;

        try {
            const querySnapshot = await db.collection('Carts').doc(userId).collection('Items').get();
            querySnapshot.forEach((doc) => {
                const cartItem = doc.data();
                if (cartItem.price && cartItem.quantity) {
                    total += cartItem.price * cartItem.quantity;

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

            document.getElementById('order-total').textContent = total.toFixed(2);
            updateCartCount(); // Update the cart count when loading items
        } catch (error) {
            console.error("Error loading cart items: ", error);
        }
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

    const createCheckoutSession = async () => {
        const createCheckoutSession = functions.httpsCallable('ext-firestore-stripe-payments-createCheckoutSession');

        const { data } = await createCheckoutSession({
            price: 'your-price-id', // Replace with your actual price ID
            success_url: window.location.origin,
            cancel_url: window.location.origin,
        });

        window.location.href = data.url;
    };

    document.querySelector('.pay-now-button').addEventListener('click', (event) => {
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

    const billingSameAsShippingCheckbox = document.getElementById('billing-same-as-shipping');
    const billingAddressFields = document.getElementById('billing-address-fields');

    billingSameAsShippingCheckbox.addEventListener('change', () => {
        if (billingSameAsShippingCheckbox.checked) {
            billingAddressFields.style.display = 'none';
        } else {
            billingAddressFields.style.display = 'block';
        }
    });
});
