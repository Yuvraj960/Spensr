// Main Application Initialization

document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    showLoadingScreen();
    
    // Initialize app after a short delay
    setTimeout(() => {
        initializeApp();
        hideLoadingScreen();
    }, 1500);
});

function showLoadingScreen() {
    document.getElementById('loadingScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function hideLoadingScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
}

function initializeApp() {
    // Load theme
    loadTheme();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize modal event listeners
    initModals();
    
    // Initialize dashboard (default page)
    initDashboard();
    
    // Set today's date as default for transaction form
    document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
}

function initModals() {
    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Delete modal events
    document.getElementById('closeDeleteModal').addEventListener('click', () => {
        hideModal('deleteModal');
    });
    
    document.getElementById('cancelDelete').addEventListener('click', () => {
        hideModal('deleteModal');
    });
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showToast('An error occurred. Please try again.', 'error');
});

// Global functions that need to be accessible from HTML
window.editTransaction = editTransaction;
window.deleteTransactionConfirm = deleteTransactionConfirm;
window.goToTransactionPage = goToTransactionPage;
window.editCategory = editCategory;
window.deleteCategoryConfirm = deleteCategoryConfirm;