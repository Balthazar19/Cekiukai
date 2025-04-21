document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutBtn = document.getElementById("logout");
    const addExpenseBtn = document.getElementById("add-expense");
    const checkCountElement = document.getElementById("check-count");
    const totalExpensesElement = document.getElementById("total-expenses");
    const latestCheckElement = document.getElementById("latest-check");
    const monthSelector = document.getElementById("month");
    const addItemsBtn = document.getElementById("addDummyItemsBtn");
    const editTextarea = document.getElementById("edit-check-textarea");
    const editBtn = document.getElementById("edit-check-btn");
    const editStatus = document.getElementById("edit-check-status");

    const user = JSON.parse(localStorage.getItem("user"));

    let latestCheck = null;
    let currentChecks = [];
    let selectedMonthValue = -1;

    if (user && user.username) {
        welcomeMessage.textContent = `Sveikas, ${user.username}!`;

        if (user.userId) {
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

    monthSelector.addEventListener('change', () => {
        selectedMonthValue = parseInt(monthSelector.value);
        calculateMonthlySpending(currentChecks, selectedMonthValue);
    });

    addItemsBtn.addEventListener("click", () => {
        if (!latestCheck) {
            alert("Nėra naujausio čekio!");
            return;
        }

        // Pridedam prie sąrašo
        currentChecks.push(latestCheck);

        // Atnaujinam išlaidas pagal pasirinktą mėnesį
        calculateMonthlySpending(currentChecks, selectedMonthValue);

        // Pašalinam iš naujausio rodymo
        latestCheckElement.innerHTML = "✅ Čekis pridėtas prie išlaidų.";
        editTextarea.style.display = "none";
        editBtn.style.display = "none";
        latestCheck = null;
    });

    async function getUserChecks(username) {
        try {
            const response = await fetch(`http://localhost:5000/api/checks?username=${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`Klaida gavus čekius: ${response.statusText}`);

            const checks = await response.json();
            if (checks.length > 0) {
                checkCountElement.textContent = `Jūs turite ${checks.length} čekius.`;

                // Renkamės naujausią
                latestCheck = checks.reduce((a, b) =>
                    new Date(a.createdAt) > new Date(b.createdAt) ? a : b
                );

                // Visi be naujausio
                currentChecks = checks.filter(check => check.id !== latestCheck.id);

                calculateMonthlySpending(currentChecks, selectedMonthValue);
                displayLatestCheck();
            } else {
                checkCountElement.textContent = "Neturite čekių.";
                totalExpensesElement.textContent = "Išlaidos: €0.00";
                latestCheckElement.textContent = "Naujausio čekio nėra.";
            }
        } catch (error) {
            console.error("Įvyko klaida gaunant čekius:", error);
        }
    }

    function calculateMonthlySpending(checks, selectedMonth = -1) {
        const now = new Date();
        const currentYear = now.getFullYear();

        let filteredChecks = [];

        if (selectedMonth === -1) {
            filteredChecks = checks;
        } else {
            filteredChecks = checks.filter(check => {
                const checkDate = new Date(check.createdAt);
                return checkDate.getMonth() === selectedMonth &&
                       checkDate.getFullYear() === currentYear;
            });
        }

        const total = filteredChecks.reduce((sum, check) => sum + check.totalPrice, 0);
        totalExpensesElement.textContent = `Išlaidos: €${total.toFixed(2)}`;
    }

    function displayLatestCheck() {
        if (!latestCheck) {
            latestCheckElement.textContent = "Naujausio čekio nėra.";
            return;
        }

        const productList = latestCheck.products.map(p => `- ${p.name} (€${p.price.toFixed(2)})`).join("<br>");

        latestCheckElement.innerHTML = `
            <strong>Data:</strong> ${new Date(latestCheck.createdAt).toLocaleString()}<br>
            <strong>Iš viso:</strong> €${latestCheck.totalPrice.toFixed(2)}<br>
            <strong>Produktai:</strong><br>${productList}
        `;

        editTextarea.style.display = "block";
        editTextarea.value = JSON.stringify({ products: latestCheck.products, totalPrice: latestCheck.totalPrice }, null, 2);
        editBtn.style.display = "inline-block";
        editStatus.textContent = "";

        editBtn.onclick = async () => {
            let updatedData;
            try {
                updatedData = JSON.parse(editTextarea.value);
            } catch (err) {
                editStatus.textContent = "❌ Klaida: Neteisingas JSON formatas.";
                editStatus.style.color = "red";
                return;
            }

            if (!Array.isArray(updatedData.products) || typeof updatedData.totalPrice !== "number") {
                editStatus.textContent = "❌ JSON turi turėti 'products' (array) ir 'totalPrice' (number)";
                editStatus.style.color = "red";
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/updateCheck/${latestCheck.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData)
                });

                const result = await response.json();

                if (response.ok) {
                    editStatus.textContent = "✅ Čekis atnaujintas sėkmingai!";
                    editStatus.style.color = "green";
                    latestCheck = {
                        ...latestCheck,
                        products: updatedData.products,
                        totalPrice: updatedData.totalPrice
                    };
                    displayLatestCheck(); // perkraunam vaizdą
                } else {
                    editStatus.textContent = result.error || "❌ Nepavyko atnaujinti čekio.";
                    editStatus.style.color = "red";
                }
            } catch (err) {
                console.error(err);
                editStatus.textContent = "❌ Klaida jungiantis prie serverio.";
                editStatus.style.color = "red";
            }
        };
    }
});
