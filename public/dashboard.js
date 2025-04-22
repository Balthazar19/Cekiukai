document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const logoutBtn = document.getElementById("logout");
    const addExpenseBtn = document.getElementById("add-expense");
    const checkCountElement = document.getElementById("check-count");
    const totalExpensesElement = document.getElementById("total-expenses");
    const latestCheckElement = document.getElementById("latest-check");
    const monthSelector = document.getElementById("month");
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
    
                // Nustatom naujausią
                latestCheck = checks.reduce((a, b) =>
                    new Date(a.createdAt) > new Date(b.createdAt) ? a : b
                );
    
                // Naudojam VISUS čekius (įskaitant naujausią)
                currentChecks = checks;
    
                calculateMonthlySpending(currentChecks, selectedMonthValue); // su visais čekiais
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
        renderCategoryChart(filteredChecks); // <-- pridėta
        
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
                    // Atnaujink latestCheck objektą
                    latestCheck.products = updatedData.products;
                    latestCheck.totalPrice = updatedData.totalPrice;

                    // Atnaujink currentChecks masyvo viduje tą patį čekį
                    const index = currentChecks.findIndex(c => c.id === latestCheck.id);
                    if (index !== -1) {
                        currentChecks[index] = latestCheck;
                    }

                    calculateMonthlySpending(currentChecks, selectedMonthValue);
                    displayLatestCheck(); // palieka rodomą čekį

                    editStatus.textContent = "✅ Čekis sėkmingai atnaujintas.";
                    editStatus.style.color = "green";
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

    let categoryChartInstance = null;

    function renderCategoryChart(checks) {
        const categoryTotals = {};
    
        checks.forEach(check => {
            check.products.forEach(product => {
                const category = product.category || "Kita";
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += product.price;
            });
        });
    
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const totalSum = data.reduce((a, b) => a + b, 0);
    
        const backgroundColors = [
            "#4CAF50", "#FF9800", "#03A9F4", "#E91E63",
            "#9C27B0", "#FF5722", "#8BC34A", "#607D8B",
            "#FFC107", "#00BCD4"
        ];
    
        const ctx = document.getElementById('categoryChart').getContext('2d');
    
        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }
    
        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            generateLabels(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label} (€${value.toFixed(2)})`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
                                        lineWidth: 1,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Išlaidos pagal kategorijas'
                    },
                    datalabels: {
                        display: (context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const value = context.dataset.data[context.dataIndex];
                            const percentage = (value / total) * 100;
                            return percentage >= 3; // rodyti tik jei ≥ 5%
                        },
                        formatter: (value, context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(1);
                            return `${percentage}%`;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 13 // visada toks pats dydis
                        },
                        clamp: true,
                        
                        align: 'start',
                        offset: 4
                    }
                    
                }
            },
            plugins: [ChartDataLabels]
        });
    }
});
