// ============================================
// БУРГЕР-МЕНЮ
// ============================================

function initBurger() {
    const burgerBtn = document.getElementById('burgerBtn');
    const sidebarNav = document.getElementById('sidebarNav');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!burgerBtn || !sidebarNav) return;

    const toggles = [
        [burgerBtn, 'sidebar__burger--active'],
        [sidebarNav, 'sidebar__nav--open'],
        ...(logoutBtn ? [[logoutBtn, 'sidebar__logout--open']] : [])
    ];

    function setMenu(open) {
        const method = open ? 'add' : 'remove';
        toggles.forEach(([el, cls]) => el.classList[method](cls));
        burgerBtn.setAttribute('aria-expanded', String(open));
    }

    burgerBtn.addEventListener('click', () => {
        setMenu(!sidebarNav.classList.contains('sidebar__nav--open'));
    });

    document.addEventListener('click', (e) => {
        if (sidebarNav.classList.contains('sidebar__nav--open') &&
            !sidebarNav.contains(e.target) &&
            !burgerBtn.contains(e.target)) {
            setMenu(false);
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
        requestAnimationFrame(() => {
            notification.classList.add('notification--visible');
        });
    });

    setTimeout(() => {
        notification.classList.remove('notification--visible');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ВЫХОД
// ============================================
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

// ============================================
// МОДАЛКИ — общие функции
// ============================================
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('modal-overlay--active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('modal-overlay--active');
}

function initModals() {
    let mouseDownTarget = null;

    document.addEventListener('mousedown', (e) => {
        mouseDownTarget = e.target;
    });

    document.addEventListener('mouseup', (e) => {
        if (
            mouseDownTarget &&
            mouseDownTarget.classList.contains('modal-overlay') &&
            e.target.classList.contains('modal-overlay')
        ) {
            e.target.classList.remove('modal-overlay--active');
        }
        mouseDownTarget = null;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay--active')
                .forEach(modal => modal.classList.remove('modal-overlay--active'));
        }
    });
}

// ============================================
// МАСКА ТЕЛЕФОНА
// ============================================
function initPhoneMask() {
    const phoneInput = document.getElementById('companyPhone');
    if (!phoneInput) return;

    phoneInput.setAttribute('autocomplete', 'off');

    // Извлекаем цифры номера (без кода страны), макс 10
    function getDigits(value) {
        let raw = value.replace(/\D/g, '');

        // Если начинается с 7 или 8 — убираем (это код страны)
        if (raw.length > 0 && (raw[0] === '7' || raw[0] === '8')) {
            raw = raw.substring(1);
        }

        return raw.substring(0, 10);
    }

    // Форматируем цифры номера в +7 (XXX) XXX-XX-XX
    function format(digits) {
        if (digits.length === 0) return '+7 (';

        let r = '+7 (';
        for (let i = 0; i < digits.length; i++) {
            if (i === 3) r += ') ';
            if (i === 6) r += '-';
            if (i === 8) r += '-';
            r += digits[i];
        }
        return r;
    }

    // Позиция курсора: после N-й цифры номера в отформатированной строке
    function cursorAfterDigit(formatted, n) {
        if (n <= 0) return 4; // после "+7 ("

        let count = 0;
        // Пропускаем "+7 (" — начинаем считать цифры с позиции 4
        for (let i = 4; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) {
                count++;
                if (count === n) return i + 1;
            }
        }
        return formatted.length;
    }

    // Считаем цифры номера до позиции курсора (игнорируем 7 в "+7")
    function digitsBeforePos(value, pos) {
        let count = 0;
        // Начинаем считать цифры только после позиции 3 (после "+7 ")
        for (let i = 0; i < pos && i < value.length; i++) {
            // Позиции 0,1,2,3 = "+", "7", " ", "(" — пропускаем
            if (i < 4) continue;
            if (/\d/.test(value[i])) {
                count++;
            }
        }
        return count;
    }

    function applyMask() {
        const pos = phoneInput.selectionStart;
        const oldVal = phoneInput.value;

        // Сколько цифр номера до текущего курсора
        const dBefore = digitsBeforePos(oldVal, pos);

        // Пересчитываем
        const digits = getDigits(oldVal);
        const formatted = format(digits);

        phoneInput.value = formatted;

        // Ставим курсор
        const newPos = cursorAfterDigit(formatted, dBefore);
        phoneInput.setSelectionRange(newPos, newPos);
    }

    phoneInput.addEventListener('input', applyMask);

    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value || phoneInput.value.trim() === '') {
            phoneInput.value = '+7 (';
        }
        setTimeout(() => {
            const digits = getDigits(phoneInput.value);
            const formatted = format(digits);
            phoneInput.value = formatted;

            // Курсор в конец
            const pos = formatted.length;
            phoneInput.setSelectionRange(pos, pos);
        }, 0);
    });

    phoneInput.addEventListener('blur', () => {
        const digits = getDigits(phoneInput.value);
        if (digits.length === 0) {
            phoneInput.value = '';
        }
    });

    phoneInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) return;

        const allowed = [
            'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End'
        ];

        if (allowed.includes(e.key)) {
            const start = phoneInput.selectionStart;
            const end = phoneInput.selectionEnd;

            // Backspace: не даём удалять префикс +7 (
            if (e.key === 'Backspace' && start === end) {
                if (start <= 4) {
                    e.preventDefault();
                    return;
                }

                // Если перед курсором не цифра (а скобка, пробел, дефис)
                // — перескакиваем к предыдущей цифре
                const charBefore = phoneInput.value[start - 1];
                if (!/\d/.test(charBefore)) {
                    e.preventDefault();
                    // Ищем предыдущую цифру
                    let newPos = start - 1;
                    while (newPos > 4 && !/\d/.test(phoneInput.value[newPos - 1])) {
                        newPos--;
                    }
                    if (newPos > 4) {
                        // Удаляем эту цифру
                        const before = phoneInput.value.substring(0, newPos - 1);
                        const after = phoneInput.value.substring(newPos);
                        phoneInput.value = before + after;
                        applyMask();
                    }
                    return;
                }
            }

            // Delete: если под курсором не цифра — перескакиваем к следующей
            if (e.key === 'Delete' && start === end) {
                if (start >= phoneInput.value.length) {
                    e.preventDefault();
                    return;
                }

                const charAtPos = phoneInput.value[start];
                if (!/\d/.test(charAtPos)) {
                    e.preventDefault();
                    let newPos = start + 1;
                    while (newPos < phoneInput.value.length && !/\d/.test(phoneInput.value[newPos])) {
                        newPos++;
                    }
                    if (newPos < phoneInput.value.length) {
                        const before = phoneInput.value.substring(0, newPos);
                        const after = phoneInput.value.substring(newPos + 1);
                        phoneInput.value = before + after;
                        applyMask();
                    }
                    return;
                }
            }

            return;
        }

        // Разрешаем только цифры
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        // Лимит 10 цифр
        const digits = getDigits(phoneInput.value);
        const hasSelection = phoneInput.selectionStart !== phoneInput.selectionEnd;
        if (digits.length >= 10 && !hasSelection) {
            e.preventDefault();
        }
    });

    phoneInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const digits = getDigits(pasted);
        phoneInput.value = format(digits);
        const pos = phoneInput.value.length;
        phoneInput.setSelectionRange(pos, pos);
    });

    // Не даём поставить курсор до префикса
    phoneInput.addEventListener('click', () => {
        if (phoneInput.value && phoneInput.selectionStart < 4) {
            const pos = Math.max(4, phoneInput.selectionEnd);
            phoneInput.setSelectionRange(pos, pos);
        }
    });

    // Стрелки: не даём уйти в префикс
    phoneInput.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'Home') {
            if (phoneInput.selectionStart < 4) {
                phoneInput.setSelectionRange(4, 4);
            }
        }
    });
}

