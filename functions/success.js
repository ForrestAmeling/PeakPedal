document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');

    try {
        await fetch('https://us-central1-peakpedal-9af93.cloudfunctions.net/clearCartAfterCheckout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: userId })
        });

        console.log('Cart cleared successfully.');
    } catch (error) {
        console.error('Error clearing cart after checkout:', error);
    }
});
