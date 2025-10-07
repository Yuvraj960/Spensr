let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Food', icon: '🍔', color: '#FF6B6B', type: 'expense' },
    { id: 2, name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense' },
    { id: 3, name: 'Entertainment', icon: '🎬', color: '#45B7D1', type: 'expense' },
    { id: 4, name: 'Salary', icon: '💰', color: '#96CEB4', type: 'income' },
    { id: 5, name: 'Shopping', icon: '🛍️', color: '#FFEAA7', type: 'expense' }
];
let savings = JSON.parse(localStorage.getItem('savings')) || {};

// Save data to localStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('savings', JSON.stringify(savings));
}

// Get transactions with filters
function getFilteredTransactions(filters = {}) {
    return transactions.filter(transaction => {
        let matches = true;

        if (filters.category && transaction.category !== filters.category) {
            matches = false;
        }
        if (filters.type && transaction.type !== filters.type) {
            matches = false;
        }
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            matches = matches && (
                transaction.note.toLowerCase().includes(searchTerm) ||
                transaction.category.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
            matches = false;
        }
        if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
            matches = false;
        }

        return matches;
    });
}

// Calculate totals
function calculateTotals() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        income,
        expenses,
        savings: income - expenses,
        transactionCount: transactions.length
    };
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}