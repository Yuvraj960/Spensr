function initSettings() {
    setupSettingsEventListeners();
}

function setupSettingsEventListeners() {
    document.getElementById('settingsThemeToggle').addEventListener('click', toggleTheme);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    // File input for import
    document.getElementById('fileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importData(file);
        }
    });
}