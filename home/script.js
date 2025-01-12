import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy, where, Timestamp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

// Firebase setup
const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_mean_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Получение параметров URL
const urlParams = new URLSearchParams(window.location.search);
const searchQueryParam = urlParams.get('q'); // Предполагаем, что параметр называется 'q'

// Elements
const searchInput = document.getElementById('searchInput');
const dataList = document.getElementById('data-list');
const statsContainer = document.getElementById('stats');
const totalLinksSpan = document.getElementById('totalLinks');
const linksTodaySpan = document.getElementById('linksToday');

// Если параметр существует, заполняем строку поиска и вызываем фильтрацию
if (searchQueryParam) {
  searchInput.value = decodeURIComponent(searchQueryParam); // Заполняем строку поиска
  filterLinks(searchInput.value.trim().toLowerCase()); // Вызываем функцию фильтрации
  document.querySelector('.search-wrapper').style.top = '5%'; // Поднимаем строку поиска
  statsContainer.classList.add('hidden'); // Скрываем статистику
}

// Массив для хранения всех ссылок
let allLinks = [];

// Функция для усечения ссылок до 64 символов
function truncateLink(link) {
  return link.length > 64 ? link.substring(0, 64) + '...' : link;
}

// Загрузка всех данных из Firestore
async function loadAllDataFromFirestore() {
  try {
    const q = query(collection(db, 'urls'), orderBy('timestamp', 'desc'));
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
      dateSpan.textContent = `Name: ${doc.data().title} Date: ${formattedDate} Rate: ${doc.data().rating}`;

      li.appendChild(link);
      li.appendChild(dateSpan);
      li.classList.add('hidden');
      dataList.appendChild(li);
    });

    // Обновление статистики
    updateStats();  // Обновляем статистику, получая данные из базы
    dataList.classList.remove('hidden');  // Показать список после загрузки

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


// Обновление статистики (Всего ссылок и Ссылок за сегодня)
async function updateStats() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Начало дня
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Конец дня

  // Запрос для получения всех ссылок
  const allLinksQuery = query(collection(db, 'urls'));
  const allLinksSnapshot = await getDocs(allLinksQuery);
  const totalLinksCount = allLinksSnapshot.size;  // Общее количество ссылок

  // Запрос для получения ссылок за сегодня
  const todayLinksQuery = query(
    collection(db, 'urls'),
    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
    where('timestamp', '<', Timestamp.fromDate(endOfDay))
  );

  const todayLinksSnapshot = await getDocs(todayLinksQuery);
  const todayLinksCount = todayLinksSnapshot.size;  // Количество ссылок за сегодня

  // Обновляем статистику на странице
  totalLinksSpan.textContent = totalLinksCount;  // Общее количество ссылок
  linksTodaySpan.textContent = todayLinksCount;  // Количество ссылок за сегодня
}



// Обработка ввода в строку поиска
searchInput.addEventListener('input', (e) => {
  const searchQuery = e.target.value.trim().toLowerCase();  // Приводим запрос к нижнему регистру
  filterLinks(searchQuery);

  // Обновляем URL без перезагрузки страницы
  const newUrl = window.location.pathname + '?q=' + searchQuery;
  history.replaceState(null, '', newUrl);

  // Строка поиска поднимается к шапке при активации
  if (searchQuery !== '') {
    document.querySelector('.search-wrapper').style.top = '5%'; // Поднятие строки поиска
    statsContainer.classList.add('hidden');  // Скрываем статистику
  } else {
    document.querySelector('.search-wrapper').style.top = '90%'; // Возврат строки поиска
    statsContainer.classList.remove('hidden');  // Показываем статистику
  }
});

// Обработка нажатия Enter
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    console.log(e.key);
    e.preventDefault(); // Предотвратить стандартное поведение
    document.querySelector('.search-wrapper').style.top = '90%'; // Сдвиг строки поиска вверх
    statsContainer.classList.add('hidden');  // Скрытие статистики
  }
});

// Функция для фильтрации и отображения ссылок на основе запроса
function filterLinks(searchQuery) {
  const allListItems = document.querySelectorAll('li');
  
  allListItems.forEach((li) => {
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
