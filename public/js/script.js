document.addEventListener('DOMContentLoaded', async () => {
    const shopButton = document.getElementById('shop-button');
    const learnButton = document.getElementById('learn-button');
    const bikesSection = document.querySelector('.bikes-grid');
    const spotlightSection = document.querySelector('.spotlight-content');
    const whyUsSection = document.getElementById('why-us');

    const db = firebase.firestore();

    // Function to fetch bikes data from Firestore
    async function fetchBikes() {
        const bikesData = [];
        try {
            const querySnapshot = await db.collection('Bikes').get();
            querySnapshot.forEach((doc) => {
                console.log(doc.data()); // Log each document data to ensure data is fetched correctly
                bikesData.push(doc.data());
            });
        } catch (error) {
            console.error("Error fetching bikes data: ", error);
        }
        return bikesData;
    }

    // Function to create bike element
    function createBikeElement(bike) {
        const bikeElement = document.createElement('div');
        bikeElement.classList.add('bike');
        bikeElement.setAttribute('data-id', bike.BikeId);

        const imgElement = document.createElement('img');
        imgElement.src = bike.images[0];
        imgElement.alt = bike.BikeName;
        imgElement.width = 300;
        imgElement.height = 200;

        bikeElement.appendChild(imgElement);
        bikeElement.innerHTML += `
            <h3>${bike.BikeName}</h3>
            <p><del>MSRP: ${bike.MSRP}</del></p>
            <p><strong>Our Price: ${bike.OurPrice}</strong></p>
        `;

        return bikeElement;
    }

    // Function to update spotlight
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

        spotlightSection.innerHTML = `
            <h2>${bike.BikeName}</h2>
            ${spotlightMainImage}
            ${spotlightControls}
            <ul>${bike.Description.map(line => `<li>${line}</li>`).join('')}</ul>
            <p><del>MSRP: ${bike.MSRP}</del></p>
            <p><strong>Our Price: ${bike.OurPrice}</strong></p>
            <label for="size-select">Size:</label>
            <select id="size-select">
                <option value="SM/15.5">SM/15.5 5'4"-5'7"</option>
                <option value="MD/17">MD/17 5'7"-5'10"</option>
                <option value="LG/19">LG/19 5'10"-6'2"</option>
                <option value="XL/21">XL/21 6'2"-6'6"</option>
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

    function bikeClickHandler(event) {
        const bikeId = event.currentTarget.getAttribute('data-id');
        const selectedBike = bikesData.find(bike => bike.BikeId == bikeId);
        updateSpotlight(selectedBike);

        spotlightSection.scrollIntoView({ behavior: 'smooth' });
    }

    const bikesData = await fetchBikes();
    console.log(bikesData); // Log the fetched bikes data to ensure it's correct

    bikesData.forEach(bike => {
        const bikeElement = createBikeElement(bike);
        bikeElement.addEventListener('click', bikeClickHandler);
        bikesSection.appendChild(bikeElement);
    });

    if (bikesData.length > 0) {
        updateSpotlight(bikesData[0]);
    }

    shopButton.addEventListener('click', () => {
        bikesSection.scrollIntoView({ behavior: 'smooth' });
    });

    learnButton.addEventListener('click', () => {
        whyUsSection.scrollIntoView({ behavior: 'smooth' });
    });
});

async function addToCart(bike) {
    const quantity = parseInt(document.getElementById('quantity-input').value);
    const size = document.getElementById('size-select').value;

    try {
        await addDoc(collection(db, 'Carts'), {
            BikeId: bike.BikeId,
            BikeName: bike.BikeName,
            BikeManufacturer: bike.BikeManufacturer,
            image: bike.images[0],
            price: parseFloat(bike.OurPrice.replace('$', '').replace(',', '')),
            quantity: quantity,
            size: size
        });
        console.log("Item added to cart");
        alert("Item added to cart!");
    } catch (error) {
        console.error("Error adding item to cart: ", error);
    }
}

function handleAddToCart(bike) {
    addToCart(bike);
}

function handleBuyNow(bike) {
    addToCart(bike);
    window.location.href = 'checkout.html';
}
