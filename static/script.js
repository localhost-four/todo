// Инициализация переменных
let totalTime = 0;
let editingTime = 0;
let pageVisits = 0;
let editingStartTime = null;
let previousPages = [];

// Функция для обновления времени на странице
function updateStatistics() {
    const totalTimeSpan = document.getElementById('total-time');
    const editingTimeSpan = document.getElementById('editing-time');
    const pageVisitsSpan = document.getElementById('page-visits');
    const lastVisitSpan = document.getElementById('last-visit');

    totalTimeSpan.textContent = totalTime;
    editingTimeSpan.textContent = editingTime;
    pageVisitsSpan.textContent = pageVisits;
    
    const lastVisit = localStorage.getItem('last-visit');
    lastVisitSpan.textContent = lastVisit ? new Date(lastVisit).toLocaleString() : 'Неизвестно';
}

// Функция для начала отслеживания времени редактирования
function startEditing() {
    editingStartTime = Date.now();
}

// Функция для остановки отслеживания времени редактирования
function stopEditing() {
    if (editingStartTime) {
        editingTime += Math.floor((Date.now() - editingStartTime) / 1000); // в секундах
        editingStartTime = null;
    }
}

// Слушаем события на странице для подсчета времени
window.addEventListener('load', () => {
    // Время работы на странице
    const startTime = Date.now();
    let totalTimer = setInterval(() => {
        totalTime = Math.floor((Date.now() - startTime) / 1000); // в секундах
        updateStatistics();
        updateChart();
    }, 1000);

    // Событие при смене страницы
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('last-visit', new Date().toISOString());
        pageVisits++;
        updateStatistics();
    });

    // Запоминаем посещенные страницы
    previousPages.push(window.location.href);
    localStorage.setItem('visited-pages', JSON.stringify(previousPages));

    // Событие начала редактирования
    const textArea = document.querySelector('textarea');
    if (textArea) {
        textArea.addEventListener('focus', startEditing);
        textArea.addEventListener('blur', stopEditing);
    }

    // Обновляем статистику на странице
    updateStatistics();
    updateChart();
});

// Функция для обновления кругового графика
function updateChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');

    const activityChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Время на сайте', 'Время редактирования', 'Прочее'],
            datasets: [{
                data: [totalTime, editingTime, totalTime - editingTime], // Измените логику для учёта других данных
                backgroundColor: ['#4CAF50', '#FF9800', '#f4f4f9'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw + " секунд";
                        }
                    }
                }
            }
        }
    });
}
