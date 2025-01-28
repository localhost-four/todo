let boards = []; // Массив досок
let boardCounter = 1; // Счётчик досок
let activeBoardId = null; // Активная доска

// Создаем элемент input для выбора файла
// Создаем элемент input для выбора файла
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.id = 'fileInput'; // Изменяем ID для уникальности
fileInput.accept = 'image/*';
fileInput.style.display = 'none'; // Скрываем элемент
document.body.appendChild(fileInput); // Добавляем элемент в body

// Создаем элемент input для выбора прозрачности
const opacityInput = document.createElement('input');
opacityInput.type = 'number';
opacityInput.id = 'opacityInput'; // Изменяем ID для уникальности
opacityInput.min = '0';
opacityInput.max = '1';
opacityInput.step = "0.1";
opacityInput.value = "1"; // Значение по умолчанию
opacityInput.placeholder = "Opacity";
opacityInput.style.display = 'none'; // Скрываем элемент
document.querySelector('.tabs-container').appendChild(opacityInput); // Добавляем элемент в body

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

function custom() {
    // Обработчик событий для выбора файла
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Получаем выбранный файл
        if (file) {
            const reader = new FileReader(); // Создаем новый FileReader

            reader.onload = function(e) {
                // Устанавливаем изображение как фон
                document.body.style.backgroundImage = `url(${e.target.result})`;
                document.body.style.backgroundSize = 'cover'; // Заполняем фон
                document.body.style.backgroundPosition = 'center'; // Центрируем изображение

                // Сохраняем изображение в localStorage
                localStorage.setItem('backgroundImage', e.target.result);

                // Показываем поле ввода прозрачности
                opacityInput.style.display = 'inline';
            };

            reader.readAsDataURL(file); // Читаем файл как Data URL
        }
    });

    // Обработчик событий для изменения прозрачности
    opacityInput.addEventListener('input', (event) => {
        const currentOpacity = parseFloat(event.target.value); // Получаем значение прозрачности
        document.body.style.opacity = currentOpacity; // Устанавливаем прозрачность

        // Сохраняем текущую прозрачность в localStorage
        localStorage.setItem('opacity', currentOpacity);
    });

    // Эмулируем клик на скрытом input для выбора файла
    fileInput.click(); 
}

// Функция для загрузки настроек из localStorage
const savedOpacity = localStorage.getItem('opacity');
const savedImage = localStorage.getItem('backgroundImage');

if (savedOpacity) {
    currentOpacity = parseFloat(savedOpacity);
    opacityInput.value = currentOpacity;
    document.body.style.opacity = currentOpacity;
}

