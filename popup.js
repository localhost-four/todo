let link;
const translations = {
    en: {
        title: "Choose an Action:",
        openNewTab: "Open in New Tab",
        openNewWindow: "Open in New Window",
        openOverlay: "Open Overlay",
        directLink: "Direct Link",
        downloadLink: "Download File",
        copyLink: "Copy Link",
        cancel: "Cancel"
    },
    ru: {
        title: "Выберите действие:",
        openNewTab: "Открыть в новой вкладке",
        openNewWindow: "Открыть в новом окне",
        openOverlay: "Открыть поверх текущего",
        directLink: "Прямой переход",
        downloadLink: "Скачать файл",
        copyLink: "Скопировать ссылку",
        cancel: "Отмена"
    }
};

// Функция для установки текста на выбранном языке
function setLanguage(lang) {
    document.getElementById('title').textContent = translations[lang].title;
    document.getElementById('openNewTab').textContent = translations[lang].openNewTab;
    document.getElementById('openNewWindow').textContent = translations[lang].openNewWindow;
    document.getElementById('openOverlay').textContent = translations[lang].openOverlay;
    document.getElementById('directLink').textContent = translations[lang].directLink;
    document.getElementById('downloadLink').textContent = translations[lang].downloadLink;
    document.getElementById('copyLink').textContent = translations[lang].copyLink;
    document.getElementById('cancel').textContent = translations[lang].cancel;
}

// Установка языка по умолчанию
const userLang = navigator.language || navigator.userLanguage;
const lang = userLang.startsWith('ru') ? 'ru' : 'en';
setLanguage(lang);

// Получаем ссылку из параметров URL
if (!link) {
    const urlParams = new URLSearchParams(window.location.search);
    link = urlParams.get('l');
}

document.getElementById('openNewTab').addEventListener('click', () => {
    window.open(link, '_blank');
    window.close();
});

document.getElementById('openNewWindow').addEventListener('click', () => {
    window.open(link, "mozillaWindow", "popup");
    window.close();
});

document.getElementById('openOverlay').addEventListener('click', () => {
    window.open(link, "_self");
    window.close();
});

document.getElementById('directLink').addEventListener('click', () => {
    window.location.href = link;
});

document.getElementById('downloadLink').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = link; // Устанавливаем URL
    a.download = ''; // Указываем атрибут download
    document.body.appendChild(a); // Добавляем элемент на страницу
    a.click(); // Имитируем клик по ссылке
    document.body.removeChild(a); // Удаляем элемент после скачивания
    window.close(); // Закрываем окно
});

document.getElementById('copyLink').addEventListener('click', () => {
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied!');
    }, () => {
        alert('Error copying link.');
    });
    window.close();
});

document.getElementById('cancel').addEventListener('click', () => {
    history.back();
    window.close();
});

