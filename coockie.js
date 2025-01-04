// Создаем HTML-код для баннера согласия на использование куков
const cookieBannerHTML = `
    <div id="cookie-banner" display="none">
        <div id="cookie-text">You agree to the use of data in accordance with our <a href='policy'>Policy</a>.</div>
    </div>
`;

// Добавляем HTML-код на страницу
document.body.insertAdjacentHTML('beforeend', cookieBannerHTML);

// Переводы
const translations = {
    en: {
        message: "You agree to the use of data in accordance with our <a href='policy'>Policy</a>.",
        set: "/set",
        saveComment: "Save Comment",
    },
    ru: {
        message: "Вы соглашаетесь на использование данных в соответствии с нашей <a href='policy'>Политикой использования</a>.",
        set: "/тема",
        saveComment: "Сохранить комментарий",
    }
};

// Функция для получения языка пользователя
const getUser = () => navigator.language.startsWith('ru') ? 'ru' : 'en';

// Функция для установки текста на выбранном языке
const setLanguage = (lang) => {
    document.getElementById('cookie-text').innerHTML = translations[lang].message;
    document.getElementById('theme-button').innerHTML = translations[lang].set;
    document.getElementById('saveCommentBtn').innerHTML = translations[lang].saveComment;
};

// Функция для получения значения куки
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

// Функция для установки куки
const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

document.getElementById('cookie-banner').style.display = 'none';
// Отображаем баннер, если пользователь не принял куки
if (!getCookie('cookies_accepted')) {
    setLanguage(getUser());
    document.getElementById('cookie-banner').style.display = 'block';
    setTimeout(() => {
        // Your logic here
        setCookie('cookies_accepted', 'true', 365); // Сохраняем куки на 365 дней
    }, 3500);
} else { document.getElementById('cookie-banner').style.display = 'none'; }
