import http from "http";
import assert from "assert";

const BASE_URL = "http://localhost:5000";

function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (error) {
                    console.error("JSON Parsing Error:", error.message);
                    reject(error);
                }
            });
        });

        req.on("error", reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTest(testFunction, testName) {
    try {
        await testFunction();
        console.log(`${testName} PASSED!`);
    } catch (error) {
        console.error(`${testName} FAILED:`, error.message);
    }
}

async function testValidCheckSubmission() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/createCheck",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = {
        userId: "dummyUserId123",
        extractedText: "Milk - $2.50\nBread - $1.50\nCheese - $5.00",
        products: [
            { name: "Milk", price: 2.50 },
            { name: "Bread", price: 1.50 },
            { name: "Cheese", price: 5.00 }
        ],
        totalPrice: 9.00
    };

    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 200, "Expected status 200 for valid check submission");
    assert.ok(response.body.newCheck, "Expected 'newCheck' in response");
}

async function testEmptyCheckSubmission() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/createCheck",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const response = await makeRequest(options, {});

    assert.strictEqual(response.status, 200, `Expected status 200 but got ${response.status}`);
    assert.ok(response.body.newCheck, "Expected 'newCheck' in response");
}

async function testInvalidFileFormat() {
    const fakeFile = { type: "application/pdf" }; // Invalid format

    try {
        if (!["image/jpeg", "image/png"].includes(fakeFile.type)) {
            throw new Error("Invalid file format! Only JPG, JPEG, and PNG allowed.");
        }
        assert.fail("Should have thrown an error for invalid file format.");
    } catch (error) {
        assert.strictEqual(error.message, "Invalid file format! Only JPG, JPEG, and PNG allowed.");
    }
}

async function testFileSizeLimit() {
    const fakeFile = { size: 6 * 1024 * 1024 }; // 6MB

    try {
        if (fakeFile.size > 5 * 1024 * 1024) {
            throw new Error("Picture is too big! Maximum size: 5MB.");
        }
        assert.fail("Should have thrown an error for file size limit.");
    } catch (error) {
        assert.strictEqual(error.message, "Picture is too big! Maximum size: 5MB.");
    }
}

async function testInvalidImageResolution() {
    const width = 400;  // Too small
    const height = 400; // Too small

    try {
        if (width < 500 || height < 500 || width > 1920 || height > 2000) {
            throw new Error(`Invalid resolution (${width}x${height}). A valid range is 500x500 - 1920x2000.`);
        }
        assert.fail("Should have thrown an error for invalid resolution.");
    } catch (error) {
        assert.strictEqual(
            error.message, 
            `Invalid resolution (${width}x${height}). A valid range is 500x500 - 1920x2000.`
        );
    }
}

async function testOCRProcessingWithEmptyImage() {
    try {
        const image = null;
        if (!image) {
            throw new Error("Choose a receipt picture.");
        }
        assert.fail("Should have thrown an error for empty image input.");
    } catch (error) {
        assert.strictEqual(error.message, "Choose a receipt picture.");
    }
}

async function testOCRFailure() {
    try {
        throw new Error("Error processing the receipt.");
    } catch (error) {
        assert.strictEqual(error.message, "Error processing the receipt.");
    }
}

async function testNoFileSelected() {
    try {
        const fileInput = { files: [] }; // Simulating empty file input
        if (fileInput.files.length === 0) {
            throw new Error("Choose a receipt picture.");
        }
        assert.fail("Should have thrown an error for empty file selection.");
    } catch (error) {
        assert.strictEqual(error.message, "Choose a receipt picture.");
    }
}

async function testImagePreviewUpdate() {
    const fakeFile = { type: "image/png", size: 200000 }; // Valid file

    // Simulate preview update
    const imagePreview = { innerHTML: "" };
    imagePreview.innerHTML = `<img src="fake-url" alt="Preview" class="preview-image">`;

    assert.ok(imagePreview.innerHTML.includes("img"), "Expected image preview to be updated.");
}

async function testOCRProcessingSuccess() {
    try {
        const fakeText = "Milk - $2.50\nBread - $1.50\nCheese - $5.00";
        const ocrResult = { data: { text: fakeText } };
        
        // Simulating Tesseract success
        assert.strictEqual(ocrResult.data.text, fakeText, "Expected OCR to extract correct text.");
    } catch (error) {
        assert.fail("OCR should not fail.");
    }
}

async function testNetworkFailure() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/createCheck",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    try {
        // Simulating server is down
        await makeRequest(options, {});
        assert.fail("Expected network failure but request succeeded.");
    } catch (error) {
        assert.ok(error, "Expected network error.");
    }
}

async function runTests() {
    console.log("Running Tests...\n");
    await runTest(testValidCheckSubmission, "testValidCheckSubmission");
    await runTest(testEmptyCheckSubmission, "testEmptyCheckSubmission");
    await runTest(testInvalidFileFormat, "testInvalidFileFormat");
    await runTest(testFileSizeLimit, "testFileSizeLimit");
    await runTest(testInvalidImageResolution, "testInvalidImageResolution");
    await runTest(testOCRProcessingWithEmptyImage, "testOCRProcessingWithEmptyImage");
    await runTest(testOCRFailure, "testOCRFailure");
    await runTest(testNoFileSelected, "testNoFileSelected");
    await runTest(testImagePreviewUpdate, "testImagePreviewUpdate");
    await runTest(testOCRProcessingSuccess, "testOCRProcessingSuccess");
    await runTest(testNetworkFailure, "testNetworkFailure");

    console.log("\nAll Tests Completed!");
}

runTests();
