import Tesseract from 'tesseract.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn').addEventListener('click', async () => {
        const status = document.getElementById('status');

        status.textContent = 'Processing...';

        try {
            const requestBody = {
                userId: "dummyUserId123",
                products: [
                    { name: "Milk", price: 2.50 },
                    { name: "Bread", price: 1.50 },
                    { name: "Cheese", price: 5.00 }
                ],
                totalPrice: 9.00
            };

            const response = await fetch('http://localhost:5000/api/createCheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            console.log("✅ Server Response:", result);
            status.textContent = 'Check saved successfully!';
        } catch (error) {
            console.error(error);
            status.textContent = 'Error processing the receipt.';
        }
    });
});