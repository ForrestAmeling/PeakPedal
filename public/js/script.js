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

document.addEventListener('DOMContentLoaded', () => {
    const shopButton = document.getElementById('shop-button');
    const learnButton = document.getElementById('learn-button');
    const bikesSection = document.querySelector('.bikes-grid'); // Make sure this targets .bikes-grid
    const spotlightSection = document.querySelector('.spotlight-content');
    const whyUsSection = document.getElementById('why-us'); // Target the "Why Us" section

    // Define bike data
    const bikesData = [
        {
            id: 1,
            name: 'Diamondback YOWIE 3',
            image: 'assets/YOWIE3/yowie-3-1.webp',
            images: [
                'assets/YOWIE3/yowie-3-1.webp',
                'assets/YOWIE3/yowie-3-2.webp',
                'assets/YOWIE3/yowie-3-3.webp',
                'assets/YOWIE3/yowie-3-4.webp',
                'assets/YOWIE3/yowie-3-5.webp',
                'assets/YOWIE3/yowie-3-6.webp',
                'assets/YOWIE3/yowie-3-7.webp',
                'assets/YOWIE3/yowie-3-8.webp',
                'assets/YOWIE3/yowie-3-9.webp'
            ],
            description: ['Hydroformed aluminum frame featuring Level Link system for 110mm of efficient yet supple suspension combines with a Fox 34 Performance Float fork for 130mm of front travel',
                'Fox Float DPS Performance Elite Float rear shock (110mm travel) has excellent small-bump sensitivity plus improved adjustment range',
                '130mm travel Fox 34 Performance Float fork features Grip damper for more consistent feel',
                'SRAM Stylo cranks and SRAM GX Eagle 1x12-speed drivetrain for light weight and smooth shifting',
                'Shimano SLX hydraulic disc brakes offer excellent power and modulation'],
            price: '$4,150.00'
        },
        {
            id: 2,
            name: 'Diamondback RELEASE 5C',
            image: 'assets/RELEASE5C/release5c-1.webp',
            images: [
                'assets/RELEASE5C/release5c-1.webp',
                'assets/RELEASE5C/release5c-2.webp',
                'assets/RELEASE5C/release5c-3.webp',
                'assets/RELEASE5C/release5c-4.webp',
                'assets/RELEASE5C/release5c-5.webp',
                'assets/RELEASE5C/release5c-6.webp',
                'assets/RELEASE5C/release5c-7.webp',
                'assets/RELEASE5C/release5c-8.webp'
            ],
            description: ['Level Link design equals 130mm of efficient yet supple rear suspension',
                'Light and stiff carbon frame with Boost 148x12mm Maxle dropout',
                'Fox 36 Factory Float suspension fork and Fox Factory Float DPS shock provide 150/130mm of top-tier suspension',
                'Powerful and easy-to-adjust SRAM G2 RS hydraulic disc brakes (180mm rotors)',
                'SRAM GX Eagle 12-speed drivetrain is durable and makes easy work of the steepest climbs with its ultra-wide gearing'],
            price: '$5,850.00'
        },
        {
            id: 3,
            name: 'Diamondback RELEASE 4C',
            image: 'assets/RELEASE4C/release4c-1.webp',
            images: [
                'assets/RELEASE4C/release4c-1.webp',
                'assets/RELEASE4C/release4c-2.webp',
                'assets/RELEASE4C/release4c-3.webp',
                'assets/RELEASE4C/release4c-4.webp',
                'assets/RELEASE4C/release4c-5.webp',
                'assets/RELEASE4C/release4c-6.webp',
                'assets/RELEASE4C/release4c-7.webp',
                'assets/RELEASE4C/release4c-8.webp',
                'assets/RELEASE4C/release4c-9.jpg'
            ],
            description: ['Level Link design equals 130mm of efficient yet supple rear suspension',
                'Light and stiff carbon frame with Boost 148x12mm Maxle dropout',
                'KS Rage-I dropper post (w/ Southpaw remote lever) adds maneuverability on descents',
                'Fox 36 Performance Float and Fox Float DPS EVOL LV rear shock provide supple suspension travel (150/130mm, front and rear)',
                'Plenty of gearing to tackle steep climbs, thanks to SRAM NX Eagle 11-50T, single-ring drivetrain'],
            price: '$4,750.00'
        },
        {
            id: 4,
            name: 'Diamondback RELEASE 29 3',
            image: 'assets/RELEASE293/release293-1.webp',
            images: [
                'assets/RELEASE293/release293-1.webp',
                'assets/RELEASE293/release293-2.webp',
                'assets/RELEASE293/release293-3.webp',
                'assets/RELEASE293/release293-4.webp',
                'assets/RELEASE293/release293-5.webp',
                'assets/RELEASE293/release293-6.webp',
                'assets/RELEASE293/release293-7.webp',
                'assets/RELEASE293/release293-8.webp',
                'assets/RELEASE293/release293-9.webp',
                'assets/RELEASE293/release293-10.jpg',
                'assets/RELEASE293/release293-11.webp',
                'assets/RELEASE293/release293-12.jpg'
            ],
            description: ['130mm travel hydroformed aluminum frame features Level Link system for efficient yet supple suspension',
                'Fox Performance Elite Float DPS rear shock has excellent small-bump sensitivity plus improved adjustment range',
                '140mm travel Fox 34 Performance Float fork features Grip damper for more consistent feel',
                'Sram Stylo cranks and Sram GX Eagle 1x12-speed drivetrain for light weight and smooth shifting',
                'Shimano XT hydraulic disc brakes offer excellent power and modulation'],
            price: '$4,550.00'
        },
        {
            id: 5,
            name: 'Diamondback RELEASE 29 2',
            image: 'assets/RELEASE292/release292-1.webp',
            images: [
                'assets/RELEASE292/release292-1.webp',
                'assets/RELEASE292/release292-2.webp',
                'assets/RELEASE292/release292-3.webp',
                'assets/RELEASE292/release292-4.webp',
                'assets/RELEASE292/release292-5.webp',
                'assets/RELEASE292/release292-6.webp',
                'assets/RELEASE292/release292-7.webp',
                'assets/RELEASE292/release292-8.webp',
                'assets/RELEASE292/release292-9.jpg'
            ],
            description: ['130mm travel hydroformed aluminum frame features Level Link system for efficient yet supple suspension',
                'Fox Performance Elite Float DPS rear shock has excellent small-bump sensitivity plus improved adjustment range',
                '140mm travel Fox 34 Performance Float fork features Grip damper for more consistent feel',
                'Sram Stylo cranks and Sram GX Eagle 1x12-speed drivetrain for light weight and smooth shifting',
                'Shimano XT hydraulic disc brakes offer excellent power and modulation'],
            price: '$3,675.00'
        },
        {
            id: 6,
            name: 'Diamondback RELEASE 29 1',
            image: 'assets/RELEASE291/release291-1.webp',
            images: [
                'assets/RELEASE291/release291-1.webp',
                'assets/RELEASE291/release291-2.webp',
                'assets/RELEASE291/release291-3.webp',
                'assets/RELEASE291/release291-4.webp',
                'assets/RELEASE291/release291-5.webp',
                'assets/RELEASE291/release291-6.webp',
                'assets/RELEASE291/release291-7.webp',
                'assets/RELEASE291/release291-8.webp',
                'assets/RELEASE291/release291-9.jpg'
            ],
            description: ['Level Link design equals 130mm of efficient yet supple rear suspension in a 29er frame',
                'Boost 148x12mm “Maxle” thru-axle and Boost 110 fork add stiffness',
                'RockShox 35 Silver fork and RockShox Monarch R shock for 140mm front / 130mm rear suspension',
                'Sram SX Eagle 1x12 drivetrain with Sram SX cranks brings single-ring drivetrains to a more affordable level',
                'Diamondback Blanchard 28R wheels make it easy to go tubeless'],
            price: '$2,850.00'
        }
    ];

    // Function to create bike element with optimized image
    function createBikeElement(bike) {
        const bikeElement = document.createElement('div');
        bikeElement.classList.add('bike');
        bikeElement.setAttribute('data-id', bike.id);

        // Create image element
        const imgElement = document.createElement('img');
        imgElement.src = bike.image;
        imgElement.alt = bike.name;
        imgElement.width = 300; // Set the width (adjust as needed)
        imgElement.height = 200; // Set the height (adjust as needed)

        // Calculate Our Price
        const msrp = parseFloat(bike.price.replace('$', '').replace(',', ''));
        const ourPrice = msrp - 150.01;

        // Append image, MSRP, and Our Price to bike element
        bikeElement.appendChild(imgElement);
        bikeElement.innerHTML += `
            <h3>${bike.name}</h3>
            <p><del>MSRP: ${bike.price}</del></p>
            <p><strong>Our Price: $${ourPrice.toFixed(2)}</strong></p>
        `;

        // Apply CSS styles
        const msrpElement = bikeElement.querySelector('del');
        msrpElement.style.textDecoration = 'line-through';

        const ourPriceElement = bikeElement.querySelector('strong');
        ourPriceElement.style.fontWeight = 'bold';

        return bikeElement;
    }

    function updateSpotlight(bike) {
        // Calculate Our Price
        const msrp = parseFloat(bike.price.replace('$', '').replace(',', ''));
        const ourPrice = msrp - 150.01;

        let currentIndex = 0;

        const spotlightMainImage = `
        <div class="spotlight-main-image">
            <img src="${bike.images[currentIndex]}" alt="${bike.name}">
        </div>
    `;

        const spotlightControls = `
        <div class="spotlight-controls">
            <button id="prev-button" class="arrow-button">&larr;</button>
            <button id="next-button" class="arrow-button">&rarr;</button>
        </div>
    `;

        spotlightSection.innerHTML = `
        <h2>${bike.name}</h2>
        ${spotlightMainImage}
        ${spotlightControls}
         <ul>${bike.description.map(line => `<li>${line}</li>`).join('')}</ul>
        <p><del>MSRP: ${bike.price}</del></p>
        <p><strong>Our Price: $${ourPrice.toFixed(2)}</strong></p>
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

        // Add event listeners for the next and previous buttons
        document.getElementById('next-button').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % bike.images.length;
            document.querySelector('.spotlight-main-image img').src = bike.images[currentIndex];
        });

        document.getElementById('prev-button').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + bike.images.length) % bike.images.length;
            document.querySelector('.spotlight-main-image img').src = bike.images[currentIndex];
        });

        // Add event listeners for Add to Cart and Buy Now buttons
        document.querySelector('.buy-now').addEventListener('click', () => handleBuyNow(bike));
        document.querySelector('.add-to-cart').addEventListener('click', () => handleAddToCart(bike));
    }

    // Function to handle click on a bike
    function bikeClickHandler(event) {
        const bikeId = event.currentTarget.getAttribute('data-id');
        const selectedBike = bikesData.find(bike => bike.id == bikeId);
        updateSpotlight(selectedBike);

        // Scroll to the spotlight section
        spotlightSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Populate bikes section with bike data
    bikesData.forEach(bike => {
        const bikeElement = createBikeElement(bike);
        bikeElement.addEventListener('click', bikeClickHandler);
        bikesSection.appendChild(bikeElement);
    });

    // Default spotlight to first bike
    updateSpotlight(bikesData[0]);

    // Scroll to bikes section when "Shop Bikes" button is clicked
    shopButton.addEventListener('click', () => {
        bikesSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Scroll to "Why Us" section when "Learn More" button is clicked
    learnButton.addEventListener('click', () => {
        whyUsSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Function to add item to cart
function addToCart(bike) {
    const quantity = parseInt(document.getElementById('quantity-input').value);
    const size = document.getElementById('size-select').value;

    db.collection('carts').add({
        ...bike,
        quantity: quantity,
        size: size
    }).then(() => {
        console.log("Item added to cart");
    }).catch((error) => {
        console.error("Error adding item to cart: ", error);
    });
}

// Function to handle "Add to Cart" button click
function handleAddToCart(bike) {
    addToCart(bike);
}

// Function to handle "Buy Now" button click
function handleBuyNow(bike) {
    addToCart(bike);
    window.location.href = 'checkout.html';
}
