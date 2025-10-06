// Categories Page Functions

function initCategories() {
    setupCategoryEventListeners();
    renderCategories();
}

function setupCategoryEventListeners() {
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        showModal('categoryModal');
        clearCategoryForm();
    });
    
    document.getElementById('closeCategoryModal').addEventListener('click', () => {
        hideModal('categoryModal');
    });
    
    document.getElementById('cancelCategory').addEventListener('click', () => {
        hideModal('categoryModal');
    });
    
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
}

function renderCategories() {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="no-data">No categories found</div>';
        return;
    }
    
    container.innerHTML = categories.map(category => {
        const transactionCount = transactions.filter(t => t.category === category.name).length;
        const totalAmount = transactions
            .filter(t => t.category === category.name)
            .reduce((sum, t) => sum + t.amount, 0);
        
        return `
            <div class="category-card" style="border-left: 4px solid ${category.color}">
                <div class="category-header">
                    <div class="category-icon" style="background-color: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <span class="category-type">${category.type}</span>
                    </div>
                    <div class="category-actions">
                        <button class="btn-icon" onclick="editCategory('${category.id}')">✏️</button>
                        <button class="btn-icon" onclick="deleteCategoryConfirm('${category.id}')">🗑️</button>
                    </div>
                </div>
                <div class="category-stats">
                    <div class="stat-item">
                        <span class="stat-label">Transactions</span>
                        <span class="stat-value">${transactionCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Amount</span>
                        <span class="stat-value">${formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function handleCategorySubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const icon = document.getElementById('categoryIcon').value.trim();
    const color = document.getElementById('categoryColor').value;
    
    // Check if category name already exists
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        showToast('Category name already exists!', 'error');
        return;
    }
    
    const newCategory = {
        id: generateId(),
        name,
        icon,
        color,
        type: 'expense' // Default type
    };
    
    categories.push(newCategory);
    saveData();
    hideModal('categoryModal');
    renderCategories();
    populateCategoryFilters();
    showToast('Category added successfully!');
}

function clearCategoryForm() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryColor').value = '#FF6B6B';
}

function editCategory(id) {
    const category = categories.find(c => c.id == id);
    if (!category) return;
    
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryColor').value = category.color;
    
    showModal('categoryModal');
}

function deleteCategoryConfirm(id) {
    const category = categories.find(c => c.id == id);
    if (!category) return;
    
    const transactionCount = transactions.filter(t => t.category === category.name).length;
    
    if (transactionCount > 0) {
        document.getElementById('deleteMessage').textContent = 
            `This category has ${transactionCount} transactions. Deleting it will remove all associated transactions. Are you sure?`;
    } else {
        document.getElementById('deleteMessage').textContent = 
            `Are you sure you want to delete the category "${category.name}"?`;
    }
    
    document.getElementById('confirmDelete').onclick = () => deleteCategory(id);
    showModal('deleteModal');
}

function deleteCategory(id) {
    const category = categories.find(c => c.id == id);
    if (!category) return;
    
    // Remove all transactions associated with this category
    transactions = transactions.filter(t => t.category !== category.name);
    
    // Remove the category
    categories = categories.filter(c => c.id != id);
    
    saveData();
    hideModal('deleteModal');
    renderCategories();
    populateCategoryFilters();
    showToast('Category deleted successfully!');
    
    // Update dashboard if currently viewing it
    if (currentPage === 'dashboard') {
        updateDashboardStats();
        updateDashboardCharts();
        updateRecentTransactions();
    }
}