const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: '/todo/index.html',  // точка входа вашего приложения
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '/todo/bundle.js', // название основного бандла
    publicPath: 'todo', // путь на GitHub Pages
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader', // трансляция JavaScript с помощью Babel
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],  // обрабатываем стили
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // обработка изображений
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // Очистка старых файлов сборки
    new HtmlWebpackPlugin({
      template: '/todo/index.html', // файл-шаблон для генерации index.html
    }),
  ],
  devServer: {
    static: 'about', // сервирует файлы из папки dist для разработки
    historyApiFallback: true, // позволяет корректно работать с маршрутизацией SPA
  },
  devtool: 'source-map', // создание исходных карт для отладки
};
