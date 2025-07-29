# ☕ CoffeeHybrid - Dual Platform Coffee Ordering System

A comprehensive coffee ordering system with both web application and Telegram bot interfaces, featuring QR code-based pickup verification to reduce waste from unclaimed orders.

## 🌟 Core Concepts

This project is a monorepo containing three distinct parts that work together: a backend API, a web-based frontend, and a Telegram bot.

### Backend (The Core Engine)
The backend is the central nervous system of the application, built with **Node.js** and the **Express** framework. It functions as a RESTful API that serves both the React frontend and the Telegram bot. Its core responsibilities include:
- **User Authentication:** Handling user registration, login, and session management.
- **Menu Management:** Providing endpoints to fetch and manage coffee products.
- **Order Processing:** Managing the entire order lifecycle, from creation to completion.
- **QR Code Generation:** Creating unique QR codes for each order for verification.
- **Database Interaction:** Interacting with a **MySQL** database (using the Sequelize ORM) to store and retrieve all application data, including users, products, and orders.

### Frontend (The Web App)
The frontend is a modern **React** single-page application that provides a visual and interactive experience for users on the web. It communicates with the backend via API calls to fetch data and perform actions. Key features include user login/registration, menu browsing, a shopping cart, order history, and a QR code display for order pickup.

### Telegram Bot (The Conversational Interface)
The Telegram bot offers a conversational way to order coffee. Using the **Telegraf.js** library, it guides users through the menu, customization, and ordering process using interactive keyboards. It relies on the same backend API to fetch menu data and place orders, providing a seamless experience for users on the Telegram platform.

## 🛠 Technology Stack

### Frontend
- **React 19** with JSX
- **CSS Modules** for styling
- **React Router** for navigation
- **Axios** for API calls
- **react-qr-code** for QR generation

### Backend
- **Node.js** with Express
- **MySQL** with Sequelize ORM
- **UUID** for unique tokens
- **qr-image** for server-side QR generation

### Telegram Bot
- **Telegraf.js** framework
- **Webhook** support for production
- **Session management** for user state

### Hosting
- **Digital Ocean App Platform** for all services
- **Aiven MySQL** for database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL Server
- Telegram Bot Token (for bot features)

### 1. Clone and Install
```bash
git clone <repository-url>
cd CoffeeHybrid
npm install
cd Backend && npm install
cd ../Bot && npm install
```

### 2. Environment Setup

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development

# MySQL Connection Details
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=coffee_hybrid_db
DB_PORT=3306
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Bot (.env)**
```env
BOT_TOKEN=your_telegram_bot_token
API_BASE_URL=http://localhost:5000/api
WEBHOOK_URL=https://your-app.onrender.com/webhook
PORT=3000
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Bot (Optional):**
```bash
cd Bot
npm run dev
```

### 4. Initialize Menu Data
Send a POST request to `http://localhost:5000/api/menu/initialize` using a tool like Postman or curl.

### 5. Access Application
- **Web App**: http://localhost:5173
- **API**: http://localhost:5000/api
- **QR Verification**: http://localhost:5173/verify

## 📱 Telegram Bot Setup

### 1. Create Bot
1. Message @BotFather on Telegram
2. Use the `/newbot` command
3. Follow the instructions to get your bot token
4. Add the token to `Bot/.env`

### 2. Set Commands (Optional)
```
start - Start the coffee ordering bot
menu - Browse coffee menu
cart - View your cart
orders - View order history
help - Get help and instructions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/register-telegram` - Register Telegram user

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/category/:category` - Get items by category
- `POST /api/menu/initialize` - Initialize sample menu

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id/qr` - Get QR code image
- `POST /api/verify-qr` - Verify QR token
- `GET /api/orders/user/:userId` - Get user orders

## 🔒 Security Notes

- **No Password Encryption**: As per requirements, passwords are stored in plain text.
- **Session Management**: Simple session-based authentication using cookies.
- **QR Token Security**: UUID-based tokens with expiration.
- **Input Validation**: Basic validation on all inputs.

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MySQL connection details in `.env`.
- Verify the MySQL server is running.
- Ensure port 5000 is not in use by another application.

**Frontend API errors:**
- Ensure the backend server is running.
- Check the `VITE_API_URL` in the frontend `.env` file.
- Verify there are no CORS errors in the browser console.

**Bot not responding:**
- Check that the bot token is correct.
- Verify the webhook URL is correctly set for production environments.
- Ensure the backend API is running and accessible.

**QR codes not working:**
- Ensure the order has not expired (default is 30 minutes).
- Check the QR token format and the verification endpoint.

---

**Built with ❤️ for coffee lovers everywhere** ☕
