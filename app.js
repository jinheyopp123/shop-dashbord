// app.js

// Module Imports
import { initializeCharts } from './charts.js';
import { setupEventListeners } from './events.js';
import { loadUserData } from './userData.js';

// Main Initialization Function
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    loadUserData();
    initializeCharts();
    setupEventListeners();
    console.log('Dashboard initialized successfully.');
}

export { initializeDashboard };
