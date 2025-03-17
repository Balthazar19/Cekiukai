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
        }).catch(error => {
            console.error(error);
            status.textContent = 'Error processing the receipt.';
        });
    });
});
