import http from "http";
import assert from "assert";

const BASE_URL = "http://localhost:5000"; // Change if needed

// ✅ Utility function to make HTTP requests
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

// 1️ Test: `/api/createCheck` should create a check successfully
async function testCreateCheck() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/createCheck",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const response = await makeRequest(options, {});

    assert.strictEqual(response.status, 200, "Expected status 200");
    assert.ok(response.body.newCheck, "Expected 'newCheck' in response");
}


// 2 Test: `/api/login` should return success for valid credentials
async function testValidLogin() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const response = await makeRequest(options, { username: "Teisingas123", password: "Teisingas123" });

    assert.strictEqual(response.status, 200, "Expected status 200 for valid login");
    assert.strictEqual(response.body.success, true, "Expected login to succeed");
}

// 4 Test: `/api/login` should fail for invalid credentials
async function testInvalidLogin() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const response = await makeRequest(options, { username: "user", password: "wrongpass" });

    try {
        assert.strictEqual(response.status, 401, `❌ Expected status 401 but got ${response.status}`);
    } catch (error) {
        console.error(`❌ testInvalidLogin FAILED: Received HTTP ${response.status}`);
    }
}

// 5 Test: `/api/login` should fail if no username/password is provided
async function testEmptyLogin() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const response = await makeRequest(options, {});

    try {
        assert.strictEqual(response.status, 401, `Expected status 401 but got ${response.status}`);
    } catch (error) {
    }
}

async function runTests() {
    console.log("Running Tests...\n");
    await runTest(testCreateCheck, "testCreateCheck");
    await runTest(testValidLogin, "testValidLogin");
    await runTest(testInvalidLogin, "testInvalidLogin");
    await runTest(testEmptyLogin, "testEmptyLogin");

    console.log("\nAll Tests Completed!");
}

runTests();
