// notifications.js

// Функция для запроса разрешения на уведомления
function requestNotificationPermission() {
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission !== "granted") {
                console.warn("Notification permission denied.");
            }
        });
    }
}

// Функция для отображения уведомления
function showNotification(title, body) {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: body,
            icon: '1img.gif',  // Укажите путь к иконке уведомления (необязательно)
            tag: 'task-notification',  // Используется для замены существующего уведомления
        });

        notification.onclick = function () {
            window.focus();  // При клике на уведомление фокусируется на текущем окне
            notification.close();
        };
    } else {
        // В случае, если уведомления не доступны, используем fallback
        alert(`${title}\n${body}`);
    }
}

// Функция для проверки задач и отправки уведомлений
function checkTasksForNotifications() {
    const now = new Date();
    
    // Находим все карточки задач на странице
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(taskCard => {
        // Извлекаем информацию о задаче из DOM
        const title = taskCard.querySelector('h3')?.textContent;
        const deadlineText = taskCard.querySelector('p')?.textContent;  // Пример: "Deadline: 2024-12-01"
        
        if (!title || !deadlineText) return;

        // Извлекаем дату дедлайна из строки
        const deadlineMatch = deadlineText.match(/Deadline: (\d{4}-\d{2}-\d{2})/);
        if (!deadlineMatch) return;

        const taskDeadline = new Date(deadlineMatch[1]);
        console.log(taskDeadline);
        // Проверяем, если дата задачи совпадает с сегодняшним днем
        if (taskDeadline.getFullYear() === now.getFullYear() &&
            taskDeadline.getMonth() === now.getMonth() ||
            taskDeadline.getDate() === now.getDate()) {
            
            // Если задача на сегодня, отправляем уведомление
            showNotification(
                `Task Reminder: ${title}`,  // Заголовок уведомления
                `Your task "${title}" is due today. Deadline: ${taskDeadline.toDateString()}.`
            );
        }
    });
}

// Функция для инициализации уведомлений и проверки задач
function initNotifications() {
    requestNotificationPermission();  // Запросить разрешение на уведомления
    checkTasksForNotifications();  // Проверка задач на уведомления
}

// Интервал для периодической проверки задач (каждые 10 минут)
setInterval(() => {
    initNotifications();  // Периодическая проверка задач
}, 60 * 1000);  // Интервал 10 минут

// Проверка уведомлений при запуске
window.onload = () => {
    initNotifications();
};
