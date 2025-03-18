import http from "http";
import assert from "assert";

const BASE_URL = "http://localhost:5000";

// Helper function to make HTTP requests
function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (error) {
                    console.error("❌ JSON Parsing Error:", error.message);
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
        console.log(`✅ ${testName} PASSED!`);
    } catch (error) {
        console.error(`❌ ${testName} FAILED:`, error.message);
    }
}

// Test: Password less than 12 characters should return validation error
async function testPasswordValidation() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/register",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "testuser", password: "short" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 400, `Expected status 400 but got ${response.status}`);
    assert.strictEqual(response.body.message, "Password must be at least 12 characters long.", "Expected password validation error message");
}

// Test: Successful registration should return 201
async function testSuccessfulRegistration() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/register",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "user13", password: "validpassword123" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 201, `Expected status 201 but got ${response.status}`);
}

// Test: Registration with an existing username should return error
async function testExistingUsername() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/register",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "existinguser", password: "validpassword123" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 400, `Expected status 400 but got ${response.status}`);
    assert.strictEqual(response.body.message, "Username is already taken.", "Expected username existence error");
}


// Test: Network failure scenario
async function testNetworkFailure() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/register",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    try {
        // Simulating network failure
        await makeRequest(options, {});
        assert.fail("Expected network failure but request succeeded.");
    } catch (error) {
        assert.ok(error, "Expected network error.");
    }
}


// Run all tests
async function runTests() {
    console.log("🚀 Running Tests...\n");

    await runTest(testPasswordValidation, "testPasswordValidation");
    await runTest(testSuccessfulRegistration, "testSuccessfulRegistration");
    await runTest(testExistingUsername, "testExistingUsername");
    await runTest(testNetworkFailure, "testNetworkFailure");

    console.log("\nALL TESTS COMPLETED!");
}

runTests();
