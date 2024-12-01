// Проверяем поддержку сервис-воркеров и PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('Сервис-воркер зарегистрирован:', registration);
    }).catch(function(error) {
        console.log('Ошибка при регистрации сервис-воркера:', error);
    });
}

// Показываем уведомление для добавления на главный экран
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Отменить стандартное поведение
    let deferredPrompt = e;
    const installButton = document.createElement('button');
    installButton.innerText = 'Install';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '20px';
    installButton.style.left = '50%';
    installButton.style.transform = 'translateX(-50%)';
    installButton.style.background = 'linear-gradient(45deg, #ff6a00, #ee0979)';
    installButton.style.color = 'white';
    installButton.style.fontSize = '16px';
    installButton.style.border = 'none';
    installButton.style.borderRadius = '25px';
    installButton.style.padding = '15px 25px';
    installButton.style.cursor = 'pointer';
    installButton.style.transition = 'transform 0.3s, opacity 0.3s, background-color 0.3s';
    installButton.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(installButton);

    // Плавное скрытие кнопки перед её появлением
    installButton.style.opacity = 0;
    installButton.style.transform = 'scale(0)';
    setTimeout(() => {
        installButton.style.opacity = 1;
        installButton.style.transform = 'scale(1)';
    }, 100);

    // Скрытие кнопки после её клика
    installButton.addEventListener('click', () => {
        // Скрываем кнопку с анимацией
        installButton.style.transition = 'transform 0.3s, opacity 0.3s';
        installButton.style.opacity = 0;
        installButton.style.transform = 'scale(0)';

        // Показываем стандартное окно для добавления на главный экран
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log(choiceResult.outcome === 'accepted' ? 'The user installed the application' : 'The user rejected the installation');
            deferredPrompt = null;

            // Удаляем кнопку после выбора
            setTimeout(() => {
                installButton.remove();
            }, 300); // Задержка, чтобы анимация исчезновения завершилась
        });
    });

    // Добавляем анимацию на hover
    installButton.addEventListener('mouseenter', () => {
        installButton.style.backgroundColor = '#ff5e5b';
        installButton.style.transform = 'scale(1.05)';
    });

    installButton.addEventListener('mouseleave', () => {
        installButton.style.backgroundColor = 'linear-gradient(45deg, #ff6a00, #ee0979)';
        installButton.style.transform = 'scale(1)';
    });

    // При нажатии на кнопку добавляем эффект нажима
    installButton.addEventListener('mousedown', () => {
        installButton.style.transform = 'scale(0.98)';
    });

    installButton.addEventListener('mouseup', () => {
        installButton.style.transform = 'scale(1)';
    });
});
