document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutBtn = document.getElementById("logout");
    const addExpenseBtn = document.getElementById("add-expense");

    // Gauti vartotoją iš localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.username) {
        welcomeMessage.textContent = `Sveikas, ${user.username}!`;
    } else {
        // Jei nėra vartotojo — peradresuoti į login
        window.location.href = "login.html";
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });

    // Pridėti išlaidas mygtuko funkcija
    addExpenseBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