// ============================================
// СТРАНИЦА: ЛОГИН
// ============================================
function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('loginError');

        // Заглушка — потом заменим на fetch
        if (username === 'admin' && password === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            errorEl.removeAttribute('hidden');
        }
    });
}

// ============================================
// СТРАНИЦА: DASHBOARD
// ============================================
function initDashboardPage() {
    const countPlatforms = document.getElementById('countPlatforms');
    if (!countPlatforms) return;

    const platforms = JSON.parse(localStorage.getItem('platforms') || '[]');
    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');

    let totalContainers = 0;
    platforms.forEach(p => {
        if (p.containers) {
            p.containers.forEach(c => {
                totalContainers += c.quantity || 0;
            });
        }
    });

    document.getElementById('countPlatforms').textContent = platforms.length;
    document.getElementById('countContainers').textContent = totalContainers;
    document.getElementById('countCompanies').textContent = companies.length;
    document.getElementById('countBuildings').textContent = buildings.length;
}

// ============================================
// СТРАНИЦА: КОМПАНИИ
// ============================================
function initCompaniesPage() {
    const tableBody = document.getElementById('companiesTableBody');
    const emptyState = document.getElementById('emptyState');
    const addBtn = document.getElementById('addCompanyBtn');

    if (!tableBody) return;

    let companies = JSON.parse(localStorage.getItem('companies') || '[]');
    let editingId = null;
    let deletingId = null;

    // Рендер
    function render() {
        if (companies.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.add('empty-state--visible');
            return;
        }

        emptyState.classList.remove('empty-state--visible');
        tableBody.innerHTML = companies.map(c => `
            <tr>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.phone || '—')}</td>
                <td>${escapeHtml(c.email || '—')}</td>
                <td>
                    <div class="card__actions">
                        <button class="btn btn--outline btn--small" type="button" data-edit="${c.id}">
                            ✏️ Изменить
                        </button>
                        <button class="btn btn--danger btn--small" type="button" data-delete="${c.id}">
                            🗑️ Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function save() {
        localStorage.setItem('companies', JSON.stringify(companies));
    }

    // Добавить
    addBtn.addEventListener('click', () => {
        editingId = null;
        document.getElementById('modalTitle').textContent = 'Добавить компанию';
        document.getElementById('companyId').value = '';
        document.getElementById('companyName').value = '';
        document.getElementById('companyPhone').value = '';
        document.getElementById('companyEmail').value = '';
        openModal('companyModal');
    });

    // Отмена
    document.getElementById('cancelCompanyBtn').addEventListener('click', () => {
        closeModal('companyModal');
    });

    // Сохранить
    document.getElementById('companyForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const phoneRaw = document.getElementById('companyPhone').value.trim();

        // Валидация телефона: либо пусто, либо полный номер (10 цифр + код страны = 11)
        if (phoneRaw !== '') {
            const phoneDigits = phoneRaw.replace(/\D/g, '');
            if (phoneDigits.length !== 11) {
                showNotification('Введите полный номер телефона: +7 (XXX) XXX-XX-XX', 'error');
                return;
            }
        }

        const data = {
            name: document.getElementById('companyName').value.trim(),
            phone: phoneRaw,
            email: document.getElementById('companyEmail').value.trim()
        };

        if (editingId) {
            const index = companies.findIndex(c => c.id === editingId);
            companies[index] = { ...companies[index], ...data };
            showNotification('Компания обновлена');
        } else {
            const newId = companies.length > 0
                ? Math.max(...companies.map(c => c.id)) + 1
                : 1;
            companies.push({ id: newId, ...data });
            showNotification('Компания добавлена');
        }

        save();
        closeModal('companyModal');
        render();
    });

    // Делегирование: Изменить / Удалить
    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit]');
        const deleteBtn = e.target.closest('[data-delete]');

        if (editBtn) {
            const id = parseInt(editBtn.dataset.edit);
            const company = companies.find(c => c.id === id);
            if (!company) return;

            editingId = id;
            document.getElementById('modalTitle').textContent = 'Редактировать компанию';
            document.getElementById('companyId').value = id;
            document.getElementById('companyName').value = company.name;
            document.getElementById('companyPhone').value = company.phone || '';
            document.getElementById('companyEmail').value = company.email || '';
            openModal('companyModal');
        }

        if (deleteBtn) {
            deletingId = parseInt(deleteBtn.dataset.delete);
            openModal('deleteModal');
        }
    });

    // Подтверждение удаления
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        companies = companies.filter(c => c.id !== deletingId);
        save();
        closeModal('deleteModal');
        render();
        showNotification('Компания удалена');
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        closeModal('deleteModal');
    });

    render();
}

// ============================================
// СТРАНИЦА: ДОМА
// ============================================
function initBuildingsPage() {
    const tableBody = document.getElementById('buildingsTableBody');
    const emptyState = document.getElementById('emptyState');
    const addBtn = document.getElementById('addBuildingBtn');

    if (!tableBody) return;

    let buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
    let editingId = null;
    let deletingId = null;

    function render() {
        if (buildings.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.add('empty-state--visible');
            return;
        }

        emptyState.classList.remove('empty-state--visible');
        tableBody.innerHTML = buildings.map((b, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(b.address)}</td>
                <td>
                    <div class="card__actions">
                        <button class="btn btn--outline btn--small" type="button" data-edit="${b.id}">
                            ✏️ Изменить
                        </button>
                        <button class="btn btn--danger btn--small" type="button" data-delete="${b.id}">
                            🗑️ Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function save() {
        localStorage.setItem('buildings', JSON.stringify(buildings));
    }

    // Добавить
    addBtn.addEventListener('click', () => {
        editingId = null;
        document.getElementById('modalTitle').textContent = 'Добавить дом';
        document.getElementById('buildingId').value = '';
        document.getElementById('buildingAddress').value = '';
        openModal('buildingModal');
    });

    // Отмена
    document.getElementById('cancelBuildingBtn').addEventListener('click', () => {
        closeModal('buildingModal');
    });

    // Сохранить
    document.getElementById('buildingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const address = document.getElementById('buildingAddress').value.trim();

        // Проверка на дубли
        const duplicate = buildings.find(b =>
            b.address.toLowerCase() === address.toLowerCase() && b.id !== editingId
        );

        if (duplicate) {
            showNotification('Такой адрес уже существует', 'error');
            return;
        }

        if (editingId) {
            const index = buildings.findIndex(b => b.id === editingId);
            buildings[index].address = address;
            showNotification('Дом обновлён');
        } else {
            const newId = buildings.length > 0
                ? Math.max(...buildings.map(b => b.id)) + 1
                : 1;
            buildings.push({ id: newId, address });
            showNotification('Дом добавлен');
        }

        save();
        closeModal('buildingModal');
        render();
    });

    // Делегирование
    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit]');
        const deleteBtn = e.target.closest('[data-delete]');

        if (editBtn) {
            const id = parseInt(editBtn.dataset.edit);
            const building = buildings.find(b => b.id === id);
            if (!building) return;

            editingId = id;
            document.getElementById('modalTitle').textContent = 'Редактировать дом';
            document.getElementById('buildingId').value = id;
            document.getElementById('buildingAddress').value = building.address;
            openModal('buildingModal');
        }

        if (deleteBtn) {
            deletingId = parseInt(deleteBtn.dataset.delete);
            openModal('deleteModal');
        }
    });

    // Подтверждение удаления
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        buildings = buildings.filter(b => b.id !== deletingId);
        save();
        closeModal('deleteModal');
        render();
        showNotification('Дом удалён');
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        closeModal('deleteModal');
    });

    render();
}

// ============================================
// СТРАНИЦА: ПЛОЩАДКИ (список)
// ============================================
function initPlatformsPage() {
    const tableBody = document.getElementById('platformsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!tableBody) return;

    let platforms = JSON.parse(localStorage.getItem('platforms') || '[]');
    let deletingId = null;

    function render() {
        if (platforms.length === 0) {
            tableBody.innerHTML = '';
            emptyState.classList.add('empty-state--visible');
            return;
        }

        emptyState.classList.remove('empty-state--visible');
        tableBody.innerHTML = platforms.map(p => {
            const containersText = (p.containers || [])
                .map(c => `${c.quantity} × ${c.volume} м³`)
                .join(', ') || '—';

            const buildingsText = (p.buildingNames || [])
                .map(name => escapeHtml(name))
                .join('<br>') || '—';

            return `
                <tr>
                    <td>${escapeHtml(p.address)}</td>
                    <td>${p.latitude}, ${p.longitude}</td>
                    <td>${escapeHtml(p.companyName || '—')}</td>
                    <td>${containersText}</td>
                    <td>${buildingsText}</td>
                    <td>
                        <div class="card__actions">
                            <a class="btn btn--outline btn--small" href="platform-form.html?id=${p.id}">
                                ✏️ Изменить
                            </a>
                            <button class="btn btn--danger btn--small" type="button" data-delete="${p.id}">
                                🗑️ Удалить
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function save() {
        localStorage.setItem('platforms', JSON.stringify(platforms));
    }

    // Делегирование
    tableBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('[data-delete]');
        if (deleteBtn) {
            deletingId = parseInt(deleteBtn.dataset.delete);
            openModal('deleteModal');
        }
    });

    // Подтверждение удаления
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        platforms = platforms.filter(p => p.id !== deletingId);
        save();
        closeModal('deleteModal');
        render();
        showNotification('Площадка удалена');
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        closeModal('deleteModal');
    });

    render();
}

