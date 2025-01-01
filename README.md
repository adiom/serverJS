# ETH-WALLET (serverJS)

**serverJS** is a creative web project that allows users to create and manage pages associated with Ethereum addresses based on entered mnemonic phrases (12-word seed phrase). The site supports wallet generation and the creation of unique pages based on Ethereum addresses, as well as displaying all existing pages in the database.

## Main Features

### 1. Entering a Mnemonic Phrase and Generating a Page
On the main page of the project, the user can enter a 12-word mnemonic phrase, which will be validated. If the phrase is correct:
- An Ethereum address is generated based on this phrase.
- The user is redirected to a unique page corresponding to this address.
- Both the mnemonic phrase and the generated Ethereum address are saved in the database.

### 2. Displaying Pages by Ethereum Address
Each Ethereum address generated based on the mnemonic phrase is associated with a separate page. These pages are accessible via a URL that includes this address. For example, a page with the address `0xe364cac7851345e5D18caea8c744B21db87fF64c` will be available at:

http://localhost:3000/0xe364cac7851345e5D18caea8c744B21db87fF64c

The page displays:
- The generated Ethereum address.
- The mnemonic phrase based on which the address was created.

### 3. Displaying All Created Pages
Users can go to the `/0x0` page to see a list of all created pages with Ethereum addresses that have been saved in the database. This list contains links to each of these pages.

### 4. Error Page
If the mnemonic phrase is incorrect, the user is redirected to an error page where they are prompted to enter the phrase again.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/adiom/serverJS.git
    ```

2. Navigate to the project folder:
    ```bash
    cd serverJS
    ```

3. Install dependencies and create a [.env](http://_vscodecontentref_/0) file:
    ```bash
    npm install
    ```

4. Start the server:
    ```bash
    node server.js
    ```

The project will be available at `http://localhost:3000`.

## File Structure

/serverJS
├── /public
│ ├── /css
│ └── /js
├── /views
│ ├── /partials
│ │ ├── header.ejs
│ │ └── footer.ejs
│ ├── page.ejs
│ ├── error.ejs
│ └── layout.ejs
├── /models
│ └── Page.js
├── /db.js
├── /server.js
├── /package.json
├── /README.md
└── /database.sqlite



## Technologies

- **Node.js** — a runtime environment for executing JavaScript code.
- **Express** — a framework for creating web applications.
- **Sequelize** — an ORM for working with databases (supports SQLite and PostgreSQL).
- **EJS** — a templating engine for rendering dynamic pages.
- **Tailwind CSS** — a framework for creating responsive and minimalist designs.

## Improvement Plans

The ETH-WALLET project has great potential for expansion and adding new features. Here are some ideas for development:

### 1. **Visual Personalization of Pages**
   - Allow users to upload their own images, change styles and themes on their pages, making each page unique.
   - Support for custom meta descriptions and SEO tags to improve page visibility in search engines.

### 2. **Support for NFTs Based on Ethereum Addresses**
   - Create and display unique NFTs (non-fungible tokens) associated with each page. Users will be able to see their NFT collections on pages linked to their Ethereum addresses.

### 3. **Smart Contract Integration**
   - Enable interaction with smart contracts through ETH-WALLET pages. Users will be able to perform transactions, sign messages, and interact with the blockchain directly from these pages.

### 4. **Support for Additional Blockchains**
   - Expand the project to support other blockchains, such as Binance Smart Chain, Polygon, and others. This will allow users to create pages based on various cryptocurrency networks.

### 5. **Rating and Social Features**
   - Implement a rating and comment system on user pages. Allow users to rate pages, add reviews, and interact with the community.
   - Enable the formation of communities or groups related to specific cryptographic topics.

### 6. **Multi-Factor Authentication**
   - Improve security by adding two-factor authentication (2FA) when creating and accessing pages based on Ethereum addresses.

### 7. **Mobile Application**
   - Develop a mobile application for managing pages, personalizing them, and accessing information with a user-friendly interface.

### 8. **Content Monetization**
   - Add functionality for monetizing pages. Users will be able to publish content on their pages and receive rewards for interacting with it through micropayments and cryptocurrencies.

## Contacts

If you have any questions or suggestions about the project, please email: **adiom@canfly.org**

---

The project is developed with the support of **Canfly** and neural networks.