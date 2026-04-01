// ============================================
// БУРГЕР-МЕНЮ
// ============================================
function initBurger() {
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebarNav = document.getElementById('sidebarNav');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!burgerBtn || !sidebarNav) return;

    burgerBtn.addEventListener('click', () => {
        const isOpen = burgerBtn.classList.contains('sidebar__burger--active');

        // Переключаем бургер
        burgerBtn.classList.toggle('sidebar__burger--active');
        burgerBtn.setAttribute('aria-expanded', !isOpen);

        // Переключаем навигацию
        sidebarNav.classList.toggle('sidebar__nav--open');

        // Переключаем кнопку выхода
        if (logoutBtn) {
            logoutBtn.classList.toggle('sidebar__logout--open');
        }
    });
}

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('notification--visible');
    });

    setTimeout(() => {
        notification.classList.remove('notification--visible');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ВЫХОД ИЗ СИСТЕМЫ
// ============================================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        // Потом заменим на fetch('/api/auth/logout')
        window.location.href = 'login.html';
    });
}

// ============================================
// ЗАКРЫТИЕ МОДАЛОК
// ============================================
function initModals() {
    // По клику на оверлей
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('modal-overlay--active');
        }
    });

    // По ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal-overlay--active');
            modals.forEach(modal => modal.classList.remove('modal-overlay--active'));
        }
    });
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    initLogout();
    initModals();
});