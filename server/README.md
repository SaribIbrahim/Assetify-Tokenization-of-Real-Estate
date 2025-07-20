# Assetify Server

This is the backend server for the Assetify platform, built with Node.js, Express, and MongoDB. It provides RESTful APIs for property management, user authentication, and property sales, including NFT and MetaMask integration.

## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [File Uploads](#file-uploads)
- [Error Handling](#error-handling)

---

## Features
- User registration and authentication (with MetaMask address)
- Property creation, listing, and management
- Sale property management and share purchase
- OTP-based password reset
- File uploads for property images and documents
- Email notifications (via Gmail)

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Assetify/server
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   MONGO_URL=<your-mongodb-connection-string>
   PORT=3344 # or any port you prefer
   ```
4. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run at `http://localhost:3344` by default.

## Environment Variables
- `MONGO_URL`: MongoDB connection string
- `PORT`: Port for the server (default: 3344)

## Scripts
- `npm run dev`: Start the server with nodemon (development)
- `npm start`: Start the server

## API Endpoints

### Authentication
- `POST /admin_register` — Register a new admin user
- `POST /admin_login` — Login with email, password, and MetaMask address
- `POST /changePassword/:email` — Change password for a user
- `POST /sendOTP` — Send OTP to email for password reset
- `POST /VarifyOTP` — Verify OTP
- `POST /forgotPassword/:email` — Reset password using OTP

### Property
- `POST /property/add-saleproperty` — Add a new property (with image/document upload)
- `GET /property/properties` — Get all properties (searchable)
- `GET /property/property/:id` — Get a property by ID
- `GET /property/byOwnerAddress/:address` — Get properties by owner address
- `GET /property/inverter/:inverterId` — Get properties by inverter ID

### Sale Property
- `POST /sale/add-saleproperty` — Add a new sale property
- `POST /sale/buy_saleproperty` — Buy a share in a sale property
- `GET /sale/:id` — Get sale properties by owner

## Data Models

### User (user_authentication)
- `userName`: String (required)
- `email`: String (required)
- `metamask_Address`: String (required)
- `password`: String (hashed)

### Property
- `PropertyName`: String (required)
- `PropertyImage`: String (file path or URL)
- `PropertyDocument`: String (file path or URL)
- `PropertyAmount`: Number (required)
- `PropertyDes`: String (required)
- `ownername`: ObjectId (ref: user_authentication)
- `isFavorite`: Boolean
- `nftId`: Number (required)
- `inverter1`, `inverter2`: ObjectId/String (ref: user_authentication or address)
- `inverter1Amount`, `inverter2Amount`: String
- `ownerOneAddress`, `ownerTwoAddress`: String
- ...and more (see `models/Property.js`)

### SaleProperty
- `PropertyName`: String (required)
- `PropertyImage`: String
- `PropertyDocument`: String
- `PropertyAmount`: Number (required)
- `PropertyDes`: String (required)
- `ownername`: ObjectId (ref: user_authentication)
- `nftId`: Number (required)
- `inverter1`, `inverter2`: String (address or user ID)
- `inverter1Amount`, `inverter2Amount`: Number
- `isSale`: Boolean
- ...and more (see `models/SaleProperty.js`)

## File Uploads
- Property images and documents are uploaded to the `/uploads` directory and served statically at `/uploads`.

## Error Handling
- Unhandled promise rejections will log the error and gracefully shut down the server.

## License
ISC 