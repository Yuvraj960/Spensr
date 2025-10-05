// Navigation Functions

let currentPage = 'dashboard';

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });

    // FAB click
    document.getElementById('fab').addEventListener('click', () => {
        showTransactionModal();
    });
}

// Show specific page
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(`${pageName}Page`).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    currentPage = pageName;

    // Initialize page-specific functionality
    switch (pageName) {
        case 'dashboard':
            initDashboard();
            break;
        case 'transactions':
            initTransactions();
            break;
        case 'categories':
            initCategories();
            break;
        case 'savings':
            initSavings();
            break;
        case 'reports':
            initReports();
            break;
        case 'settings':
            initSettings();
            break;
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showTransactionModal(transaction = null) {
    const modal = document.getElementById('transactionModal');
    const title = document.getElementById('modalTitle');
    
    if (transaction) {
        title.textContent = 'Edit Transaction';
        populateTransactionForm(transaction);
    } else {
        title.textContent = 'Add Transaction';
        clearTransactionForm();
    }
    
    showModal('transactionModal');
}