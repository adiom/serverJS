const express = require('express');
const bip39 = require('bip39');
const crypto = require('crypto');
const path = require('path');
const { ethers } = require('ethers');
const Page = require('./models/Page'); // Импорт модели страницы
const sequelize = require('./db'); // Импорт подключения к БД

const app = express();
const port = 3000;

// Настраиваем ejs как шаблонизатор
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Синхронизация базы данных
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch((err) => {
    console.error('Failed to sync database:', err);
});

// Middleware для обработки данных из форм
app.use(express.urlencoded({ extended: true }));

// Используем статические файлы из папки public
app.use(express.static('public'));

// Маршрут для главной страницы: генерирует страницу и перенаправляет на Ethereum-адрес
app.get('/', async (req, res) => {
    const { mnemonic, id } = generatePage();

    try {
        // Создаем кошелек из мнемонической фразы
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        const generatedAddress = wallet.address;

        // Сохраняем данные страницы в базу данных
        await Page.create({ id, mnemonic, address: generatedAddress });

        // Перенаправляем на страницу с Ethereum-адресом
        res.redirect(`/0x${generatedAddress.slice(2)}`);
    } catch (error) {
        console.error('Error saving page:', error);
        res.status(500).send('Error creating page');
    }
});

// Маршрут для отображения всех страниц
app.get('/0x0', async (req, res) => {
    try {
        // Извлекаем все страницы из базы данных
        const pages = await Page.findAll();

        // Генерируем HTML для списка страниц
        let pageList = '';
        pages.forEach(page => {
            pageList += `<li><a href="/0x${page.address.slice(2)}">${page.address}</a></li>`;
        });

        // Отправляем HTML с полным списком страниц
        res.send(`
            <html>
            <head>
                <title>List of Pages</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <div class="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
                    <h1 class="text-2xl font-bold text-center mb-6">List of Pages</h1>
                    <ul class="list-disc pl-5">
                        ${pageList}
                        <li><a href="/">Create Page</a></li>
                    </ul>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).send('Error fetching pages');
    }
});

// Функция для генерации мнемонической фразы и уникального ID
function generatePage() {
    const mnemonic = bip39.generateMnemonic(); // Генерируем 12 слов
    const id = crypto.randomBytes(16).toString('hex'); // Генерируем уникальный ID
    return { mnemonic, id };
}


function generatePrivateKey(mnemonic) {
    // Создаем провайдера
    const provider = new ethers.providers.JsonRpcProvider('https://your-rpc-endpoint');
    // Создаем кошелек из мнемонической фразы
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");
    // Получаем приватный ключ
    const privateKey = wallet.privateKey;
    return privateKey;
}

// Маршрут для отображения страницы ввода мнемонической фразы
app.get('/enter', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Enter Mnemonic Phrase</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 class="text-2xl font-bold text-center mb-6">Enter Mnemonic Phrase</h1>
                <p class="text-center mb-4">Please enter your 12-word mnemonic phrase:</p>
                <form action="/validate" method="POST" class="text-center">
                    <textarea name="mnemonic" rows="3" class="w-full p-2 border rounded-md mb-4" placeholder="Enter 12-word phrase"></textarea>
                    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Submit</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Маршрут для обработки проверки мнемонической фразы
app.post('/validate', async (req, res) => {
    const { mnemonic } = req.body;

    // Проверяем, является ли введенная фраза валидной
    const isValid = bip39.validateMnemonic(mnemonic);

    if (isValid) {
        try {
            // Создаем кошелек из мнемонической фразы
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            const generatedAddress = wallet.address;

            // Проверяем, существует ли страница для этого адреса в базе данных
            let page = await Page.findOne({ where: { address: generatedAddress } });

            if (!page) {
                // Если страницы нет, создаем новую
                const id = crypto.randomBytes(16).toString('hex');
                page = await Page.create({ id, mnemonic, address: generatedAddress });
            }

            // Перенаправляем на страницу с Ethereum-адресом
            res.redirect(`/0x${generatedAddress.slice(2)}`);
        } catch (error) {
            console.error('Error generating wallet from mnemonic:', error);
            res.redirect('/error');
        }
    } else {
        // Если фраза невалидна, перенаправляем на страницу ошибки
        res.redirect('/error');
    }
});

app.get('/0x:address', async (req, res) => {
    const address = `0x${req.params.address}`;

    try {
        const page = await Page.findOne({ where: { address: address } });
        if (page) {
            res.render('page', { title: `Ethereum Address: ${address}`, address, mnemonic: page.mnemonic, privatekey: generatePrivateKey(page.mnemonic) });
        } else {
            res.status(404).send('Page not found');
        }
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).send('Internal server error');
    }
});

// Маршрут для страницы ошибки
app.get('/error', (req, res) => {
    res.render('error', { title: 'Error Page' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
