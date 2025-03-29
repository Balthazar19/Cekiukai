import Tesseract from 'tesseract.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const processBtn = document.getElementById('process-btn');
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const imagePreview = document.getElementById('image-preview');

    processBtn.addEventListener('click', async () => {
        if (fileInput.files.length === 0) {
            alert('Choose a receipt picture.');
            return;
        }

        const image = fileInput.files[0];

        // Validate file format (JPEG, PNG, JPG)
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedFormats.includes(image.type)) {
            status.textContent = 'Invalid file format! We only support JPG, JPEG, PNG.';
            status.style.color = 'red';
            return;
        }

        // Validate file size (Max: 5MB)
        if (image.size > 5 * 1024 * 1024) {
            status.textContent = 'Picture is too big! Maximum size: 5MB.';
            status.style.color = 'red';
            return;
        }

        // Load image for resolution check
        const img = new Image();
        img.onload = async function () {
            const width = img.width;
            const height = img.height;

            // Validate resolution (Min: 800x600, Max: 1920x1080)
            if (width < 500 || height < 500 || width > 1920 || height > 2000) {
                status.textContent = `Invalid resolution (${width}x${height}). A valid range is 500x500 - 1920x2000.`;
                status.style.color = 'red';
                return;
            }

            // Show preview
            imagePreview.innerHTML = `<img src="${URL.createObjectURL(image)}" alt="Preview" class="preview-image">`;

            // Start OCR processing
            status.textContent = 'Processing...';
            status.style.color = 'blue';

            try {
                const { data: { text } } = await Tesseract.recognize(image, 'eng', {
                    logger: (m) => console.log(m),
                });

                output.textContent = text;
                status.textContent = 'Done!';
                status.style.color = 'green';

                // Mock parsing receipt data (Replace with actual text processing)
                const requestBody = {
                    userId: "dummyUserId123",
                    extractedText: text, // Send extracted OCR text
                    products: [
                        { name: "Milk", price: 2.50 },
                        { name: "Bread", price: 1.50 },
                        { name: "Cheese", price: 5.00 }
                    ],
                    totalPrice: 9.00
                };

                // Send parsed data to backend
                const response = await fetch('http://localhost:5000/api/createCheck', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });

                const result = await response.json();
                console.log("✅ Server Response:", result);
                status.textContent = 'Check saved successfully!';
                status.style.color = 'green';
            } catch (error) {
                console.error(error);
                status.textContent = 'Error processing the receipt.';
                status.style.color = 'red';
            }
        };
        img.src = URL.createObjectURL(image);
    });
});
