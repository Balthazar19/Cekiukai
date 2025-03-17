document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const registerStatus = document.getElementById("register-status");
    const backToLoginButton = document.getElementById("back-to-login");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Check if the password is at least 12 characters long
        if (password.length < 12) {
            registerStatus.textContent = "Password must be at least 12 characters long!";
            registerStatus.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Display success message
                registerStatus.textContent = "Registration successful!";
                registerStatus.style.color = "green";

                // Display "Back to Login" button
                backToLoginButton.style.display = "block";
            } else {
                registerStatus.textContent = result.message || "Registration failed!";
                registerStatus.style.color = "red";
            }
        } catch (error) {
            console.error("Error during registration:", error);
            registerStatus.textContent = "An error occurred!";
            registerStatus.style.color = "red";
        }
    });

    // Event listener for the "Back to Login" button
    backToLoginButton.addEventListener("click", () => {
        window.location.href = "login.html"; // Redirect to login page
    });
});
