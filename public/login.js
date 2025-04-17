document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginStatus = document.getElementById("login-status");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // 👉 Saugojam vartotojo duomenis į localStorage
                localStorage.setItem('user', JSON.stringify({ 
                    username: result.username, 
                    userId: result.userId 
                }));
                loginStatus.textContent = "Login successful!";
                loginStatus.style.color = "green";

                setTimeout(() => {
                    window.location.href = "dashboard.html"; // 💡 Pataisytas typo čia buvo 'dashboad.html'
                }, 1000);
            } else {
                loginStatus.textContent = "Invalid username or password!";
                loginStatus.style.color = "red";
            }
        } catch (error) {
            console.error("Error during login:", error);
            loginStatus.textContent = "An error occurred!";
            loginStatus.style.color = "red";
        }
    });
});