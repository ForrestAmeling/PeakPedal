document.addEventListener('DOMContentLoaded', async () => {
    const shopButton = document.getElementById('shop-button');
    const learnButton = document.getElementById('learn-button');
    const bikesSection = document.querySelector('.bikes-grid');
    const spotlightSection = document.querySelector('.spotlight-content');
    const whyUsSection = document.getElementById('why-us');
    const cartCountElement = document.getElementById('cart-count');

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAiw364-i1UvdCUBz3qeq31tLd06rXM140",
        authDomain: "peakpedal-9af93.firebaseapp.com",
        projectId: "peakpedal-9af93",
        storageBucket: "peakpedal-9af93.appspot.com",
        messagingSenderId: "344619285656",
        appId: "1:344619285656:web:7de2229b7d80d5f91d24ed",
        measurementId: "G-0S424MKF14"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Firebase Authentication
    const auth = firebase.auth();
    auth.signInAnonymously().catch((error) => {
        console.error('Error signing in anonymously:', error);
    });

    // Fetch bikes data from Firestore
    async function fetchBikes() {
        const bikesData = [];
        try {
            const querySnapshot = await window.db.collection('Bikes').orderBy('BikeId').get();
            querySnapshot.forEach((doc) => {
                bikesData.push(doc.data());
            });
        } catch (error) {
            console.error("Error fetching bikes data: ", error);
        }
        return bikesData;
    }

    // Create a bike element for display in the grid
    function createBikeGridElement(bike) {
        const bikeElement = document.createElement('div');
        bikeElement.classList.add('bike');
        bikeElement.setAttribute('data-id', bike.BikeId);

        const imgElement = document.createElement('img');
        if (bike.images && Array.isArray(bike.images) && bike.images.length > 0) {
            imgElement.src = bike.images[0];
        } else {
            imgElement.src = 'default-image.jpg'; // Fallback image if no images are available
        }
        imgElement.alt = bike.BikeName;
        imgElement.width = 300;
        imgElement.height = 200;

        bikeElement.appendChild(imgElement);
        bikeElement.innerHTML += `
            <h3>${bike.BikeName}</h3>
            <p><del>MSRP: ${bike.MSRP}</del></p>
            <p><strong>Our Price: ${bike.OurPrice}</strong></p>
            <button class="view-details">View Details</button>
        `;

        bikeElement.querySelector('.view-details').addEventListener('click', () => handleViewDetails(bike));

        return bikeElement;
    }

    // Update the spotlight section with bike details
    function updateSpotlight(bike) {
        let currentIndex = 0;

        const spotlightMainImage = `
            <div class="spotlight-main-image">
                <img src="${bike.images[currentIndex]}" alt="${bike.BikeName}">
            </div>
        `;

        const spotlightControls = `
            <div class="spotlight-controls">
                <button id="prev-button" class="arrow-button">&larr;</button>
                <button id="next-button" class="arrow-button">&rarr;</button>
            </div>
        `;

        const descriptionList = bike.description && Array.isArray(bike.description)
            ? bike.description.map(line => `<li>${line}</li>`).join('')
            : '';

        const sizeOptions = bike.sizes.map(size => `<option value="${size}">${size}</option>`).join('');

        spotlightSection.innerHTML = `
            <h2>${bike.BikeName}</h2>
            ${spotlightMainImage}
            ${spotlightControls}
            <ul>${descriptionList}</ul>
            <p><del>MSRP: ${bike.MSRP}</del></p>
            <p><strong>Our Price: ${bike.OurPrice}</strong></p>
            <label for="size-select">Size:</label>
            <select id="size-select">
                ${sizeOptions}
            </select>
            <label for="quantity-input">Quantity:</label>
            <input type="number" id="quantity-input" name="quantity" min="1" value="1">
            <br>
            <button class="buy-now">Buy Now</button>
            <button class="add-to-cart">Add to Cart</button>
        `;

        document.getElementById('next-button').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % bike.images.length;
            document.querySelector('.spotlight-main-image img').src = bike.images[currentIndex];
        });

        document.getElementById('prev-button').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + bike.images.length) % bike.images.length;
            document.querySelector('.spotlight-main-image img').src = bike.images[currentIndex];
        });

        document.querySelector('.buy-now').addEventListener('click', () => handleBuyNow(bike));
        document.querySelector('.add-to-cart').addEventListener('click', () => handleAddToCart(bike));
    }

    // Handle View Details button click
    function handleViewDetails(bike) {
        updateSpotlight(bike);
        spotlightSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Handle Add to Cart button click
    async function handleAddToCart(bike) {
        await addToCart(bike);
    }

    // Handle Buy Now button click
    async function handleBuyNow(bike) {
        await addToCart(bike);
        window.location.href = 'checkout.html';
    }

    // Add bike to cart
    async function addToCart(bike) {
        const quantity = parseInt(document.getElementById('quantity-input').value);
        const size = document.getElementById('size-select').value;

        try {
            console.log('Adding to cart:', bike, 'Quantity:', quantity, 'Size:', size);
            console.log('User ID:', userId);

            const cartRef = db.collection('Carts').doc(userId).collection('Items');
            const existingItemQuery = await cartRef.where('BikeId', '==', bike.BikeId).where('size', '==', size).get();

            if (!existingItemQuery.empty) {
                existingItemQuery.forEach(async (doc) => {
                    const existingItem = doc.data();
                    const newQuantity = existingItem.quantity + quantity;
                    console.log('Updating existing item:', doc.id, 'New Quantity:', newQuantity);
                    await doc.ref.update({ quantity: newQuantity });
                });
            } else {
                console.log('Adding new item to cart');
                await cartRef.add({
                    BikeId: bike.BikeId,
                    BikeName: bike.BikeName,
                    BikeManufacturer: bike.BikeManufacturer,
                    image: bike.images[0],
                    price: parseFloat(bike.OurPrice.replace('$', '').replace(',', '')),
                    quantity: quantity,
                    size: size
                });
            }
            console.log("Item added to cart successfully");
            alert("Item added to cart!");
            updateCartCount();
        } catch (error) {
            console.error("Error adding item to cart: ", error);
        }
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

    async function loadCartItems() {
        const orderSummaryItems = document.getElementById('order-summary-items');
        orderSummaryItems.innerHTML = '';
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
            updateCartCount();
        } catch (error) {
            console.error("Error loading cart items: ", error);
        }
    }

    async function updateCartCount() {
        try {
            const querySnapshot = await db.collection('Carts').doc(userId).collection('Items').get();
            let totalCount = 0;
            querySnapshot.forEach((doc) => {
                const cartItem = doc.data();
                totalCount += parseInt(cartItem.quantity) || 0;
            });
            document.getElementById('cart-count').textContent = totalCount;
        } catch (error) {
            console.error("Error updating cart count: ", error);
        }
    }

    // Fetch and display distinct bikes data
    const bikesData = await fetchBikes();
    console.log(bikesData);

    // Create a map to store unique bikes by BikeId
    const uniqueBikesMap = new Map();
    bikesData.forEach(bike => {
        if (!uniqueBikesMap.has(bike.BikeId)) {
            uniqueBikesMap.set(bike.BikeId, bike);
        }
    });

    // Display only unique bikes in the grid
    uniqueBikesMap.forEach(bike => {
        const bikeElement = createBikeGridElement(bike);
        bikeElement.addEventListener('click', () => handleViewDetails(bike));
        bikesSection.appendChild(bikeElement);
    });

    // Initialize spotlight with the first bike
    if (bikesData.length > 0) {
        updateSpotlight(bikesData[0]);
    }

    shopButton.addEventListener('click', () => {
        bikesSection.scrollIntoView({ behavior: 'smooth' });
    });

    learnButton.addEventListener('click', () => {
        whyUsSection.scrollIntoView({ behavior: 'smooth' });
    });

    updateCartCount();
});