if (savedImage) {
    document.body.style.backgroundImage = `url(${savedImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
}


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
    const getRandomEmoji = () => ['📝', '📅','💾','📁','📃','📄','📒','📓','📚','📙','📑','📰','📂','📋', '🔖', '🗂️', '🖊️'][Math.floor(Math.random() * 7)];
    const getRandomBack = () => ['#ffffff', '#00ffff','#f0ffff','#f0f8ff','#faebd7','#8a2be2','#6495ed','#fff8dc','#fffaf0','#f5f5f5','#fff0f5','#fffafa'][Math.floor(Math.random() * 7)];
    const boardId = `board${boardCounter++}`;
    const newBoard = {
        id: boardId,
        name: `Board ${boardCounter - 1}`,
        emoji: getRandomEmoji(),
        backgroundColor: getRandomBack(),
        textColor: '#000000',
        style: 'flex',
        text: 'left',
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

    if (boards.length === 0) {
        addBoard(); // Если нет досок, создаем основную
    }

    boards.forEach(board => {
        const tabButton = document.createElement('button');
        tabButton.classList.add('tab');
        tabButton.setAttribute('draggable', true);
        tabButton.innerHTML = `        
        <span>${board.emoji} ${board.name}</span>
        <span class="arrow" onclick="openSettings('${board.id}')">/s</span>
        <span class="arrow" onclick="moveTabDown('${board.id}')">m></span>`;

        tabButton.ondragstart = (event) => event.dataTransfer.setData('text/plain',  JSON.stringify(board) );
        tabButton.ondrop = (event) => {
            event.preventDefault();
            const draggedBoardId = event.dataTransfer.getData('text/plain');
            moveTab(draggedBoardId, board.id);
        };

        // Обработчик события перетаскивания для досок
        tabButton.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', JSON.stringify(board) );
        });

        tabButton.addEventListener('click', () => {
            currentBoardId = board.id;
            renderTasks(board);
        });

        tabButton.ondragover = (event) => event.preventDefault(); // Позволяем сброс

        tabButton.onclick = () => openBoard(board.id);
        tabButton.ondblclick = () => openSettings(board.id);
        tabsContainer.appendChild(tabButton);

        const taskBoard = document.createElement('div');
        taskBoard.id = board.id;
        taskBoard.classList.add('task-board');
        taskBoard.style.backgroundColor = board.backgroundColor;
        taskBoard.style.color = board.textColor;
        
        taskBoard.style.display = board.style;
        taskBoard.style.textAlign = board.text;

        taskBoard.setAttribute('ondrop', (event) => dropTask(event, board.id));
        taskBoard.setAttribute('ondragover', (event) => event.preventDefault()); // Позволяем сброс
        taskBoard.addEventListener('dragstart', (event) => { event.dataTransfer.setData('text/plain', JSON.stringify(board) ); });

        taskContainer.appendChild(taskBoard);

        renderTasks(board); // Отображаем задачи
    });
    saveStateToURL();
}

// Функция для перемещения вкладки вниз
function moveTabDown(boardId) {
    const index = boards.findIndex(board => board.id === boardId);
    if (index < boards.length - 1) {
        const [movedBoard] = boards.splice(index, 1);
        boards.splice(index + 1, 0, movedBoard);
        renderBoards(); // Обновляем отображение вкладок
    }
}

// Функция для открытия доски
function openBoard(boardId) {
    const selectedBoard = boards.find(board => board.id === boardId);
    const taskBoards = document.querySelectorAll('.task-board');
    const tabs = document.querySelectorAll('.tab');
    
    taskBoards.forEach(board => {
        if (board.id === boardId) {
            board.style.display = selectedBoard.style;
        } else {
            board.style.display = 'none';
        }
    });

    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.transition = 'background-color 0.5s'; // Animation effect
    });

    // Show selected board and highlight active tab
    const activeTab = [...tabs].find(tab => tab.innerText.includes(selectedBoard.name));
    if (activeTab) {
        activeTab.classList.add('active');
    }

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
        showNotification('Please fill out both title and deadline!');
        return;
    }

    // Проверяем, что введенная строка является валидным URL изображения
    const isValidImageUrl = imageUrl && (imageUrl.match(/\.(jpeg|jpg|gif|png)$/) !== null);

    if (imageUrl && !isValidImageUrl) {
        showNotification('Please provide a valid image URL!');
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
        showNotification('Board not found, select the board');
        return;
    }

    board.tasks.push(task);
    renderBoards();
    closeModal();
    saveStateToURL(); // Сохраняем состояние в URL

}

// Инициализация изменения размера карточки
function initResize(id) {
    const taskCard = document.getElementById(id);

    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);

    function resize(event) {
        const newWidth = Math.max(event.clientX - taskCard.getBoundingClientRect().left, 100); // минимальная ширина
        const newHeight = Math.max(event.clientY - taskCard.getBoundingClientRect().top, 50); // минимальная высота

        // Устанавливаем новые размеры карточки
        taskCard.style.width = newWidth + 'px';
        taskCard.style.height = newHeight + 'px';
    }

    function stopResize() {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
    }
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

// Функция для обработки сброса задачи
function dropTask(event, boardId) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const board = boards.find(b => b.id === boardId);
    const taskIndex = board.tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        const task = board.tasks.splice(taskIndex, 1)[0]; // Удаляем задачу из старого места
        board.tasks.push(task); // Добавляем задачу в конец списка
        renderTasks(board); // Обновляем отображение задач
        saveStateToURL();
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

function getTaskStage(task) {
    const now = new Date();
    const deadline = new Date(task.deadline);

    // Разница в миллисекундах между текущей датой и дедлайном
    const timeDiff = deadline - now;

    // Определяем стадии на основе разницы во времени
    if (timeDiff < 0) {
        // Задача просрочена
        if (now - deadline >= 30 * 24 * 60 * 60 * 1000) { // Если прошло больше месяца
            return 'leave-active'; // Прошел месяц или больше
        } else if (now - deadline >= 7 * 24 * 60 * 60 * 1000) { // Если прошло больше недели
            return 'leave'; // Прошел день или целая неделя
        }
    } else if (timeDiff < 2 * 24 * 60 * 60 * 1000) {
        // Если дедлайн завтра или послезавтра
        return 'enter-active'; // Задача на завтра или послезавтра
    } else if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
        // Если дедлайн в течение недели
        return 'normal'; // Обычная задача
    } else {
        return 'enter'; // Задача на более длительный срок (больше недели)
    }
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
        taskCard.setAttribute('draggable', true);
        taskCard.classList.add('task-card', getTaskStage(task)); // Добавляем класс стадии
        taskCard.innerHTML = `
            <h3 contenteditable="true" onblur="updateTaskTitle('${board.id}', '${task.id}', this.innerText)" href="#${task.title}">${task.title}</h3>
            <p contenteditable="true" onblur="updateTaskDescription('${board.id}', '${task.id}', this.innerText)" >${task.description}</p>
            <div style="display: flex; align-items: center; gap: 10px;">
                <p>Priority: ${task.priority}</p>
                <p><input type="date" value="${task.deadline}" onchange="updateTaskDeadline('${board.id}', '${task.id}', this.value)"></p>
            </div>
            <button onclick="openCommentModal('${board.id}', '${task.id}')">💬Add</button>
            <button onclick="editTask('${board.id}', '${task.id}')">🔁Rep</button>
            <button onclick="deleteTask('${board.id}', '${task.id}')">🗑Del</button>
            <button onclick="deleteBoard('${board.id}')">✖All</button>
            <div class="comments">
                ${task.comments.map(comment => {
                    let commentHtml = `<p contenteditable="true" onblur="updateTaskDescription('${board.id}', '${task.id}', this.innerText)">${comment.text || ''}</p>`;
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
        taskBoard.innerHTML += `<div draggable="false" class="resizer" onmousedown="initResize('${board.id}')">📏size</div>`;

        // Обработчик события перетаскивания для задач
        taskCard.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain',  JSON.stringify(task) );
        });

        taskCard.addEventListener('dragover', (event) => {
            event.preventDefault();
        });


        taskCard.addEventListener('drop', (event) => {
            const taskId = event.dataTransfer.getData('text/plain');
            const taskIndex = board.tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                const [movedTask] = board.tasks.splice(taskIndex, 1);
                board.tasks.push(movedTask);
                renderTasks(board, boardDiv);
            }
        });

        // Удаление задачи с анимацией
        taskCard.addEventListener('animationend', () => {
            if (task.stage === 'leave' || task.stage === 'leave-active') {
                setTimeout(() => {
                    taskCard.classList.add('enter-active'); // Применяем класс для анимации
                }, 500); // Небольшая задержка для срабатывания анимации
            }
        });

    });
}

