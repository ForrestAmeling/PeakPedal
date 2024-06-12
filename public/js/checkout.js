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

    // Load cart items and calculate the total
    async function loadCartItems() {
        const orderSummaryItems = document.getElementById('order-summary-items');
        orderSummaryItems.innerHTML = ''; // Clear previous items
        let total = 0;

        try {
            const querySnapshot = await db.collection('Carts').get();
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
    }

    // Remove item from cart
    async function removeItemFromCart(itemId) {
        try {
            await db.collection('Carts').doc(itemId).delete();
            loadCartItems(); // Refresh the cart items
        } catch (error) {
            console.error("Error removing item from cart: ", error);
        }
    }

    // Update the cart count displayed in the header
    async function updateCartCount() {
        try {
            const querySnapshot = await db.collection('Carts').get();
            let totalCount = 0;
            querySnapshot.forEach((doc) => {
                const cartItem = doc.data();
                totalCount += parseInt(cartItem.quantity); // Ensure quantity is parsed as an integer
            });
            document.getElementById('cart-count').textContent = totalCount;
        } catch (error) {
            console.error("Error updating cart count: ", error);
        }
    }

    loadCartItems();

    // Event listener for removing items from cart
    document.querySelector('.order-summary-items').addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item')) {
            const itemId = event.target.getAttribute('data-id');
            removeItemFromCart(itemId);
        }
    });

    // Toggle billing address fields based on checkbox
    const billingSameAsShippingCheckbox = document.getElementById('billing-same-as-shipping');
    const billingAddressFields = document.getElementById('billing-address-fields');

    billingSameAsShippingCheckbox.addEventListener('change', () => {
        if (billingSameAsShippingCheckbox.checked) {
            billingAddressFields.style.display = 'none';
        } else {
            billingAddressFields.style.display = 'block';
        }
    });

    // Handle form submission
    document.getElementById('checkout-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const orderNumber = generateOrderNumber();
        const formData = new FormData(event.target);
        const contact = formData.get('email');
        const delivery = {
            country: formData.get('country'),
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            address: formData.get('address'),
            apartment: formData.get('apartment'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zip-code'),
            phone: formData.get('phone')
        };
        const payment = {
            method: formData.get('payment-method'),
            cardNumber: formData.get('card-number'),
            expirationDate: formData.get('expiration-date'),
            securityCode: formData.get('security-code'),
            nameOnCard: formData.get('name-on-card')
        };

        const billing = billingSameAsShippingCheckbox.checked ? delivery : {
            country: formData.get('billing-country'),
            firstName: formData.get('billing-first-name'),
            lastName: formData.get('billing-last-name'),
            address: formData.get('billing-address'),
            apartment: formData.get('billing-apartment'),
            city: formData.get('billing-city'),
            state: formData.get('billing-state'),
            zipCode: formData.get('billing-zip-code'),
            phone: formData.get('billing-phone')
        };

        try {
            await db.collection('orders').add({
                orderNumber,
                contact,
                delivery,
                payment,
                billing,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Clear the user's cart
            const cartItems = await db.collection('Carts').doc(userId).collection('Items').get();
            const batch = db.batch();
            cartItems.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            alert(`Order placed successfully! Your order number is ${orderNumber}`);
            window.location.href = 'confirmation.html';
        } catch (error) {
            console.error("Error placing order: ", error);
            alert('Error placing order. Please try again.');
        }
    });
