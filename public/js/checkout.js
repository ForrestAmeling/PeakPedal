// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAiw364-i1UvdCUBz3qeq31tLd06rXM140",
    authDomain: "peakpedal-9af93.firebaseapp.com",
    projectId: "peakpedal-9af93",
    storageBucket: "peakpedal-9af93.appspot.com",
    messagingSenderId: "344619285656",
    appId: "1:344619285656:web:7de2229b7d80d5f91d24ed",
    measurementId: "G-0S424MKF14"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to generate a unique order number
function generateOrderNumber() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000);
    return `ORD-${timestamp}-${randomNum}`;
}

// Load cart items
function loadCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const orderSummaryItems = document.getElementById('order-summary-items');
    let total = 0;

    // Fetch cart items from Firestore
    db.collection('carts').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const cartItem = doc.data();
            total += cartItem.price * cartItem.quantity;

            // Create cart item element
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${cartItem.image}" alt="${cartItem.name}">
                <div>
                    <p>${cartItem.name}</p>
                    <p>Quantity: ${cartItem.quantity}</p>
                    <p>Price: $${cartItem.price.toFixed(2)}</p>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);

            // Create order summary item element
            const orderSummaryItem = document.createElement('div');
            orderSummaryItem.classList.add('order-summary-item');
            orderSummaryItem.innerHTML = `
                <img src="${cartItem.image}" alt="${cartItem.name}">
                <div>
                    <p>${cartItem.name}</p>
                    <p>$${cartItem.price.toFixed(2)}</p>
                </div>
            `;
            orderSummaryItems.appendChild(orderSummaryItem);
        });

        // Update total
        document.getElementById('order-total').textContent = total.toFixed(2);
    }).catch((error) => {
        console.error("Error loading cart items: ", error);
    });
}

// Load cart items when the page loads
document.addEventListener('DOMContentLoaded', loadCartItems);

// Handle form submission
document.getElementById('checkout-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Generate a unique order number
    const orderNumber = generateOrderNumber();

    // Collect form data
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

    // Store order details in Firestore
    db.collection('orders').add({
        orderNumber,
        contact,
        delivery,
        payment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert(`Order placed successfully! Your order number is ${orderNumber}`);
        // Redirect to confirmation page or clear the form
        window.location.href = 'confirmation.html';
    }).catch((error) => {
        console.error("Error placing order: ", error);
        alert('Error placing order. Please try again.');
    });
});
