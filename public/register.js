document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const registerStatus = document.getElementById("register-status");
    const backToLoginButton = document.getElementById("back-to-login");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        // Username validation
        const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
        if (!usernameRegex.test(username)) {
            registerStatus.textContent = "Username must be 5-20 characters long and can contain only letters, numbers, and underscores.";
            registerStatus.style.color = "red";
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;
        if (!passwordRegex.test(password)) {
            registerStatus.textContent = "Password must be at least 12 characters long, include one uppercase letter, one lowercase letter, and one number.";
            registerStatus.style.color = "red";
            return;
        }

        try {
            // Send registration request directly
            const registerResponse = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await registerResponse.json();

            if (registerResponse.ok && result.success) {
                registerStatus.textContent = "Registration successful! Redirecting to login...";
                registerStatus.style.color = "green";
                
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                registerStatus.textContent = result.message || "Registration failed!";
                registerStatus.style.color = "red";
            }
        } catch (error) {
            console.error("Error during registration:", error);
            registerStatus.textContent = "An error occurred! Please try again later.";
            registerStatus.style.color = "red";
        }
    });

    // Event listener for the "Back to Login" button
    backToLoginButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });
});