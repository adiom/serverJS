const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Путь может отличаться в зависимости от вашей структуры

// Определение модели Page
const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    mnemonic: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    privateKey: {
        type: DataTypes.STRING,
        allowNull: true, // Опционально
        },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    meta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
});

module.exports = Page;
