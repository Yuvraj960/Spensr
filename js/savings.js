let savingsChart = null;

function initSavings() {
    setupSavingsEventListeners();
    updateSavingsDisplay();
    updateSavingsChart();
}

function setupSavingsEventListeners() {
    document.getElementById('saveSalaryBtn').addEventListener('click', saveMonthlySalary);
    document.getElementById('savingsGoalBtn').addEventListener('click', setSavingsGoal);
}

function saveMonthlySalary() {
    const salary = parseFloat(document.getElementById('monthlySalary').value);
    
    if (!salary || salary <= 0) {
        showToast('Please enter a valid salary amount', 'error');
        return;
    }
    
    const currentMonth = new Date().toISOString().substr(0, 7);
    savings.monthlySalary = savings.monthlySalary || {};
    savings.monthlySalary[currentMonth] = salary;
    
    saveData();
    updateSavingsDisplay();
    showToast('Monthly salary saved successfully!');
}

function setSavingsGoal() {
    const goal = parseFloat(document.getElementById('savingsGoal').value);
    
    if (!goal || goal <= 0) {
        showToast('Please enter a valid savings goal', 'error');
        return;
    }
    
    savings.goal = goal;
    saveData();
    updateSavingsDisplay();
    showToast('Savings goal set successfully!');
}

function updateSavingsDisplay() {
    const currentMonth = new Date().toISOString().substr(0, 7);
    const monthlySalary = savings.monthlySalary?.[currentMonth] || 0;
    
    // Calculate current month's expenses
    const currentMonthExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.substr(0, 7) === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const currentSavings = monthlySalary - currentMonthExpenses;
    const savingsPercentage = monthlySalary > 0 ? (currentSavings / monthlySalary * 100) : 0;
    
    document.getElementById('currentSavings').textContent = formatCurrency(currentSavings);
    document.getElementById('savingsPercentage').textContent = `${savingsPercentage.toFixed(1)}%`;
    
    // Update goal progress
    if (savings.goal) {
        const goalProgress = Math.min((currentSavings / savings.goal) * 100, 100);
        document.getElementById('goalProgress').style.width = `${goalProgress}%`;
        
        if (goalProgress >= 100) {
            document.getElementById('goalProgress').style.backgroundColor = '#96CEB4';
        } else if (goalProgress >= 75) {
            document.getElementById('goalProgress').style.backgroundColor = '#FFEAA7';
        } else {
            document.getElementById('goalProgress').style.backgroundColor = '#FF6B6B';
        }
    }
    
    // Set current values in inputs
    document.getElementById('monthlySalary').value = monthlySalary || '';
    document.getElementById('savingsGoal').value = savings.goal || '';
}

function updateSavingsChart() {
    const ctx = document.getElementById('savingsChart').getContext('2d');
    
    if (savingsChart) {
        savingsChart.destroy();
    }
    
    // Get last 6 months of savings data
    const monthlyData = {};
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toISOString().substr(0, 7);
        const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        
        const salary = savings.monthlySalary?.[monthKey] || 0;
        const expenses = transactions
            .filter(t => t.type === 'expense' && t.date.substr(0, 7) === monthKey)
            .reduce((sum, t) => sum + t.amount, 0);
        
        monthlyData[monthName] = salary - expenses;
    }
    
    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);
    
    savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Monthly Savings',
                data,
                borderColor: '#96CEB4',
                backgroundColor: 'rgba(150, 206, 180, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}