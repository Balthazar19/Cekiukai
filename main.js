import Tesseract from 'tesseract.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('file-input');
        const output = document.getElementById('output');
        const status = document.getElementById('status');

        if (fileInput.files.length === 0) {
            alert('Please upload an image of the receipt.');
            return;
        }

        const image = fileInput.files[0];

        status.textContent = 'Processing...';

        Tesseract.recognize(
            image,
            'eng',
            {
                logger: m => console.log(m),
            }
        ).then(({ data: { text } }) => {
            output.textContent = text;
            status.textContent = 'Done!';

            const check = prisma.check.create({
                data: {
                  userId: user.id,
                  totalPrice: 9.00,
                  products: [
                    { name: "Milk", price: 2.50 },
                    { name: "Bread", price: 1.50 },
                    { name: "Cheese", price: 5.00 }
                  ],
                },
              });
              console.log("Check created:", check);

        }).catch(error => {
            console.error(error);
            status.textContent = 'Error processing the receipt.';
        });
    });
});
