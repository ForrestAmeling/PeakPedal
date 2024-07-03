document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const receiptUrl = localStorage.getItem('receiptUrl'); // Retrieve the receipt URL from local storage

    if (!userId) {
        console.error('User ID not found in local storage.');
        return;
    }

    if (receiptUrl) {
        document.getElementById('receipt-iframe').src = receiptUrl; // Set the receipt URL in the iframe
    } else {
        console.error('Receipt URL not found in local storage.');
    }

    try {
        const firebaseConfig = {
            apiKey: "AIzaSyAiw364-i1UvdCUBz3qeq31tLd06rXM140",
            authDomain: "peakpedal-9af93.firebaseapp.com",
            projectId: "peakpedal-9af93",
            storageBucket: "peakpedal-9af93.appspot.com",
            messagingSenderId: "344619285656",
            appId: "1:344619285656:web:7de2229b7d80d5f91d24ed",
            measurementId: "G-0S424MKF14"
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();

        const cartRef = db.collection('Carts').doc(userId).collection('Items');
        const cartSnapshot = await cartRef.get();

        const deletePromises = cartSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        console.log('Cart cleared successfully.');
        localStorage.removeItem('cartItems'); // Clear local storage

        document.getElementById('go-home').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    } catch (error) {
        console.error('Error clearing cart after checkout:', error);
    }
});
