# Gemini Project Summary: CoffeeHybrid

This document provides a detailed summary of the CoffeeHybrid project based on the repository's contents.

## 1. Project Overview

CoffeeHybrid is a dual-platform coffee ordering system designed to operate through both a traditional web application and a Telegram bot. The primary business goal is to streamline the ordering process and reduce waste from unclaimed orders by implementing a mandatory QR code verification system for order pickup.

The project is structured as a monorepo with three main components:
-   **Frontend:** A React-based web application for customers.
-   **Backend:** A Node.js/Express API that serves both the frontend and the bot.
-   **Bot:** A Telegram bot for a conversational ordering experience.

## 2. Technology Stack

-   **Frontend:**
    -   Framework: React 19 (with JSX)
    -   Routing: React Router
    -   Styling: CSS Modules
    -   API Communication: Axios
    -   QR Codes: `react-qr-code`

-   **Backend:**
    -   Runtime/Framework: Node.js with Express
    -   Database: MongoDB with Mongoose ODM
    -   Authentication: Custom session-based logic (JWT tokens mentioned but seems to be simple session)
    -   QR Codes: `qr-image` for server-side generation
    -   Unique IDs: `uuid`

-   **Telegram Bot:**
    -   Framework: Telegraf.js
    -   Communication: Webhooks for production environments

-   **Hosting & Deployment:**
    -   Services: Render.com
    -   Database: MongoDB Atlas

## 3. Core Features

### Customer-Facing (Web & Bot)
-   **Authentication:** The web app has a standard registration/login system. The bot identifies users by their Telegram ID.
-   **Menu Browsing:** Users can view coffee items categorized into Hot, Iced, and Frappe.
-   **Order Customization:** Extensive options including size, sugar level, ice level, and premium add-ons.
-   **Shopping Cart:** Standard cart functionality to add, modify, and remove items before checkout.
-   **Order Placement:** Users can place orders and view their order history.
-   **QR Code Generation:** Upon placing an order, a unique QR code is generated and displayed (web) or sent as an image (bot).

### Staff-Facing
-   **QR Verification Portal:** A dedicated page (`/verify`) for staff to scan or manually enter the token from a customer's QR code.
-   **Order Completion:** Successfully verifying a QR code marks the order as completed in the system.

### Business Logic & Waste Prevention
-   **Strike System:** Tracks users who fail to pick up their orders.
-   **Order Expiration:** Orders automatically expire after 30 minutes if not picked up.
-   **Account Blocking:** Repeat offenders (users with multiple no-shows) can be temporarily blocked.
-   **Loyalty System:** A points system is mentioned to reward good behavior (i.e., picking up orders).

## 4. Project Structure & Key Files

-   `Frontend/`: Contains the React client application.
    -   `src/App.jsx`: Main application component and router setup.
    -   `src/Components/`: Contains UI components for Admin, Auth, Seller, etc.
    -   `src/services/api.js`: Axios instance for backend communication.
    -   `src/context/`: React contexts for managing user and cart state.
-   `Backend/`: The core API.
    -   `server.js`: The main entry point for the Express server.
    -   `routes/`: Defines all API endpoints for auth, menu, orders, etc.
    -   `controllers/`: Contains the business logic for each route.
    -   `models/`: Mongoose schemas for User, Product, Order, etc.
    -   `config/config.js`: Main configuration file.
-   `Bot/`: The Telegram bot application.
    -   `bot.js` / `src/bot.js`: Main bot logic using Telegraf.js.
    -   `src/handlers/`: Logic for handling different commands and user interactions (`/start`, menu, cart).
    -   `src/services/apiService.js`: Service for communicating with the backend API.
-   `documentation-issue-solved/`: A large collection of markdown files documenting setup guides, troubleshooting steps, and feature implementation details (e.g., CORS fixes, Google OAuth setup, deployment guides). This indicates a significant amount of development and debugging effort.

## 5. Setup & Running the Project

1.  **Prerequisites:** Node.js v18+, MongoDB instance.
2.  **Installation:** Run `npm install` in the root, `Backend/`, and `Bot/` directories.
3.  **Configuration:** Create `.env` files for each service (`Frontend`, `Backend`, `Bot`) based on the `.env.example` files, providing database URIs, API URLs, and bot tokens.
4.  **Execution:** The three services are designed to be run concurrently in separate terminals.
5.  **Data Initialization:** The menu must be populated by sending a `POST` request to the `/api/menu/initialize` endpoint.
