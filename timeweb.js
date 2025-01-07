const express = require('express'); // подключаем фреймворк Express (модуль)

const app = express(); // создаем экземпляр приложения
const router = express.Router(); // создаем экземпляр роутера

const path = __dirname; // записываем путь до рабочего каталога
const port = 8080; // записываем порт сервера

// выводим в консоль HTTP METHOD при каждом запросе
router.use(function (req,res,next) {
  console.log('/' + req.method);
  next();
});

// отвечаем на запрос главной страницы файлом index.html
router.get('/', function(req,res){
  res.sendFile(path + 'index.html');
});

// подключаем роутер к приложению
app.use('/', router);

// начинаем прослушивать порт 8080, тем самым запуская http-сервер
app.listen(port, function () {
  console.log('Listening on port 8080')
})