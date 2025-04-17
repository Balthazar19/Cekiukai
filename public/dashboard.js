document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutBtn = document.getElementById("logout");
    const addExpenseBtn = document.getElementById("add-expense");
    const checkCountElement = document.getElementById("check-count");
    const totalExpensesElement = document.getElementById("total-expenses");
    const monthSelector = document.getElementById("month");

    const user = JSON.parse(localStorage.getItem("user"));

    // Jei vartotojas yra prisijungęs
    if (user && user.username) {
        welcomeMessage.textContent = `Sveikas, ${user.username}!`;

        if (user.userId) {
            // Čekių rodymas
            getUserChecks(user.username);
        } else {
            console.error("Vartotojas neturi ID!");
        }

    } else {
        window.location.href = "login.html";
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });

    addExpenseBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Funkcija, kuri gauna ir atspausdina čekius
    async function getUserChecks(username) {
        try {
            const response = await fetch(`http://localhost:5000/api/checks?username=${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Klaida gavus čekius: ${response.statusText}`);
            }

            const checks = await response.json();

            if (checks && checks.length > 0) {
                checkCountElement.textContent = `Jūs turite ${checks.length} čekius.`;
                calculateMonthlySpending(checks); // Pirmiausia apskaičiuojame mėnesio išlaidas

                // Stebime, kada vartotojas pasirenka mėnesį
                monthSelector.addEventListener('change', () => {
                    const selectedMonth = parseInt(monthSelector.value); // Pasirinktas mėnuo
                    calculateMonthlySpending(checks, selectedMonth);
                });

            } else {
                checkCountElement.textContent = "Neturite čekių.";
            }
        } catch (error) {
            console.error("Įvyko klaida gaunant čekius:", error);
        }
    }

    // Funkcija, kuri apskaičiuoja išlaidas pagal pasirinktą mėnesį
    function calculateMonthlySpending(checks, selectedMonth = -1) {
        const now = new Date();
        const currentYear = now.getFullYear();

        let filteredChecks = [];

        if (selectedMonth === -1) {
            // Jei pasirinktas "Viso", rodome visų čekių sumą
            filteredChecks = checks;
        } else {
            // Filtruojame čekius pagal pasirinktą mėnesį ir šiuos metus
            filteredChecks = checks.filter(check => {
                const checkDate = new Date(check.createdAt);
                return (
                    checkDate.getMonth() === selectedMonth &&
                    checkDate.getFullYear() === currentYear
                );
            });
        }

        // Suskaičiuojame bendrą sumą
        const total = filteredChecks.reduce((sum, check) => sum + check.totalPrice, 0);

        // Atvaizduojame rezultatą DOM'e
        totalExpensesElement.textContent = `Išlaidos: €${total.toFixed(2)}`;
    }
});
