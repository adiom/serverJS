const express = require('express');
const bip39 = require('bip39');
const crypto = require('crypto');
const path = require('path');
const { ethers } = require('ethers');
const Page = require('./models/Page');
const sequelize = require('./db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

sequelize.sync().then(() => {
    console.log('Database synced');
}).catch((err) => {
    console.error('Failed to sync database:', err);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function isValidPrivateKey(privateKey) {
    try {
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }
        if (privateKey.replace('0x', '').length !== 64) {
            return false;
        }
        const wallet = new ethers.Wallet(privateKey);
        return true;
    } catch (error) {
        console.error('Private key validation error:', error);
        return false;
    }
}

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>brutalBaby</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 class="text-2xl font-bold text-center mb-6">Welcome to brutalBaby</h1>
                <div class="space-y-4">
                    <a href="/generate" class="block w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 text-center">
                        Generate New Page
                    </a>
                    <a href="/enter" class="block w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-center">
                        Enter Mnemonic Phrase
                    </a>
                    <a href="/private-key" class="block w-full bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 text-center">
                        Enter Private Key
                    </a>
                    <a href="/0x0" class="block w-full bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600 text-center">
                        View All Pages
                    </a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Новый маршрут для автоматической генерации (ваш старый код)
app.get('/generate', async (req, res) => {
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


app.get('/0x0', async (req, res) => {
    try {
        const pages = await Page.findAll();
        let pageList = '';
        pages.forEach(page => {
            pageList += `<li><a href="/0x${page.address.slice(2)}">${page.address}</a></li>`;
        });
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
        res.status(500).send('Error fetching pages');
    }
});

function generatePage() {
    const mnemonic = bip39.generateMnemonic();
    const id = crypto.randomBytes(16).toString('hex');
    return { mnemonic, id };
}

function generatePrivateKey(mnemonic) {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0");
    return wallet.privateKey;
}

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
                <form action="/validate" method="POST" class="text-center">
                    <textarea name="mnemonic" rows="3" class="w-full p-2 border rounded-md mb-4" placeholder="Enter 12-word phrase"></textarea>
                    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Submit</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.get('/private-key', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Enter Private Key</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 class="text-2xl font-bold text-center mb-6">Enter Private Key</h1>
                <form action="/validate-private-key" method="POST" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Private Key (with or without 0x prefix)</label>
                        <input type="text" name="privateKey" class="w-full p-2 border rounded-md" placeholder="Enter your private key" required />
                    </div>
                    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Submit</button>
                </form>
                <div class="mt-4 text-center">
                    <a href="/" class="text-blue-500 hover:text-blue-600">Back to Home</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/validate-private-key', async (req, res) => {
    let { privateKey } = req.body;
    try {
        privateKey = privateKey.trim();
        if (!isValidPrivateKey(privateKey)) {
            return res.redirect('/error?message=Invalid private key');
        }
        const wallet = new ethers.Wallet(privateKey);
        const address = wallet.address;
        const mnemonic = bip39.generateMnemonic();
        const id = crypto.randomBytes(16).toString('hex');
        let page = await Page.findOne({ where: { address: address } });
        if (!page) {
            page = await Page.create({ id, mnemonic, address, privateKey });
        }
        res.redirect(`/0x${address.slice(2)}`);
    } catch (error) {
        console.error('Error processing private key:', error);
        res.redirect('/error?message=Error processing private key');
    }
});

app.post('/validate', async (req, res) => {
    const { mnemonic } = req.body;
    const isValid = bip39.validateMnemonic(mnemonic);
    if (isValid) {
        try {
            const wallet = ethers.Wallet.fromMnemonic(mnemonic);
            const generatedAddress = wallet.address;
            let page = await Page.findOne({ where: { address: generatedAddress } });
            if (!page) {
                const id = crypto.randomBytes(16).toString('hex');
                page = await Page.create({ id, mnemonic, address: generatedAddress });
            }
            res.redirect(`/0x${generatedAddress.slice(2)}`);
        } catch (error) {
            res. status(500).send('Error creating page');
        }
    } else {
        res.redirect('/error?message=Invalid mnemonic phrase');
    }
});

app.get('/0x:address', async (req, res) => {
    const address = `0x${req.params.address}`;

    try {
        const page = await Page.findOne({ where: { address: address } });
        if (page) {
            res.send(`
                <html>
                <head>
                    <title>Ethereum Address: ${address}</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                </head>
                <body class="bg-gray-100 min-h-screen flex items-center justify-center">
                    <div class="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
                        <h1 class="text-2xl font-bold text-center mb-6">Ethereum Address Details</h1>
                        <div class="space-y-4">
                            <div class="border-b pb-4">
                                <h2 class="text-lg font-semibold mb-2">Address:</h2>
                                <p class="font-mono break-all">${address}</p>
                            </div>
                            <div class="border-b pb-4">
                                <h2 class="text-lg font-semibold mb-2">Mnemonic Phrase:</h2>
                                <p class="font-mono break-all">${page.mnemonic}</p>
                            </div>
                            <div class="border-b pb-4">
                                <h2 class="text-lg font-semibold mb-2">Private Key:</h2>
                                <p class="font-mono break-all">${generatePrivateKey(page.mnemonic)}</p>
                            </div>
                        </div>
                        <div class="mt-6 text-center">
                            <a href="/" class="text-blue-500 hover:text-blue-600 mr-4">Home</a>
                            <a href="/0x0" class="text-blue-500 hover:text-blue-600">View All Pages</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.status(404).send(`
                <html>
                <head>
                    <title>Page Not Found</title>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                </head>
                <body class="bg-gray-100 min-h-screen flex items-center justify-center">
                    <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                        <h1 class="text-2xl font-bold text-center mb-6">Page Not Found</h1>
                        <p class="text-center mb-4">The requested address does not exist.</p>
                        <div class="text-center">
                            <a href="/" class="text-blue-500 hover:text-blue-600">Back to Home</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/error', (req, res) => {
    const { message } = req.query;
    res.send(`
        <html>
        <head>
            <title>Error</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
            <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 class="text-2xl font-bold text-center mb-6">Error</h1>
                <p class="text-lg text-center">${message}</p>
                <div class="mt-4 text-center">
                    <a href="/" class="text-blue-500 hover:text-blue-600">Back to Home</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});