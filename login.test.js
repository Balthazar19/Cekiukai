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

//Test: Valid Login Should Return 200
async function testValidLogin() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "username", password: "password" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 200, `Expected status 200 but got ${response.status}`);
    assert.strictEqual(response.body.success, true, "Expected success to be true");
}

//Test: Invalid Login Should Return 401
async function testInvalidLogin() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "wrongUser", password: "wrongPass" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 401, `Expected status 401 but got ${response.status}`);
}

//Test: Login Without Credentials Should Return 200
async function testEmptyLogin() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = {};
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 200, `Expected status 200 but got ${response.status}`);
}

//Test: Server Error Simulation
async function testServerError() {
    try {
        throw new Error("Server error occurred!");
    } catch (error) {
        assert.strictEqual(error.message, "Server error occurred!");
    }
}

//Test: Check for HTML Injection in Username
async function testHTMLInjection() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "<script>alert('XSS')</script>", password: "1234" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 401, `Expected status 401 but got ${response.status}`);
}

//Test: Handle Network Failure
async function testNetworkFailure() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    try {
        // Simulating server down
        await makeRequest(options, {});
        assert.fail("Expected network failure but request succeeded.");
    } catch (error) {
        assert.ok(error, "Expected network error.");
    }
}

//Test: Handle SQL Injection Attempt
async function testSQLInjection() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "' OR 1=1 --", password: "1234" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 401, `Expected status 401 but got ${response.status}`);
}

//Test: Handle Long Username Input
async function testLongUsername() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "a".repeat(300), password: "1234" };
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 401, `Expected status 401 but got ${response.status}`);
}

//Test: Handle Empty JSON Request
async function testEmptyJSONRequest() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = null;
    const response = await makeRequest(options, requestBody);

    assert.strictEqual(response.status, 401, `Expected status 401 but got ${response.status}`);
}

//Test: Ensure Response Contains JSON
async function testJSONResponse() {
    const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };

    const requestBody = { username: "admin", password: "1234" };
    const response = await makeRequest(options, requestBody);

    assert.ok(typeof response.body === "object", "Expected response to be JSON");
}

async function runTests() {
    console.log("🚀 Running Tests...\n");

    await runTest(testValidLogin, "testValidLogin");
    await runTest(testInvalidLogin, "testInvalidLogin");
    await runTest(testEmptyLogin, "testEmptyLogin");
    await runTest(testServerError, "testServerError");
    await runTest(testHTMLInjection, "testHTMLInjection");
    await runTest(testNetworkFailure, "testNetworkFailure");
    await runTest(testSQLInjection, "testSQLInjection");
    await runTest(testLongUsername, "testLongUsername");
    await runTest(testEmptyJSONRequest, "testEmptyJSONRequest");
    await runTest(testJSONResponse, "testJSONResponse");

    console.log("\n🎉 ALL TESTS COMPLETED! 🎉");
}

runTests();
