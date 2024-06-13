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
    const userId = localStorage.getItem('userId') || generateUUID();
    if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', userId);
    }

    // Load cart items and calculate the total
    async function loadCartItems() {
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
    }

    // Remove item from cart
    async function removeItemFromCart(itemId) {
        try {
            await db.collection('Carts').doc(userId).collection('Items').doc(itemId).delete();
            loadCartItems(); // Refresh the cart items
        } catch (error) {
            console.error("Error removing item from cart: ", error);
        }
    }

    // Update the cart count displayed in the header
    async function updateCartCount() {
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
    document.getElementById('checkout-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const email = this.email.value;
        const cardNumber = this['card-number'].value;
        const expirationDate = this['expiration-date'].value;
        const securityCode = this['security-code'].value;
        const phone = this.phone.value;

        // Email validation
        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Credit card validation
        if (!validateCardNumber(cardNumber)) {
            alert("Please enter a valid card number.");
            return;
        }

        if (!validateExpirationDate(expirationDate)) {
            alert("Please enter a valid expiration date (MM / YY).");
            return;
        }

        if (!validateSecurityCode(securityCode)) {
            alert("Please enter a valid security code.");
            return;
        }

        // Phone number validation
        if (!validatePhoneNumber(phone)) {
            alert("Please enter a valid phone number.");
            return;
        }

        // Perform other validations if needed
        // If all validations pass, proceed with form submission
        this.submit();
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validateCardNumber(cardNumber) {
        // Luhn algorithm for card number validation
        let sum = 0;
        let shouldDouble = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    }

    function validateExpirationDate(expirationDate) {
        const [month, year] = expirationDate.split('/');
        const expDate = new Date(`20${year}`, month);
        const currentDate = new Date();
        return expDate > currentDate;
    }

    function validateSecurityCode(securityCode) {
        return /^\d{3,4}$/.test(securityCode);
    }

    function validatePhoneNumber(phone) {
        return /^\d{10}$/.test(phone);
    }


    // Function to generate a random order number
    function generateOrderNumber() {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 100000);
        return `ORD-${timestamp}-${randomNum}`;
    }

    // Clear cart after order placement
    async function clearCart() {
        const itemsCollection = db.collection('Carts').doc(userId).collection('Items');
        const querySnapshot = await itemsCollection.get();
        querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
        });
        updateCartCount(); // Update the cart count after clearing the cart
    }
});
