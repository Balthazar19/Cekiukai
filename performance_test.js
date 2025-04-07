import http from 'http';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';

const BASE_URL = 'http://localhost:5000';
const TOTAL_REQUESTS = 3;
const MAX_OCR_TIME = 5; // seconds
const MAX_HARD_LIMIT = 15; // seconds
const SUCCESS_THRESHOLD = 0.95; // 95%

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
    let successCount = 0;
    let totalDuration = 0;
    let failedChecks = 0;

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const start = Date.now();
        const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
        const end = Date.now();
        const duration = (end - start) / 1000;
        totalDuration += duration;

        if (duration <= MAX_OCR_TIME) {
            successCount++;
        } else if (duration > MAX_HARD_LIMIT) {
            console.error(`Check ${i + 1} FAILED: Took ${duration.toFixed(2)}s (exceeded 15s limit)`);
            failedChecks++;
        } else {
            console.warn(`Check ${i + 1} WARNING: Took ${duration.toFixed(2)}s (exceeded 5s but within 15s)`);
        }
    }

    const successRate = successCount / TOTAL_REQUESTS;
    const avgTime = totalDuration / TOTAL_REQUESTS;
    console.log(`\nOCR Performance Summary:`);
    console.log(`Success rate (≤5s): ${(successRate * 100).toFixed(2)}%`);
    console.log(`Average processing time: ${avgTime.toFixed(2)}s`);
    console.log(`Failed checks (over 15s): ${failedChecks}`);

    if (successRate >= SUCCESS_THRESHOLD && failedChecks === 0) {
        console.log("testOCRPerformance PASSED!");
    } else {
        console.error("testOCRPerformance FAILED!");
    }
}


async function testRequestWithAppTypeJson() {
    console.log("Testing with JSON content type...");
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
    console.log(`\nTest completed.`);
    console.log(`Success rate: ${(successful / TOTAL_REQUESTS * 100).toFixed(2)}%`);
    console.log(`Average request time: ${averageTime.toFixed(2)} ms`);
}

async function testRequestWithAppTypeXml() {
    console.log("Testing with XML content type...");
    let successful = 0;
    let totalDuration = 0;
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/createCheck',
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
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
    console.log(`\nTest completed.`);
    console.log(`Success rate: ${(successful / TOTAL_REQUESTS * 100).toFixed(2)}%`);
    console.log(`Average request time: ${averageTime.toFixed(2)} ms`);
}

async function testRequestWithAppTypeYaml() {
    console.log('Testing with YAML content type...');
    let successful = 0;
    let totalDuration = 0;
    for (let i = 0; i < TOTAL_REQUESTS; i++) {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/createCheck',
            method: 'POST',
            headers: { 'Content-Type': 'application/yaml' },
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
    console.log(`\nTest completed.`);
    console.log(`Success rate: ${(successful / TOTAL_REQUESTS * 100).toFixed(2)}%`);
    console.log(`Average request time: ${averageTime.toFixed(2)} ms`);
}

(async () => {
    await testRequestPerformance();
    await testOCRPerformance();
    await testRequestWithAppTypeJson();
    await testRequestWithAppTypeXml();
    await testRequestWithAppTypeYaml();
})();


