// Добавляем библиотеки GSAP и ScrollMagic через CDN
const script1 = document.createElement('script');
script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.1/gsap.min.js';
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/ScrollMagic/2.0.7/ScrollMagic.min.js';
document.head.appendChild(script2);

// После того, как GSAP загружен, можем инициализировать весь скрипт
script1.onload = () => {
    console.log('GSAP library loaded successfully');
    
    // Теперь добавляем CSS для анимаций и стилей
    const style = document.createElement('style');
    style.innerHTML = `
      /* Основные анимации */
      .fade-in {
        opacity: 0;
        transition: opacity 1s ease-out;
      }

      .fade-in.visible {
        opacity: 1;
      }

      .fade-out {
        opacity: 1;
        transition: opacity 0.5s ease-in;
      }

      .fade-out {
        opacity: 0;
      }

      .scroll-animate {
        opacity: 0;
        transition: opacity 1s ease-out;
      }

      .scroll-animate.fade-in-scroll {
        opacity: 1;
      }

      /* Мобильное меню */
      .mobile-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 80%;
        height: 100%;
        background: #333;
        transform: translateX(-100%);
        transition: transform 0.3s ease-out;
      }

      .mobile-menu.open {
        transform: translateX(0);
      }

      /* Плавная анимация для контента */
      #content-area {
        opacity: 0;
        transition: opacity 1s ease-out;
      }

      #content-area.loading {
        opacity: 0.5;
      }

      /* Адаптивные стили */
      @media (max-width: 768px) {
        .mobile-menu {
          width: 100%;
        }

        .menu-button {
          font-size: 24px;
        }
      }

      html {
        scroll-behavior: smooth;
      }

      .scroll-animate {
        opacity: 0;
        transition: opacity 1s ease-out;
      }

      .scroll-animate.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // Ждем загрузки всего контента на странице
    document.addEventListener('DOMContentLoaded', function() {
      // Функция для плавной загрузки контента через AJAX с изменением URL
      function ajaxLoadContent(url, title = "") {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;  // Проверка наличия контента

        contentArea.classList.add('loading');

        // Загрузка контента через fetch
        fetch(url)
          .then(response => response.text())
          .then(html => {
            contentArea.classList.add('fade-out');
            setTimeout(() => {
              contentArea.innerHTML = html;
              contentArea.classList.remove('fade-out');
              contentArea.classList.remove('loading');
              contentArea.classList.add('fade-in');
              if (title) document.title = title;  // Обновление заголовка
              window.history.pushState({ path: url }, title, url); // Обновление URL
            }, 500);
          })
          .catch(err => {
            console.error('Ошибка загрузки контента:', err);
            contentArea.classList.remove('loading');
          });
      }

      // Обработчик кликов для AJAX-загрузки страниц
      document.querySelectorAll('a[data-ajax="true"]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const url = link.getAttribute('href');
          const title = link.getAttribute('title') || document.title;
          ajaxLoadContent(url, title);
        });
      });

      // Прокрутка с анимацией
      const smoothScroll = (target) => {
        const targetElement = document.querySelector(target);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      };

      // Плавное появление элементов при прокрутке с использованием Intersection Observer
      const observerOptions = {
        root: null,
        threshold: 0.3,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');  // Добавляем класс для анимации
          }
        });
      }, observerOptions);

      document.querySelectorAll('.scroll-animate').forEach(element => {
        observer.observe(element);
      });

      // Обработчик кликов по якорям для плавной прокрутки
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          smoothScroll(this.getAttribute('href'));
        });
      });

      // Мобильное меню
      const menuButton = document.querySelector('.menu-button');
      if (menuButton) {
        menuButton.addEventListener('click', () => {
          const mobileMenu = document.querySelector('.mobile-menu');
          if (mobileMenu) {
            mobileMenu.classList.toggle('open');
            mobileMenu.style.transition = 'transform 0.3s ease-out';
            if (mobileMenu.classList.contains('open')) {
              mobileMenu.style.transform = 'translateX(0)';
            } else {
              mobileMenu.style.transform = 'translateX(-100%)';
            }
          }
        });
      }

      // Управление состоянием URL для использования без перезагрузки страницы
      window.addEventListener('popstate', (event) => {
        const url = window.location.pathname;
        ajaxLoadContent(url);
      });

      // Прокрутка страницы с анимацией при изменении URL
      const currentUrl = window.location.pathname;
      ajaxLoadContent(currentUrl);

      // Плавная прокрутка при загрузке страницы на основе хеша
      if (window.location.hash) {
        smoothScroll(window.location.hash);
      }

      // Использование GSAP для создания плавных анимаций элементов при прокрутке
      gsap.from(".scroll-animate", {
        opacity: 0,
        duration: 1,
        stagger: 0.3
      });
    });
  };
  
  // Скрипт для загрузки ScrollMagic (работает независимо от GSAP)
  script2.onload = () => {
    console.log('ScrollMagic library loaded successfully');
  };










// Проверяем, используется ли страница в iframe
function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

// Функция для скрытия ненужных элементов
function adaptForWidget() {
  if (isInIframe() || window.innerWidth < 460 || window.innerHeight < 460) {
    document.querySelector('header').style.display = 'none';
    document.querySelector('.app-header').style.display = 'none';
    document.querySelector('.modal').style.display = 'none';
    document.querySelector('.notification').style.display = 'none';
    document.querySelector('#cookie-banner').style.display = 'none';

    // Оставляем только tabs-container и task-container
    document.querySelectorAll('.app-container > *').forEach(el => {
      if (!el.classList.contains('tabs-container') && !el.classList.contains('task-container')) {
        el.style.display = 'none';
      }
    });

    // Убираем лишние отступы и padding
    document.body.style.minWidth = 'auto';
    document.body.style.minHeight = 'auto';
    document.body.style.backgroundColor = 'transparent';
  } else {
    document.querySelector('header').style.display = 'flex';
    document.querySelector('.app-header').style.display = 'flex';
    document.querySelector('.notification').style.display = 'flex';
    document.querySelector('#cookie-banner').style.display = 'flex';

    // Оставляем только tabs-container и task-container
    document.querySelectorAll('.app-container > *').forEach(el => {
      if (!el.classList.contains('tabs-container') && !el.classList.contains('task-container')) {
        el.style.display = 'flex';
      }
    });

  }
}

// Вызываем функцию при загрузке страницы и при изменении размера окна
window.addEventListener('load', adaptForWidget);
window.addEventListener('resize', adaptForWidget);