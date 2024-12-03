let boards = []; // Массив досок
let boardCounter = 1; // Счётчик досок
let activeBoardId = null; // Активная доска

function themes() {
    // Переключение темы
    if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    saveStateToLocalStorage();
};

// Функция для открытия вкладки новой доски
function openNewBoardTab() {
    addBoard(); // Добавляем новую доску
    renderBoards(); // Перерисовываем доски
    saveStateToURL(); // Сохраняем состояние в URL
}

// Функция для открытия модального окна для добавления новой задачи
function openAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'block'; // Открываем модальное окно
}

// Функция для закрытия модального окна
function closeModal() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'none'; // Закрываем модальное окно
}

// Функция для закрытия модального окна
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'none'; // Закрываем модальное окно
}

// Функция для добавления новой доски
function addBoard() {
    const boardId = `board${boardCounter++}`;
    const newBoard = {
        id: boardId,
        name: `Board ${boardCounter - 1}`,
        emoji: '📝',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        style: 'flex',
        tasks: []
    };

    boards.push(newBoard);
    renderBoards(); // Перерисовываем доски
    saveStateToURL(); // Сохраняем состояние в URL
}

// Функция для рендеринга досок
function renderBoards() {
    const tabsContainer = document.getElementById('tabs');
    const taskContainer = document.getElementById('task-container');
    tabsContainer.innerHTML = '';
    taskContainer.innerHTML = '';

    boards.forEach(board => {
        const tabButton = document.createElement('button');
        tabButton.classList.add('tab');
        tabButton.innerHTML = `${board.emoji} ${board.name}`;
        tabButton.onclick = () => openBoard(board.id);
        tabButton.ondblclick = () => openSettings(board.id);
        tabsContainer.appendChild(tabButton);

        const taskBoard = document.createElement('div');
        taskBoard.id = board.id;
        taskBoard.classList.add('task-board');
        taskBoard.style.backgroundColor = board.backgroundColor;
        taskBoard.style.color = board.textColor;
        taskBoard.style.display = 'none';
        taskBoard.style.display = board.style;
        taskContainer.appendChild(taskBoard);

        renderTasks(board); // Отображаем задачи
    });
}

// Функция для открытия доски
function openBoard(boardId) {
    const selectedBoard = boards.find(board => board.id === boardId);
    const taskBoards = document.querySelectorAll('.task-board');
    taskBoards.forEach(board => {
        if (board.id === boardId) {
            board.style.display = selectedBoard.style;
        } else {
            board.style.display = 'none';
        }
    });
    activeBoardId = boardId;
}

// Функция для добавления задачи
function addTask() {
    const title = document.getElementById('taskTitle').value;
    const deadline = document.getElementById('taskDeadline').value;
    const description = document.getElementById('taskDescription').value;
    const imageUrl = document.getElementById('taskImageUrl').value;
    const link = document.getElementById('taskLink').value;
    const priority = document.getElementById('taskPriority').value;

    // Проверка, что обязательные поля заполнены
    if (!title || !deadline) {
        alert('Please fill out both title and deadline!');
        return;
    }

    // Проверяем, что введенная строка является валидным URL изображения
    const isValidImageUrl = imageUrl && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null);

    if (imageUrl && !isValidImageUrl) {
        alert('Please provide a valid image URL!');
        return;
    }

    const task = {
        id: `task${Date.now()}`,
        title,
        deadline,
        description,
        imageUrl, // Сохраняем только URL изображения
        link,
        priority,
        comments: [], 
    };

    const board = boards.find(b => b.id === activeBoardId);
    if (!board) {
        alert('Board not found');
        return;
    }

    board.tasks.push(task);
    renderBoards();
    closeModal();
    saveStateToURL(); // Сохраняем состояние в URL

}


// Функция для редактирования задачи
function editTask(boardId, taskId) {
    const board = boards.find(b => b.id === boardId);
    const task = board.tasks.find(t => t.id === taskId);

    if (task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskDeadline').value = task.deadline;
        document.getElementById('taskImageUrl').value = task.imageUrl;
        document.getElementById('taskLink').value = task.link;
        document.getElementById('taskPriority').value = task.priority;
        openAddTaskModal();  // Открываем модальное окно с данными для редактирования
    }
}

