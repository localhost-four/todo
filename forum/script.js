import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp, updateDoc, doc, increment } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    // Your Firebase config here
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_mean_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const linksContainer = document.getElementById('links-container');
let allLinks = [];
let ratingMin = 0;
let ratingMax = 5;
let dateMin = new Date(0);
let dateMax = new Date();

// Загрузка ссылок при загрузке страницы
async function loadLinks() {
    linksContainer.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, 'urls'));
    allLinks = [];

    querySnapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        allLinks.push(data);
    });

    displayLinks();
}

// Функция для фильтрации URL
function isValidUrl(url) {
    console.log('check...');
    // Проверка, что URL не начинается с localhost или 127.0.0.1
    if (url.includes("127.0.0.1") || url.includes(":3000")) {
        console.log('include 1');
        return false;
    }

    // Проверка, что URL начинается с правильного адреса
    if (!url.startsWith("https://localhost-four.github.io/TODO/")) {
        console.log('include 2');
        return false;
    }

    // Проверка, что URL содержит дополнительные данные после домена (например, параметры)
    if (url === "https://localhost-four.github.io/TODO/") {
        console.log('include 3');
        return false;
    }
    console.log('Updata: '+url);
    return true;
}


// Отображение ссылок на основе текущих фильтров
function displayLinks() {
    const filteredLinks = filterLinksByCurrentCriteria(allLinks);
    linksContainer.innerHTML = ''; // Очистка текущих ссылок
    filteredLinks.forEach(link => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h2><a href="${link.url}" target="_blank">${link.title}</a></h2>
            <p>Last updated: ${new Date(link.timestamp).toLocaleString()}</p>
            <p>Rating: ${link.rating || 0}</p>
            <button onclick="openEditLinkModal('${link.id}')">Edit</button>
            <button onclick="incrementRating('${link.id}')">+1 Promotion</button>
            <button onclick="openCommentModal('${link.id}')">Add Comment</button>
            <div class="comments" id="comments-${link.id}"></div>
        `;
        linksContainer.appendChild(card);
        displayComments(link.id); // Загрузка комментариев для каждой ссылки
    });
}

// Фильтрация ссылок по рейтингу и дате
function filterLinksByCurrentCriteria(links) {
    return links.filter(link => {
        const linkRating = link.rating || 0;
        const linkDate = new Date(link.timestamp);

        const ratingCondition = linkRating >= ratingMin && linkRating <= ratingMax;
        const dateCondition = linkDate >= dateMin && dateMax ? linkDate <= dateMax : true;

        return ratingCondition && dateCondition;
    });
}

// Открытие модального окна для редактирования существующей ссылки
function openEditLinkModal(linkId) {
    const link = allLinks.find(l => l.id === linkId);
    document.getElementById('link-title').value = link.title;
    document.getElementById('link-url').value = link.url;
    document.getElementById('modal-title').innerText = 'Edit Link';
    document.getElementById('link-id').value = linkId; // Сохранение ID ссылки
    document.getElementById('link-modal').style.display = 'block';
}

// Сохранение ссылки (редактирование)
async function saveLink() {
    // Проверка, что URL валиден
    if (!isValidUrl(window.location.href)) {
        console.log("URL не является допустимым. Пропускаем запись.");
        return;
    }

    const id = document.getElementById('link-id').value;
    const title = document.getElementById('link-title').value;
    const url = document.getElementById('link-url').value;

    if (!title || !url) {
        alert("Title and URL are required!");
        return;
    }

    // Редактирование существующей ссылки
    await updateDoc(doc(db, 'urls', id), {
        title: title,
        url: url,
        timestamp: new Date().toISOString()
    });

    closeModal();
    loadLinks();
}

// Увеличение рейтинга ссылки
async function incrementRating(linkId) {
    // Проверка, что URL валиден
    if (!isValidUrl(window.location.href)) {
        console.log("URL не является допустимым. Пропускаем запись.");
        return;
    }
    const linkDoc = doc(db, 'urls', linkId);
    await updateDoc(linkDoc, {
        rating: increment(1)
    });
    loadLinks();
}

// Открытие модального окна для добавления комментария
function openCommentModal(linkId) {
    document.getElementById('comment-link-id').value = linkId; // Сохранение ID ссылки
    document.getElementById('comment-modal').style.display = 'block';
}

// Добавление комментария к ссылке
async function addComment() {
    // Проверка, что URL валиден
    if (!isValidUrl(window.location.href)) {
        console.log("URL не является допустимым. Пропускаем запись.");
        return;
    }

    const linkId = document.getElementById('comment-link-id').value;
    const commentText = document.getElementById('comment-text').value;

    if (!commentText) {
        alert("Comment cannot be empty!");
        return;
    }

    await addDoc(collection(db, `urls/${linkId}/comments`), {
        text: commentText,
        timestamp: new Date().toISOString()
    });

    closeCommentModal();
    displayComments(linkId); // Обновление комментариев для ссылки
}

// Отображение комментариев для конкретной ссылки
async function displayComments(linkId) {
    const commentsContainer = document.getElementById(`comments-${linkId}`);
    commentsContainer.innerHTML = ''; // Очистка текущих комментариев
    const querySnapshot = await getDocs(collection(db, `urls/${linkId}/comments`));

    querySnapshot.forEach(doc => {
        const comment = doc.data();
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment');
        commentDiv.innerHTML = `<p>${comment.text}</p><small>Posted on: ${new Date(comment.timestamp).toLocaleString()}</small>`;
        commentsContainer.appendChild(commentDiv);
    });
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('link-modal').style.display = 'none';
}

// Закрытие модального окна комментариев
function closeCommentModal() {
    document.getElementById('comment-modal').style.display = 'none';
}

// Обновление фильтров
function updateFilters() {
    ratingMin = parseInt(document.getElementById('min-rating').value) || 0;
    ratingMax = parseInt(document.getElementById('max-rating').value) || 5;
    dateMin = new Date(document.getElementById('min-date').value) || new Date(0);
    dateMax = new Date(document.getElementById('max-date').value) || new Date();

    displayLinks(); // Обновление отображения ссылок
}

// Загрузка ссылок при загрузке страницы
loadLinks();

// Событие закрытия модального окна
window.onclick = function(event) {
    const linkModal = document.getElementById('link-modal');
    const commentModal = document.getElementById('comment-modal');
    if (event.target === linkModal) {
        closeModal();
    } else if (event.target === commentModal) {
        closeCommentModal();
    }
};

// Объявление глобальных функций
window.openCommentModal = openCommentModal;
window.openEditLinkModal = openEditLinkModal;
window.incrementRating = incrementRating;
// Объявление глобальных функций
window.updateFilters = updateFilters;
window.closeModal = closeModal;
window.closeCommentModal = closeCommentModal;
// Объявление глобальных функций
window.saveLink = saveLink; // Add this line
window.addComment = addComment; // Add this line
