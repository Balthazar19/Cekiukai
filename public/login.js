document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginStatus = document.getElementById("login-status");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form from submitting normally

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Mock authentication (Replace this with backend authentication)
        if (username === "admin" && password === "password123") {
            loginStatus.textContent = "Login successful!";
            loginStatus.style.color = "green";
            setTimeout(() => {
                window.location.href = "index.html"; // Redirect after login
            }, 1000);
        } else {
            loginStatus.textContent = "Invalid username or password!";
            loginStatus.style.color = "red";
        }
    });
});