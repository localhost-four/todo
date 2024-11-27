let boards = []; // Массив досок
let boardCounter = 1; // Счётчик досок
let activeBoardId = null; // Активная доска

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
    const file = document.getElementById('taskFile').files[0];
    const link = document.getElementById('taskLink').value;
    const priority = document.getElementById('taskPriority').value;

    // Проверка, что обязательные поля заполнены
    if (!title || !deadline) {
        alert('Please fill out both title and deadline!');
        return;
    }

    const task = {
        id: `task${Date.now()}`,
        title,
        deadline,
        description,
        file,
        link,
        priority,
        comments: []
    };

    const board = boards.find(b => b.id === activeBoardId);
    if (!board) {
        alert('Board not found');
        return;
    }

    board.tasks.push(task);
    renderBoards();
    closeModal();
    saveStateToURL();
}

// Функция для рендеринга задач
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
            <button onclick="openCommentModal('${board.id}', '${task.id}')">Add Comment</button>
            <div class="comments">
                ${task.comments.map(comment => {
                    let commentHtml = `<p>${comment.text || ''}</p>`;
                    if (comment.file) {
                        // Если есть изображение, загруженное через файл
                        commentHtml += `<img src="${URL.createObjectURL(comment.file)}" alt="Image Preview" class="file-preview" />`;
                    }
                    if (comment.imageUrl) {
                        // Если есть картинка по URL
                        commentHtml += `<img src="${comment.imageUrl}" alt="Image URL" class="file-preview" />`;
                    }
                    return commentHtml;
                }).join('')}
            </div>
            ${task.file ? renderFilePreview(task.file) : ''}
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

// Функция для сохранения состояния в URL
function saveStateToURL() {
    const state = {
        boards,
        activeBoardId,
        theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    };
    const encodedState = encodeURIComponent(JSON.stringify(state));
    window.history.replaceState(null, '', `?state=${encodedState}`);
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

// Функция для открытия модального окна комментариев
function openCommentModal(boardId, taskId) {
    const modal = document.getElementById('commentModal');
    const task = boards.find(board => board.id === boardId).tasks.find(task => task.id === taskId);

    if (task) {
        // Открываем модальное окно
        modal.style.display = 'block';
        
        // Обработчик события для кнопки сохранения комментария
        const saveCommentBtn = document.getElementById('saveCommentBtn');
        saveCommentBtn.onclick = function() {
            const comment = document.getElementById('commentText').value;
            const fileInput = document.getElementById('fileInput').files[0];
            const urlInput = document.getElementById('urlInput').value;

            // Проверка наличия комментария
            if (comment || fileInput || urlInput) {
                if (fileInput) {
                    // Добавляем файл (картинку)
                    task.comments.push({ text: comment, file: fileInput });
                } else if (urlInput) {
                    // Добавляем картинку по URL
                    task.comments.push({ text: comment, imageUrl: urlInput });
                } else {
                    // Добавляем только текст комментария
                    task.comments.push({ text: comment });
                }

                renderTasks(boards.find(board => board.id === boardId)); // Перерисовываем задачи
                closeCommentModal(); // Закрываем модальное окно
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
