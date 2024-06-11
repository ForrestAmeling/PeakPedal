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

    async function loadCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const orderSummaryItems = document.getElementById('order-summary-items');
        let total = 0;

        try {
            const querySnapshot = await db.collection('Carts').get();
            querySnapshot.forEach((doc) => {
                const cartItem = doc.data();
                if (cartItem.price && cartItem.quantity) {
                    total += cartItem.price * cartItem.quantity;

                    const cartItemElement = document.createElement('div');
                    cartItemElement.classList.add('cart-item');
                    cartItemElement.innerHTML = `
                        <img src="${cartItem.image}" alt="${cartItem.BikeName}">
                        <div>
                            <p>${cartItem.BikeName}</p>
                            <p>Quantity: ${cartItem.quantity}</p>
                            <p>Price: $${cartItem.price.toFixed(2)}</p>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItemElement);

                    const orderSummaryItem = document.createElement('div');
                    orderSummaryItem.classList.add('order-summary-item');
                    orderSummaryItem.innerHTML = `
                        <img src="${cartItem.image}" alt="${cartItem.BikeName}">
                        <div>
                            <p>${cartItem.BikeName}</p>
                            <p>Size: ${cartItem.size}</p>
                            <p>Quantity: ${cartItem.quantity}</p>
                            <p>Price: $${cartItem.price.toFixed(2)}</p>
                        </div>
                    `;
                    orderSummaryItems.appendChild(orderSummaryItem);
                }
            });

            document.getElementById('order-total').textContent = total.toFixed(2);
        } catch (error) {
            console.error("Error loading cart items: ", error);
        }
    }

    loadCartItems();

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

        try {
            await db.collection('orders').add({
                orderNumber,
                contact,
                delivery,
                payment,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert(`Order placed successfully! Your order number is ${orderNumber}`);
            window.location.href = 'confirmation.html';
        } catch (error) {
            console.error("Error placing order: ", error);
            alert('Error placing order. Please try again.');
        }
    });

    function generateOrderNumber() {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 100000);
        return `ORD-${timestamp}-${randomNum}`;
    }
});
