require('dotenv').config(); // Подключаем dotenv для работы с переменными окружения
const { Sequelize } = require('sequelize');

// Настройка подключения к базе данных в зависимости от переменных окружения
let sequelize;

if (process.env.DB === 'sqlite3') {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_STORAGE || './database.sqlite'
    });
} else if (process.env.DB === 'postgresql') {
    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
    });
} else {
    throw new Error('Unsupported database type in .env');
}

module.exports = sequelize;
