// Инициализация CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    lineNumbers: true,
    mode: "javascript",
    theme: "default"
});

// Функция для обновления URL с кодом
function updateUrlWithCode(code) {
    const encodedCode = encodeURIComponent(code);
    const newUrl = window.location.origin + window.location.pathname + '?mod=' + encodedCode;
    window.history.replaceState(null, '', newUrl);
}

// Функция для загрузки кода из URL
function loadCodeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('mod');
    if (codeFromUrl) {
        const decodedCode = decodeURIComponent(codeFromUrl);
        editor.setValue(decodedCode);
        addTag('Code loaded from URL at ' + new Date().toLocaleTimeString());
    }
}

// Load saved code on page load
window.onload = () => {
    loadCodeFromUrl(); // Загружаем код из URL
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
        editor.setValue(savedCode);
    }
    const css = editor.getValue(); // Получаем CSS из редактора
    applyStyles(css); // Применяем стили на страницу
    addTag('CSS loaded at ' + new Date().toLocaleTimeString());
};

// Функция для применения загруженных стилей на страницу
function applyStyles(css) {
    // Удаляем предыдущий тег <style>, если он существует
    const existingStyleTag = document.getElementById('dynamic-styles');
    if (existingStyleTag) {
        existingStyleTag.remove();
    }

    // Создаем новый тег <style>
    const style = document.createElement('style');
    style.id = 'dynamic-styles'; // Устанавливаем ID для последующего удаления
    style.type = 'text/css';
    style.innerHTML = css; // Устанавливаем загруженные стили

    // Добавляем новый тег <style> в <head>
    document.head.appendChild(style);
}

// Функция для сохранения CSS файла
document.getElementById('save-css').addEventListener('click', () => {
    const css = editor.getValue();
    const blob = new Blob([css], { type: 'text/css' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'styles.css';
    link.click();
    addTag('CSS saved at ' + new Date().toLocaleTimeString());
});


// Функция для сохранения кода в localStorage
document.getElementById('save').addEventListener('click', () => {
    const code = editor.getValue();
    localStorage.setItem('savedCode', code);
    updateUrlWithCode(code); // Обновляем URL с новым кодом
    addTag('Code saved at ' + new Date().toLocaleTimeString());
});

// Функция для загрузки кода из localStorage
document.getElementById('load').addEventListener('click', () => {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
        editor.setValue(savedCode);
        addTag('Code loaded at ' + new Date().toLocaleTimeString());
    } 
});

// Load saved code on page load
window.onload = () => {
    const savedCode = localStorage.getItem('savedCode');
    if (savedCode) {
        editor.setValue(savedCode);
    }
};

// Функция для добавления тегов в контейнер тегов
function addTag(text) {
    const tagContainer = document.getElementById('tags-container');
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = text;
    tagContainer.appendChild(tag);
}
