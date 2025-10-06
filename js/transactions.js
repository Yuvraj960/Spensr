// Transactions Page Functions

let currentTransactionPage = 1;
const transactionsPerPage = 10;
let currentFilters = {};
let editingTransactionId = null;

function initTransactions() {
    setupTransactionEventListeners();
    populateCategoryFilters();
    renderTransactions();
}

function setupTransactionEventListeners() {
    // Add transaction button
    document.getElementById('addTransactionBtn').addEventListener('click', () => {
        showTransactionModal();
    });

    // Search and filter inputs
    document.getElementById('searchInput').addEventListener('input', handleFilterChange);
    document.getElementById('categoryFilter').addEventListener('change', handleFilterChange);
    document.getElementById('typeFilter').addEventListener('change', handleFilterChange);
    document.getElementById('startDateFilter').addEventListener('change', handleFilterChange);
    document.getElementById('endDateFilter').addEventListener('change', handleFilterChange);
    
    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    // Modal events
    document.getElementById('closeModal').addEventListener('click', () => hideModal('transactionModal'));
    document.getElementById('cancelTransaction').addEventListener('click', () => hideModal('transactionModal'));
    
    // Transaction form
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // Transaction type toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCategoryOptions(btn.dataset.type);
        });
    });
}

function handleFilterChange() {
    currentFilters = {
        search: document.getElementById('searchInput').value,
        category: document.getElementById('categoryFilter').value,
        type: document.getElementById('typeFilter').value,
        startDate: document.getElementById('startDateFilter').value,
        endDate: document.getElementById('endDateFilter').value
    };
    currentTransactionPage = 1;
    renderTransactions();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';
    currentFilters = {};
    currentTransactionPage = 1;
    renderTransactions();
}

function populateCategoryFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = `${category.icon} ${category.name}`;
        categoryFilter.appendChild(option);
    });
}

function renderTransactions() {
    const filteredTransactions = getFilteredTransactions(currentFilters);
    const startIndex = (currentTransactionPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    const container = document.getElementById('transactionsList');
    
    if (pageTransactions.length === 0) {
        container.innerHTML = '<div class="no-data">No transactions found</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    container.innerHTML = pageTransactions.map(transaction => {
        const category = categories.find(c => c.name === transaction.category);
        const icon = category ? category.icon : '💰';
        const isIncome = transaction.type === 'income';
        
        return `
            <div class="transaction-card" data-id="${transaction.id}">
                <div class="transaction-icon" style="background-color: ${category?.color || '#8E8E93'}">
                    ${icon}
                </div>
                <div class="transaction-details">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-note">${transaction.note || 'No note'}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${formatDate(transaction.date)}</span>
                        <span class="transaction-method">${transaction.paymentMethod}</span>
                    </div>
                </div>
                <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="btn-icon edit-btn" onclick="editTransaction('${transaction.id}')">✏️</button>
                    <button class="btn-icon delete-btn" onclick="deleteTransactionConfirm('${transaction.id}')">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination(filteredTransactions.length);
}

function renderPagination(totalTransactions) {
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentTransactionPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToTransactionPage(${currentTransactionPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentTransactionPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="goToTransactionPage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentTransactionPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="goToTransactionPage(${currentTransactionPage + 1})">Next</button>`;
    }
    
    container.innerHTML = paginationHTML;
}

function goToTransactionPage(page) {
    currentTransactionPage = page;
    renderTransactions();
}

function updateCategoryOptions(type) {
    const categorySelect = document.getElementById('transactionCategory');
    categorySelect.innerHTML = '';
    
    const filteredCategories = type ? categories.filter(c => c.type === type) : categories;
    
    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = `${category.icon} ${category.name}`;
        categorySelect.appendChild(option);
    });
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const activeTypeBtn = document.querySelector('.type-btn.active');
    
    const transactionData = {
        id: editingTransactionId || generateId(),
        type: activeTypeBtn.dataset.type,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        date: document.getElementById('transactionDate').value,
        paymentMethod: document.getElementById('transactionPaymentMethod').value,
        note: document.getElementById('transactionNote').value || ''
    };
    
    if (editingTransactionId) {
        const index = transactions.findIndex(t => t.id === editingTransactionId);
        transactions[index] = transactionData;
        showToast('Transaction updated successfully!');
    } else {
        transactions.push(transactionData);
        showToast('Transaction added successfully!');
    }
    
    saveData();
    hideModal('transactionModal');
    renderTransactions();
    
    if (currentPage === 'dashboard') {
        updateDashboardStats();
        updateDashboardCharts();
        updateRecentTransactions();
    }
    
    editingTransactionId = null;
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    editingTransactionId = id;
    populateTransactionForm(transaction);
    showTransactionModal(transaction);
}

function populateTransactionForm(transaction) {
    // Set transaction type
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === transaction.type);
    });
    
    // Update category options for the selected type
    updateCategoryOptions(transaction.type);
    
    // Fill form fields
    document.getElementById('transactionAmount').value = transaction.amount;
    document.getElementById('transactionCategory').value = transaction.category;
    document.getElementById('transactionDate').value = transaction.date;
    document.getElementById('transactionPaymentMethod').value = transaction.paymentMethod;
    document.getElementById('transactionNote').value = transaction.note || '';
}

function clearTransactionForm() {
    document.getElementById('transactionForm').reset();
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === 'expense');
    });
    updateCategoryOptions('expense');
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
}

function deleteTransactionConfirm(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    document.getElementById('deleteMessage').textContent = 
        `Are you sure you want to delete this ${transaction.type} of ${formatCurrency(transaction.amount)}?`;
    
    document.getElementById('confirmDelete').onclick = () => deleteTransaction(id);
    showModal('deleteModal');
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    hideModal('deleteModal');
    renderTransactions();
    showToast('Transaction deleted successfully!');
    
    if (currentPage === 'dashboard') {
        updateDashboardStats();
        updateDashboardCharts();
        updateRecentTransactions();
    }
}