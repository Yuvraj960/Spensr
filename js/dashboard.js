// Dashboard Functions

let categoryChart = null;
let monthlyChart = null;

function initDashboard() {
    updateDashboardStats();
    updateDashboardCharts();
    updateRecentTransactions();
    
    // Add event listener for export button
    document.getElementById('exportBtn').onclick = exportData;
    document.getElementById('themeToggle').onclick = toggleTheme;
}

function updateDashboardStats() {
    const totals = calculateTotals();
    
    document.getElementById('totalIncome').textContent = formatCurrency(totals.income);
    document.getElementById('totalExpenses').textContent = formatCurrency(totals.expenses);
    document.getElementById('totalSavings').textContent = formatCurrency(totals.savings);
    document.getElementById('transactionCount').textContent = totals.transactionCount;
}

function updateDashboardCharts() {
    updateCategoryChart();
    updateMonthlyChart();
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const expensesByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    const colors = labels.map(label => {
        const category = categories.find(c => c.name === label);
        return category ? category.color : '#8E8E93';
    });
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    const monthlyData = {};
    transactions.forEach(t => {
        const month = new Date(t.date).toISOString().substr(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 };
        }
        monthlyData[month][t.type === 'income' ? 'income' : 'expenses'] += t.amount;
    });
    
    const labels = Object.keys(monthlyData).sort();
    const incomeData = labels.map(month => monthlyData[month].income);
    const expenseData = labels.map(month => monthlyData[month].expenses);
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(label => new Date(label).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })),
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#96CEB4',
                    backgroundColor: 'rgba(150, 206, 180, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }
            ]
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

function updateRecentTransactions() {
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    const container = document.getElementById('recentTransactionsList');
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => {
        const category = categories.find(c => c.name === transaction.category);
        const icon = category ? category.icon : '💰';
        const isIncome = transaction.type === 'income';
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-details">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
            </div>
        `;
    }).join('');
}