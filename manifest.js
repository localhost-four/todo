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
    document.body.appendChild(installButton);

    installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log(choiceResult.outcome === 'accepted' ? 'The user installed the application' : 'The user rejected the installation');
            deferredPrompt = null;
        });
    });
});