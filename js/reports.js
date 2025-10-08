// Reports Page Functions

function initReports() {
    setupReportsEventListeners();
    setDefaultReportDate();
    generateReport();
}

function setupReportsEventListeners() {
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('reportType').addEventListener('change', generateReport);
    document.getElementById('reportMonth').addEventListener('change', generateReport);
}

function setDefaultReportDate() {
    const currentMonth = new Date().toISOString().substr(0, 7);
    document.getElementById('reportMonth').value = currentMonth;
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = document.getElementById('reportMonth').value;
    
    let reportData;
    
    switch (reportType) {
        case 'weekly':
            reportData = generateWeeklyReport(reportMonth);
            break;
        case 'yearly':
            reportData = generateYearlyReport(reportMonth);
            break;
        default:
            reportData = generateMonthlyReport(reportMonth);
    }
    
    renderReport(reportData, reportType);
}

function generateMonthlyReport(month) {
    const monthTransactions = transactions.filter(t => t.date.substr(0, 7) === month);
    
    const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown = {};
    monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });
    
    const topExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    
    return {
        period: new Date(month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        totalIncome: income,
        totalExpenses: expenses,
        netSavings: income - expenses,
        transactionCount: monthTransactions.length,
        categoryBreakdown,
        topExpenses,
        averageDaily: expenses / new Date(month.split('-')[0], month.split('-')[1], 0).getDate()
    };
}

function generateWeeklyReport(month) {
    // Get current week's transactions
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    const weekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
    });
    
    const income = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return {
        period: `${startOfWeek.toLocaleDateString('en-IN')} - ${endOfWeek.toLocaleDateString('en-IN')}`,
        totalIncome: income,
        totalExpenses: expenses,
        netSavings: income - expenses,
        transactionCount: weekTransactions.length,
        averageDaily: expenses / 7
    };
}

function generateYearlyReport(month) {
    const year = month.split('-')[0];
    const yearTransactions = transactions.filter(t => t.date.substr(0, 4) === year);
    
    const income = yearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = yearTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyBreakdown = {};
    yearTransactions.forEach(t => {
        const month = t.date.substr(0, 7);
        if (!monthlyBreakdown[month]) {
            monthlyBreakdown[month] = { income: 0, expenses: 0 };
        }
        monthlyBreakdown[month][t.type === 'income' ? 'income' : 'expenses'] += t.amount;
    });
    
    return {
        period: year,
        totalIncome: income,
        totalExpenses: expenses,
        netSavings: income - expenses,
        transactionCount: yearTransactions.length,
        monthlyBreakdown,
        averageMonthly: expenses / 12
    };
}

function renderReport(data, type) {
    const container = document.getElementById('reportContent');
    
    let reportHTML = `
        <div class="report-summary">
            <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${data.period}</h2>
            
            <div class="report-stats">
                <div class="report-stat">
                    <div class="stat-icon income">💰</div>
                    <div class="stat-content">
                        <h3>${formatCurrency(data.totalIncome)}</h3>
                        <p>Total Income</p>
                    </div>
                </div>
                
                <div class="report-stat">
                    <div class="stat-icon expense">💸</div>
                    <div class="stat-content">
                        <h3>${formatCurrency(data.totalExpenses)}</h3>
                        <p>Total Expenses</p>
                    </div>
                </div>
                
                <div class="report-stat">
                    <div class="stat-icon ${data.netSavings >= 0 ? 'savings' : 'loss'}">
                        ${data.netSavings >= 0 ? '💎' : '⚠️'}
                    </div>
                    <div class="stat-content">
                        <h3>${formatCurrency(Math.abs(data.netSavings))}</h3>
                        <p>${data.netSavings >= 0 ? 'Net Savings' : 'Net Loss'}</p>
                    </div>
                </div>
                
                <div class="report-stat">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3>${data.transactionCount}</h3>
                        <p>Transactions</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (data.categoryBreakdown) {
        reportHTML += `
            <div class="report-section">
                <h3>Category Breakdown</h3>
                <div class="category-breakdown">
                    ${Object.entries(data.categoryBreakdown)
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, amount]) => {
                            const categoryObj = categories.find(c => c.name === category);
                            const percentage = (amount / data.totalExpenses * 100).toFixed(1);
                            return `
                                <div class="breakdown-item">
                                    <div class="breakdown-category">
                                        <span class="category-icon">${categoryObj?.icon || '💰'}</span>
                                        <span class="category-name">${category}</span>
                                    </div>
                                    <div class="breakdown-amount">
                                        <span class="amount">${formatCurrency(amount)}</span>
                                        <span class="percentage">${percentage}%</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                </div>
            </div>
        `;
    }
    
    if (data.topExpenses) {
        reportHTML += `
            <div class="report-section">
                <h3>Top Expenses</h3>
                <div class="top-expenses">
                    ${data.topExpenses.map((expense, index) => `
                        <div class="expense-item">
                            <span class="expense-rank">#${index + 1}</span>
                            <span class="expense-category">${expense.category}</span>
                            <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                            <span class="expense-date">${formatDate(expense.date)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    reportHTML += `
        <div class="report-insights">
            <h3>Insights</h3>
            <ul class="insights-list">
                <li>Average daily spending: ${formatCurrency(data.averageDaily || 0)}</li>
                ${data.netSavings >= 0 ? 
                    `<li>✅ Great job! You saved ${formatCurrency(data.netSavings)} this ${type}.</li>` :
                    `<li>⚠️ You overspent by ${formatCurrency(Math.abs(data.netSavings))} this ${type}.</li>`
                }
                ${data.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0 ?
                    `<li>Your highest expense category is ${Object.entries(data.categoryBreakdown)
                        .sort(([,a], [,b]) => b - a)[0][0]}</li>` : ''
                }
            </ul>
        </div>
    `;
    
    container.innerHTML = reportHTML;
}