# Используем базовый образ с Ubuntu
FROM ubuntu:20.04

# Установка необходимых пакетов
RUN apt-get update && apt-get install -y \
    nginx \
    apache2 \
    php-fpm \
    php-mysql \
    php-xml \
    php-json \
    php-curl \
    npm \
    git \
    curl \
    vim \
    && apt-get clean

# Настройка Nginx
COPY nginx.conf /etc/nginx/sites-available/default

# Настройка Apache
COPY apache2.conf /etc/apache2/apache2.conf

# Копирование ваших файлов
COPY ./html /var/www/html  
# Папка с вашим HTML и другими файлами

# Копирование конфигурационных файлов
COPY .editorconfig /root/.editorconfig
COPY .babelrc /root/.babelrc
COPY .gitignore /root/.gitignore
COPY .vimrc /root/.vimrc
COPY .netrwhist /root/.netrwhist
COPY .github /root/.github
COPY manifest.json /var/www/html/manifest.json
COPY session.vim /root/session.vim
COPY webpack.config.js /var/www/html/webpack.config.js
COPY yarn.lock /var/www/html/yarn.lock

# Установка зависимостей npm
RUN cd /var/www/html && npm install

# Открытие портов
EXPOSE 80 443

# Запуск Nginx и Apache
CMD service nginx start && service apache2 start && tail -f /dev/null
