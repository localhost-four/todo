// Подключение Firebase с использованием ES Modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

// Настройки Firebase
const firebaseConfig = {
	/*
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
        measurementId: process.env.REACT_APP_mean_ID
	*/
	apiKey: "${{ secrets.REACT_APP_API_KEY }}",
	authDomain: "${{ secrets.REACT_APP_AUTH_DOMAIN }}",
	projectId: "${{ secrets.REACT_APP_PROJECT_ID }}",
	storageBucket: "${{ secrets.REACT_APP_STORAGE_BUCKET }}",
	messagingSenderId: "${{ secrets.REACT_APP_MESSAGING_SENDER_ID }}",
	appId: "${{ secrets.REACT_APP_APP_ID }}",
	measurementId: "${{ secrets.REACT_APP_MEASUREMENT_ID }}"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Получение текущей ссылки страницы
const currentUrl = window.location.href;

// Функция для вычисления расстояния Левенштейна между двумя строками
function levenshtein(a, b) {
    const tmp = [];
    let i, j, alen = a.length, blen = b.length, cost;
    if (alen === 0) { return blen; }
    if (blen === 0) { return alen; }
    for (i = 0; i <= alen; i++) { tmp[i] = [i]; }
    for (j = 0; j <= blen; j++) { tmp[0][j] = j; }
    for (i = 1; i <= alen; i++) {
        for (j = 1; j <= blen; j++) {
            cost = (a[i - 1] === b[j - 1]) ? 0 : 1;
            tmp[i][j] = Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + cost);
        }
    }
    return tmp[alen][blen];
}

// Функция для проверки схожести между текущим URL и ссылками в базе данных
async function isUrlSimilar(url) {
    const threshold = 0.6;  // Порог схожести (60%)
    const querySnapshot = await getDocs(collection(db, "urls"));
    let similarFound = false;
    
    querySnapshot.forEach((doc) => {
        const storedUrl = doc.data().url;
        const distance = levenshtein(url, storedUrl);
        const maxLength = Math.max(url.length, storedUrl.length);
        const similarity = 1 - (distance / maxLength); // Считаем схожесть как 1 - нормированное расстояние Левенштейна

        if (similarity > threshold) {
            similarFound = true; // Если схожесть больше порога, считаем ссылку похожей
        }
    });

    return similarFound;
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
    if (!url.startsWith("https://localhost-four.github.io/todo/")) {
        console.log('include 2');
        return false;
    }

    // Проверка, что URL содержит дополнительные данные после домена (например, параметры)
    if (url === "https://localhost-four.github.io/todo/") {
        console.log('include 3');
        return false;
    }
    console.log('Updata: '+url);
    return true;
}

// Функция для отправки текущей ссылки в Firestore
async function sendUrlToFirestore() {
    try {
        // Проверка, что URL валиден
        if (!isValidUrl(currentUrl)) {
            console.log("URL - regular type");
            return;
        }

        // Проверяем, существует ли уже ссылка или схожая
        const urlIsSimilar = await isUrlSimilar(currentUrl);
        if (!urlIsSimilar) {
            // Если схожих URL нет, добавляем текущий URL в базу данных
            await addDoc(collection(db, "urls"), {
                url: currentUrl,
                timestamp: new Date().toISOString()
            });
            console.log("URL - added to database.");
        } else {
            console.log("This URL or a very similar version already exists in the database.");
        }

        // Проверяем, сколько ссылок в базе данных
        const querySnapshot = await getDocs(collection(db, "urls"));
        const urlCount = querySnapshot.size; // Количество документов в коллекции

        // Если ссылок больше 180, очищаем базу данных
        if (urlCount > 180) {
            console.log("The number of links is more than 180. Cleaning the database.");
            await clearDatabase();  // Очищаем базу данных
        }

    } catch (error) {
        console.error("Error adding URL:", error);
    }
}

// Функция для очистки базы данных 
async function clearDatabase() {
    try {
        const querySnapshot = await getDocs(collection(db, "urls")); // Получаем все документы из коллекции "urls"
        
        // Для каждого документа в коллекции удаляем его
        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, "urls", docSnapshot.id)); // Удаляем документ по ID
        });

        console.log("Cleaning the database.");
    } catch (error) {
        console.error("Error data:", error);
    }
}

window.addEventListener('beforeunload', function (event) {
    event.preventDefault();
    event.returnValue = ''; // Стандартное сообщение не отображается в современных браузерах
});

if (window.location.href === document.referrer) {
    window.location.href = '404.html';
}
// Отправляем текущую ссылку в базу данных
sendUrlToFirestore();
