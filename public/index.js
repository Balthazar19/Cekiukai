import Tesseract from 'tesseract.js';

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const processBtn = document.getElementById('process-btn');
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    const imagePreview = document.getElementById('image-preview');
    const editStatus = document.getElementById('edit-status');
    const ocrTextarea = document.getElementById('ocr-text');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-edited-btn');

    processBtn.addEventListener('click', async () => {
        if (fileInput.files.length === 0) {
            alert('Choose a receipt picture.');
            return;
        }

        const image = fileInput.files[0];

        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedFormats.includes(image.type)) {
            status.textContent = 'Invalid file format! We only support JPG, JPEG, PNG.';
            status.style.color = 'red';
            return;
        }

        if (image.size > 5 * 1024 * 1024) {
            status.textContent = 'Picture is too big! Maximum size: 5MB.';
            status.style.color = 'red';
            return;
        }

        const img = new Image();
        img.onload = async function () {
            const width = img.width;
            const height = img.height;

            if (width < 500 || height < 500 || width > 1920 || height > 2000) {
                status.textContent = `Invalid resolution (${width}x${height}). A valid range is 500x500 - 1920x2000.`;
                status.style.color = 'red';
                return;
            }

            imagePreview.innerHTML = `<img src="${URL.createObjectURL(image)}" alt="Preview" class="preview-image">`;

            status.textContent = 'Processing...';
            status.style.color = 'blue';

            try {
                const { data: { text } } = await Tesseract.recognize(image, 'eng', {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            status.textContent = `Done!`;
                            status.style.color = 'green';
                        }
                    },
                });

                const originalText = text.trim();

                ocrTextarea.value = originalText;
                ocrTextarea.style.display = 'block';
                cancelBtn.style.display = 'inline-block';
                saveBtn.style.display = 'inline-block';

                status.textContent = 'Check saved successfully!';
                status.style.color = 'green';
                editStatus.textContent = '';
                editStatus.style.color = '#333';

                cancelBtn.onclick = () => {
                    ocrTextarea.value = originalText;
                    editStatus.textContent = 'Text restored to original.';
                    editStatus.style.color = 'orange';
                };

                saveBtn.onclick = async () => {
                    const editedText = ocrTextarea.value;

                    const requestBody = {
                        userId: "dummyUserId123",
                        extractedText: editedText,
                        products: [
                            { name: "Milk", price: 2.50 },
                            { name: "Bread", price: 1.50 },
                            { name: "Cheese", price: 5.00 }
                        ],
                        totalPrice: 9.00
                    };

                    try {
                        const response = await fetch('http://localhost:5000/api/createCheck', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestBody),
                        });

                        const result = await response.json();
                        console.log("✅ Server Response:", result);
                        editStatus.textContent = 'Check saved successfully!';
                        editStatus.style.color = 'green';
                    } catch (err) {
                        console.error(err);
                        editStatus.textContent = 'Error sending data to the server';
                        editStatus.style.color = 'red';
                    }
                };

            } catch (error) {
                console.error(error);
                status.textContent = 'Error processing the receipt.';
                status.style.color = 'red';
            }
        };
        img.src = URL.createObjectURL(image);
    });
});
