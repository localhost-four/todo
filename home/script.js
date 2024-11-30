import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

// Firebase setup
const firebaseConfig = {
    apiKey: "AIzaSyDMek24rrioHn3kPaOGDCNIgq1CU7ROVsE",
    authDomain: "todo-4e809.firebaseapp.com",
    projectId: "todo-4e809",
    storageBucket: "todo-4e809.firebasestorage.app",
    messagingSenderId: "166519588590",
    appId: "1:166519588590:web:cb3f6b4e6cba1749a515ff",
    measurementId: "G-45P7VYXPCZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const searchInput = document.getElementById('searchInput');
const dataList = document.getElementById('data-list');
const statsContainer = document.getElementById('stats');
const totalLinksSpan = document.getElementById('totalLinks');
const linksTodaySpan = document.getElementById('linksToday');

// Массив для хранения всех ссылок
let allLinks = [];

// Функция для усечения ссылок до 64 символов
function truncateLink(link) {
  return link.length > 64 ? link.substring(0, 64) + '...' : link;
}

// Загрузка всех данных из Firestore
async function loadAllDataFromFirestore() {
  try {
    const q = query(collection(db, 'urls'), orderBy('timestamp', 'desc'), limit(8)); // Ограничиваем загрузку до 30 записей
    const querySnapshot = await getDocs(q);

    allLinks = []; // Очистить массив перед загрузкой новых данных

    querySnapshot.forEach((doc) => {
      const url = doc.data().url;
      const timestamp = doc.data().timestamp;
      const date = new Date(timestamp);  // Преобразование в JavaScript Date
      const formattedDate = date.toLocaleString();

      // Добавляем ссылку в массив
      allLinks.push({
        url,
        formattedDate
      });

      // Создаем элементы для отображения ссылок на странице
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = url;
      link.textContent = truncateLink(url);  // Укоротить URL если нужно

      const dateSpan = document.createElement('span');
      dateSpan.classList.add('date');
      dateSpan.textContent = `Date: ${formattedDate}`;

      li.appendChild(link);
      li.appendChild(dateSpan);
      li.classList.add('hidden');  // Скрыть ссылки по умолчанию
      dataList.appendChild(li);
    });

    // Обновить статистику
    updateStats(querySnapshot.size);
    dataList.classList.remove('hidden');  // Показать список после загрузки

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Обновление статистики (Всего ссылок и Ссылок за сегодня)
async function updateStats(totalLinksCount) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const q = query(
    collection(db, 'urls'),
    where('timestamp', '>=', Timestamp.fromDate(startOfDay))
  );

  const todayLinksSnapshot = await getDocs(q);
  const todayLinksCount = todayLinksSnapshot.size;

  totalLinksSpan.textContent = totalLinksCount;
  linksTodaySpan.textContent = todayLinksCount;
}

// Обработка ввода в строку поиска
searchInput.addEventListener('input', (e) => {
  const searchQuery = e.target.value.trim().toLowerCase();  // Приводим запрос к нижнему регистру
  filterLinks(searchQuery);

  // Строка поиска поднимается к шапке при активации
  if (searchQuery !== '') {
    document.querySelector('.search-wrapper').style.top = '40%'; // Поднятие строки поиска
    statsContainer.classList.add('hidden');  // Скрываем статистику
  } else {
    document.querySelector('.search-wrapper').style.top = '50%'; // Возврат строки поиска
    statsContainer.classList.remove('hidden');  // Показываем статистику
  }
});

// Функция для фильтрации и отображения ссылок на основе запроса
function filterLinks(searchQuery) {
  const allListItems = document.querySelectorAll('li');
  
  allListItems.forEach((li, index) => {
    const link = li.querySelector('a');
    const dateSpan = li.querySelector('.date');
    
    // Получаем текст ссылки и дату
    const linkText = link.textContent.toLowerCase();
    const dateText = dateSpan.textContent.toLowerCase();

    // Если запрос есть в ссылке или в дате, показываем элемент
    if (linkText.includes(searchQuery) || dateText.includes(searchQuery)) {
      li.classList.remove('hidden');
      li.classList.add('show');  // Показать ссылку
    } else {
      li.classList.add('hidden');  // Скрыть ссылку
      li.classList.remove('show');
    }
  });
}

// Инициализация загрузки всех данных
loadAllDataFromFirestore();