// Функция для удаления задачи
function deleteTask(boardId, taskId) {
    const board = boards.find(b => b.id === boardId);
    if (board) {
        board.tasks = board.tasks.filter(task => task.id !== taskId);
        renderBoards();
        saveStateToURL();
    }
}

// Функция для удаления доски
function deleteBoard(boardId) {
    boards = boards.filter(board => board.id !== boardId);
    renderBoards();
    saveStateToURL();
}

function renderTasks(board) {
    const taskBoard = document.getElementById(board.id);
    taskBoard.innerHTML = '';

    // Сортируем задачи по приоритету и дате
    board.tasks.sort((a, b) => {
        if (a.priority !== b.priority) {
            return b.priority - a.priority; // По убыванию приоритета
        }
        return new Date(a.deadline) - new Date(b.deadline); // По возрастанию даты
    });

    board.tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Deadline: ${task.deadline}</p>
            <p>Priority: ${task.priority}</p>
            <button onclick="openCommentModal('${board.id}', '${task.id}')">💬Add</button>
            <button onclick="editTask('${board.id}', '${task.id}')">🔁Rep</button>
            <button onclick="deleteTask('${board.id}', '${task.id}')">🗑Del</button>
            <button onclick="deleteBoard('${board.id}')">✖All</button>
            <div class="comments">
                ${task.comments.map(comment => {
                    let commentHtml = `<p>${comment.text || ''}</p>`;
                    if (comment.imageUrl) {
                        // Если есть картинка по URL
                        commentHtml += `<img src="${comment.imageUrl}" alt="Image" class="file-preview" />`;
                    }
                    return commentHtml;
                }).join('')}
            </div>
            ${task.imageUrl ? `<img src="${task.imageUrl}" alt="Image" class="file-preview" />` : ''}
            ${task.link ? `<a href="${task.link}" target="_blank">Open Link</a>` : ''}
        `;
        taskBoard.appendChild(taskCard);
    });
}



// Функция для предпросмотра файла
function renderFilePreview(file) {
    if (file && file.type && file.type.startsWith('image')) {
        return `<img src="${URL.createObjectURL(file)}" alt="Image Preview" class="file-preview" />`;
    }
    if (file && file.type === 'image/svg+xml') {
        return `<object data="${URL.createObjectURL(file)}" type="image/svg+xml" class="file-preview"></object>`;
    }
    return `<p>File: ${file.name}</p>`;
}



// Функция для сохранения состояния в LocalStorage
function saveStateToLocalStorage() {
    const state = {
        boards,
        activeBoardId,
        theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    };
    localStorage.setItem('todoAppState', JSON.stringify(state));
}

// notifications.js


// Функция для добавления сообщения на страницу
function displayMessage(mess) {
    var message = document.createElement('div');
    message.innerText = JSON.stringify(mess);
    message.style.position = 'fixed';
    message.style.top = '0';
    message.style.left = '15%';
    message.style.transform = 'translateX(-100%)';
    message.style.background = 'lightblue';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9998';
    message.style.transition = 'all 0.5s ease';
    
    document.body.appendChild(message);
    
    setTimeout(function() {
        message.style.top = '-100px';
        try {
            document.getElementsByTagName("title")[0].innerHTML = mess;
        } catch(n) {
            document.title = mess;
        }
        setTimeout(function() {
            message.remove();
            try {
                document.getElementsByTagName("title")[0].innerHTML = 'Plugin';
            } catch(n) {
                document.title = 'Plugin';
            }
        }, 500);
    }, 2600);
    
    var messages = document.querySelectorAll('div');
    messages.forEach(function(msg, index) {
        msg.style.transform = 'translateX(' + (messages.length - index) * 300 + 'px)';
    });
}

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

// Функция для отображения уведомлений
function showNotification(title, body) {
    try {
        const notification = new Notification(title, {
            body: body,
            icon: '1img.gif',  // Укажите путь к иконке уведомления (необязательно)
            tag: title,  // Используется для замены существующего уведомления
        });

        notification.onclick = function () {
            window.focus();  // При клике на уведомление фокусируется на текущем окне
            notification.close();
        };
    } catch(n) {
        // В случае, если уведомления не доступны, используем fallback
        try { 
            console.log(n);
            displayMessage(`${title}\n${body}`); 
        } catch(n) { 
            console.log(n);
            alert(`${title}\n${body}`);
        }
    }
}


function checkTasksForNotifications(state) {
    const now = new Date();

    // Получаем завтрашний день
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    // Находим начало текущей недели (воскресенье)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());  // Устанавливаем день недели на воскресенье

    // Находим конец текущей недели (суббота)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);  // Устанавливаем субботу

    // Функция для сортировки задач по приоритету
    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
    };

    // Проверяем каждую доску и задачу
    state.boards.forEach(board => {
        // Сортируем задачи по приоритету перед проверкой
        board.tasks.sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 3;  // По умолчанию low
            const priorityB = priorityOrder[b.priority] || 3;
            return priorityA - priorityB;
        });

        board.tasks.forEach(task => {
            const title = task.title;
            const description = task.description;
            const deadline = task.deadline;  // Дата дедлайна задачи
            
            // Преобразуем строку дедлайна в объект Date
            const taskDeadline = new Date(deadline);

            // Сравниваем только год, месяц и день, игнорируя время
            const isSameDay = now.getMonth() === taskDeadline.getMonth() ||
                              now.getDate() === taskDeadline.getDate();

            // Проверка на завтрашний день
            const isTomorrow = tomorrow.getMonth() === taskDeadline.getMonth() ||
                               tomorrow.getDate() === taskDeadline.getDate();

            // Проверка, если задача в пределах текущей недели
            const isThisWeek = taskDeadline >= startOfWeek && taskDeadline <= endOfWeek;

            // Уведомление, если задача на сегодня, завтра или в пределах текущей недели
            if (isSameDay || isTomorrow || isThisWeek) {
                let notificationMessage = `Your task "${description}" is due on ${taskDeadline.toDateString()}.`;

                if (isTomorrow) {
                    notificationMessage = `Reminder: Tomorrow, your task "${description}". Deadline: ${taskDeadline.toDateString()}.`;
                }

                if (isThisWeek) {
                    notificationMessage = `Reminder: Task "${description}" due this week on ${taskDeadline.toDateString()}.`;
                }

                showNotification(
                    `Task Reminder: ${title}> ${task.priority}`,  // Заголовок уведомления 
                    notificationMessage
                );
            }
        });
    });
}


// Функция для извлечения состояния из URL и парсинга JSON
function getStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    if (stateParam) {
        try {
            const state = JSON.parse(decodeURIComponent(stateParam));
            return state;  // Возвращаем распарсенное состояние
        } catch (error) {
            console.error('Ошибка при парсинге state из URL:', error);
            return null;
        }
    }
    return null;
}



// Функция для инициализации уведомлений на основе состояния из URL
function initNotifications() {
    const state = getStateFromURL();
    if (state) {
        requestNotificationPermission();  // Запросить разрешение на уведомления
        checkTasksForNotifications(state);  // Проверить задачи на уведомления
    } else {
        showNotification(`Welcome back ${navigator.userAgent.split(' ')[0].slice(0, 12)}`, `Glad to see you, workspace is cleaned.`);
    }
}

// Интервал для периодической проверки задач (каждые 10 минут)
setTimeout(() => {
    initNotifications();  // Периодическая проверка задач
}, 2500);  // Интервал 10 минут

// Функция для загрузки состояния из LocalStorage
function loadStateFromLocalStorage() {    
    const state = localStorage.getItem('todoAppState');
    if (state) {
        try {
            const parsedState = JSON.parse(state);
            boards = parsedState.boards || [];
            activeBoardId = parsedState.activeBoardId || null;
            if (parsedState.theme) {
                document.body.classList.add(parsedState.theme === 'dark' ? 'dark-theme' : 'light-theme');
            }
            renderBoards();
        } catch (error) {
            console.error('Error loading state from LocalStorage:', error);
        }
    }

}





// Функция для сохранения состояния в URL
function saveStateToURL() {
    const state = {
        boards,
        activeBoardId,
        theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    };
    const encodedState = encodeURIComponent(JSON.stringify(state));
    window.history.replaceState(null, '', `?state=${encodedState}`);
    saveStateToLocalStorage();
}


// Функция для загрузки состояния из URL
function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const stateParam = params.get('state');

    if (stateParam) {
        try {
            const state = JSON.parse(decodeURIComponent(stateParam));
            boards = state.boards || [];
            activeBoardId = state.activeBoardId || null;
            if (state.theme) {
                document.body.classList.add(state.theme === 'dark' ? 'dark-theme' : 'light-theme');
            }
            renderBoards();
        } catch (error) {
            console.error('Error loading state from URL:', error);
        }
    }
}

// Функция для открытия настроек доски
function openSettings(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    document.getElementById('emojiInput').value = board.emoji;
    document.getElementById('backgroundColorInput').value = board.backgroundColor;
    document.getElementById('textColorInput').value = board.textColor;
    document.getElementById('styleInput').value = board.style;

    const settingsModal = document.getElementById('settingsModal');
    settingsModal.style.display = 'block';
    settingsModal.onclick = (event) => event.stopPropagation(); // Чтобы не закрывался при клике на саму модалку
}

// Функция для применения изменений настроек доски
function applyBoardSettings() {
    const emoji = document.getElementById('emojiInput').value;
    const backgroundColor = document.getElementById('backgroundColorInput').value;
    const textColor = document.getElementById('textColorInput').value;
    const style = document.getElementById('styleInput').value;

    const board = boards.find(b => b.id === activeBoardId);
    if (!board) return;

    board.emoji = emoji;
    board.backgroundColor = backgroundColor;
    board.textColor = textColor;
    board.style = style;

    renderBoards();
    saveStateToURL();
    closeSettings();
}

function openCommentModal(boardId, taskId) {
    const modal = document.getElementById('commentModal');
    const task = boards.find(board => board.id === boardId).tasks.find(task => task.id === taskId);

    if (task) {
        modal.style.display = 'block';

        const saveCommentBtn = document.getElementById('saveCommentBtn');
        saveCommentBtn.onclick = function() {
            const comment = document.getElementById('commentText').value;
            const imageUrl = document.getElementById('urlInput').value;

            // Проверяем, что URL является изображением
            const isValidImageUrl = imageUrl && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null);
            if (imageUrl && !isValidImageUrl) {
                alert('Please provide a valid image URL!');
                return;
            }

            if (comment || imageUrl) {
                // Добавляем комментарий с изображением
                if (imageUrl) {
                    task.comments.push({ text: comment, imageUrl });
                } else {
                    task.comments.push({ text: comment });
                }

                renderTasks(boards.find(board => board.id === boardId));  // Перерисовываем задачи
                saveStateToURL();  // Сохраняем состояние в URL
                closeCommentModal(); // Закрываем окно
            }
        };
    }
}



// Функция для закрытия модального окна комментариев
function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    modal.style.display = 'none'; // Закрываем модальное окно
}

function copy() {

    // Используем Clipboard API для копирования текста
    navigator.clipboard.writeText(window.location.href)
    .then(function() {
        null;
    })
    .catch(function(err) {
        // Если произошла ошибка, показываем сообщение
        alert("Error: " + err);
    });

    // Выделяем текст в поле ввода
    window.location.href.select();
    window.location.href.setSelectionRange(0, 99999); // Для мобильных устройств

    // Копируем текст в буфер обмена
    document.execCommand('copy');
}

// Загрузка состояния из URL при старте
window.onload = loadStateFromURL;