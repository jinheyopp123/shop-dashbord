// app.js

// 모듈 임포트
import { initializeCharts } from './charts.js';
import { setupEventListeners } from './events.js';
import { loadUserData } from './userData.js';

// 메인 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeDashboard();
    } catch (error) {
        console.error('대시보드 초기화 오류:', error);
    }
});

function initializeDashboard() {
    try {
        loadUserData();
        initializeCharts();
        setupEventListeners();
        console.log('대시보드가 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('대시보드 설정 오류:', error);
    }
}

export { initializeDashboard };
