import http from 'http';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

const BASE_URL = 'http://localhost:5000';
const TOTAL_REQUESTS = 100;

function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testRequestPerformance() {
    let successful = 0;
    let totalDuration = 0;
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/createCheck',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };

        const startTime = Date.now();
        try {
            const response = await makeRequest(options, {});
            const duration = Date.now() - startTime;
            totalDuration += duration;
            console.log(`Request ${i + 1} took ${duration} ms`);
            if (response.status === 200 && duration < 3000) {
                successful++;
            }
        } catch (error) {
            console.error('Error during request:', error.message);
        }
    }
    const averageTime = totalDuration / TOTAL_REQUESTS;
    console.log(`\nPerformance test completed.`);
    console.log(`Success rate: ${(successful / TOTAL_REQUESTS * 100).toFixed(2)}%`);
    console.log(`Average request time: ${averageTime.toFixed(2)} ms`);
}

async function testOCRPerformance() {
    const imagePath = path.join('tests', 'sample-receipt.png');
    if (!fs.existsSync(imagePath)) {
        console.error("Image file not found at:", imagePath);
        return;
    }

    const imageBuffer = fs.readFileSync(imagePath);

    const start = Date.now();
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
    const end = Date.now();
    const duration = (end - start) / 1000;

    console.log(`\nOCR processing time: ${duration.toFixed(2)} seconds`);

    if (duration <= 5) {
        console.log("testOCRPerformance PASSED!");
    } else {
        console.error(`testOCRPerformance FAILED: Took ${duration.toFixed(2)}s (max 5s allowed)`);
    }
}

(async () => {
    await testRequestPerformance();
    await testOCRPerformance();
})();