// Обновление названия задачи
function updateTaskTitle(boardId, taskId, newTitle) {
    const board = boards.find(b => b.id === boardId);
    const task = board.tasks.find(t => t.id === taskId);
    task.title = newTitle;
    saveStateToURL();
}

// Обновление описания задачи
function updateTaskDescription(boardId, taskId, newDescription) {
    const board = boards.find(b => b.id === boardId);
    const task = board.tasks.find(t => t.id === taskId);
    task.description = newDescription;
    saveStateToURL();
}

// Обновление срока выполнения задачи
function updateTaskDeadline(boardId, taskId, newDeadline) {
    const board = boards.find(b => b.id === boardId);
    const task = board.tasks.find(t => t.id === taskId);
    task.deadline = newDeadline;
    saveStateToURL();
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

// Функция для воспроизведения звука
function playSound() {
    const audio = new Audio('my.wav'); // Путь к вашему звуковому файлу
    audio.play().catch(error => {
        console.error('Error playing sound:', error);
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

function showNot(message, duration = 3000) {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Добавление уведомления на страницу
    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10); // Небольшая задержка для срабатывания анимации

    // Удаление уведомления через определенное время
    setTimeout(() => {
        notification.classList.remove('show');
        // Удаляем элемент из DOM после завершения анимации
        notification.addEventListener('transitionend', () => {
            document.body.removeChild(notification);
        });
    }, duration);
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
        showNot(`${title}\n${body}`);
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
            const timdex = task.time;  // Дата дедлайна задачи
            
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
            let path = url.split("mod=").pop();
            if (path.length > 0 || path == window.location.host || path == window.location.hostname || path == window.location.origin || path == window.location.href) {
                window.location.href = '404.html';
            } 

            return null;
        }
    }
    return null;
}



// Функция для инициализации уведомлений на основе состояния из URL
function initNotifications() {
    const state = getStateFromURL();
    if (state) {
        try { requestNotificationPermission(); } catch(n) { showNotification(`Error while checking views: ${n}`); }  // Запросить разрешение на уведомления
        checkTasksForNotifications(state);  // Проверить задачи на уведомления
    } else {
        showNotification(`Welcome back ${navigator.userAgent.split('(')[1].slice(0, 12)}`, `Glad to see you, workspace is cleaned.`);
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
    document.getElementById('textAlignSelector').value = board.text;

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
    const text = document.getElementById('textAlignSelector').value;
    
    const board = boards.find(b => b.id === activeBoardId);
    if (!board) return;
    
    board.emoji = emoji;
    board.backgroundColor = backgroundColor;
    board.textColor = textColor;
    board.style = style;
    board.text = text;

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
                showNotification('Please provide a valid image URL!');
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
        showNotification("Error: " + err);
    });

    if (navigator.share) {
        navigator.share({
            title: "TODO List - Task Management App",
            text: "Manage your tasks effectively. Share your TODO list offline and with others. Access your tasks anytime, anywhere.",
            url: window.location.href
        })
        .then(() => showNotification('Task shared successfully!'))
        .catch((error) => showNotification('Error sharing task:', error));
    } else {
        showNotification('Your browser does not support sharing.');
    }

    // Выделяем текст в поле ввода
    try {
        window.location.href.select();
        window.location.href.setSelectionRange(0, 99999); // Для мобильных устройств

        // Копируем текст в буфер обмена
        document.execCommand('copy');
    } catch(n) { null; }
}

// Загрузка состояния из URL при старте
window.onload = loadStateFromURL();