// ============================================
// СТРАНИЦА: ФОРМА ПЛОЩАДКИ
// ============================================
function initPlatformFormPage() {
    const form = document.getElementById('platformForm');
    if (!form) return;

    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
    let platforms = JSON.parse(localStorage.getItem('platforms') || '[]');

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id') ? parseInt(urlParams.get('id')) : null;
    let containerRowId = 0;

    // Заголовок
    if (editId) {
        document.getElementById('pageTitle').textContent = 'Редактировать площадку';
    }

    // Заполняем select компаний
    const companySelect = document.getElementById('platformCompany');
    companies.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        companySelect.appendChild(option);
    });

    // Заполняем чеклист домов
    const buildingsList = document.getElementById('buildingsList');
    buildings.forEach(b => {
        const label = document.createElement('label');
        label.className = 'building-checkbox';
        label.innerHTML = `
            <input class="building-checkbox__input" type="checkbox" name="buildings" value="${b.id}">
            <span class="building-checkbox__text">${escapeHtml(b.address)}</span>
        `;
        buildingsList.appendChild(label);
    });

    // Добавить строку контейнера
    function addContainerRow(volume = '', quantity = 1) {
        containerRowId++;
        const list = document.getElementById('containersList');

        const row = document.createElement('div');
        row.className = 'container-row';
        row.id = `container-row-${containerRowId}`;
        row.setAttribute('role', 'listitem');

        const currentId = containerRowId;
        row.innerHTML = `
            <div class="form-group">
                <label class="form-group__label" for="volume-${currentId}">Объём (м³) *</label>
                <input class="form-group__input" type="number" id="volume-${currentId}"
                    name="containerVolume" placeholder="1.1" step="0.01" min="0.01"
                    value="${volume}" required>
            </div>
            <div class="form-group">
                <label class="form-group__label" for="quantity-${currentId}">Количество *</label>
                <input class="form-group__input" type="number" id="quantity-${currentId}"
                    name="containerQuantity" placeholder="1" min="1"
                    value="${quantity}" required>
            </div>
            <button class="container-row__remove" type="button"
                data-remove="${currentId}" aria-label="Удалить контейнер">✕</button>
        `;
        list.appendChild(row);
    }

    // Удаление строки контейнера (делегирование)
    document.getElementById('containersList').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove]');
        if (!removeBtn) return;

        const id = removeBtn.dataset.remove;
        const row = document.getElementById(`container-row-${id}`);
        if (row) row.remove();

        // Если удалили все — добавляем пустую
        if (document.getElementById('containersList').children.length === 0) {
            addContainerRow();
        }
    });

    // Кнопка «Добавить контейнер»
    document.getElementById('addContainerBtn').addEventListener('click', () => {
        addContainerRow();
    });

    // Если редактирование — заполняем форму
    if (editId) {
        const platform = platforms.find(p => p.id === editId);
        if (platform) {
            document.getElementById('platformAddress').value = platform.address || '';
            document.getElementById('platformLat').value = platform.latitude || '';
            document.getElementById('platformLng').value = platform.longitude || '';
            companySelect.value = platform.companyId || '';

            // Контейнеры
            if (platform.containers && platform.containers.length > 0) {
                platform.containers.forEach(c => {
                    addContainerRow(c.volume, c.quantity);
                });
            } else {
                addContainerRow();
            }

            // Дома
            if (platform.buildingIds) {
                platform.buildingIds.forEach(id => {
                    const checkbox = buildingsList.querySelector(`input[value="${id}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } else {
            addContainerRow();
        }
    } else {
        addContainerRow();
    }

    // Сохранение
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Собираем контейнеры
        const volumes = document.querySelectorAll('input[name="containerVolume"]');
        const quantities = document.querySelectorAll('input[name="containerQuantity"]');
        const containers = [];

        for (let i = 0; i < volumes.length; i++) {
            containers.push({
                volume: parseFloat(volumes[i].value),
                quantity: parseInt(quantities[i].value)
            });
        }

        // Собираем дома
        const checkedBoxes = document.querySelectorAll('input[name="buildings"]:checked');
        const buildingIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        const buildingNames = buildingIds.map(id => {
            const b = buildings.find(b => b.id === id);
            return b ? b.address : '';
        });

        // Компания
        const companyId = parseInt(companySelect.value);
        const company = companies.find(c => c.id === companyId);
        const companyName = company ? company.name : '';

        // Валидация
        if (containers.length === 0) {
            showNotification('Добавьте хотя бы один контейнер', 'error');
            return;
        }

        if (buildingIds.length === 0) {
            showNotification('Выберите хотя бы один дом', 'error');
            return;
        }

        const data = {
            address: document.getElementById('platformAddress').value.trim(),
            latitude: parseFloat(document.getElementById('platformLat').value),
            longitude: parseFloat(document.getElementById('platformLng').value),
            companyId,
            companyName,
            containers,
            buildingIds,
            buildingNames
        };

        if (editId) {
            const index = platforms.findIndex(p => p.id === editId);
            platforms[index] = { ...platforms[index], ...data };
            showNotification('Площадка обновлена');
        } else {
            const newId = platforms.length > 0
                ? Math.max(...platforms.map(p => p.id)) + 1
                : 1;
            platforms.push({ id: newId, ...data });
            showNotification('Площадка добавлена');
        }

        localStorage.setItem('platforms', JSON.stringify(platforms));

        setTimeout(() => {
            window.location.href = 'platforms.html';
        }, 800);
    });
}

// ============================================
// УТИЛИТЫ
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initBurger();
    initLogout();
    initModals();
    initPhoneMask();
    initLoginPage();
    initDashboardPage();
    initCompaniesPage();
    initBuildingsPage();
    initPlatformsPage();
    initPlatformFormPage();
});