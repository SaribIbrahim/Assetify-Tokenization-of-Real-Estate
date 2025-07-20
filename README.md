# Assetify

Assetify is a full-stack platform for property management, sales, and investment, featuring:
- Admin dashboard (admin)
- User-facing web client (client)
- RESTful backend server (server)

## Project Structure

```
Assetify/
  ├── admin/    # Admin dashboard (React + TypeScript)
  ├── client/   # User web client (React)
  ├── server/   # Backend API (Node.js, Express, MongoDB)
  ├── package.json
  └── ...
```

## Features
- User registration, login, and authentication (MetaMask integration)
- Property listing, management, and search
- Property sales, share purchase, and NFT support
- Admin panel for managing users and properties
- OTP-based password reset
- File uploads for property images and documents
- Email notifications

## Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB database (local or cloud)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd Assetify
```

### 2. Install Dependencies
Install dependencies for each sub-project:
```bash
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### 3. Environment Variables
- **server**: Create a `.env` file in the `server` directory with:
  ```env
  MONGO_URL=<your-mongodb-connection-string>
  PORT=3344 # or your preferred port
  ```
- **client/admin**: Set up any required environment variables as needed (see their respective READMEs if present).

### 4. Running the Apps
- **Server**:
  ```bash
  cd server
  npm run dev
  # or
  npm start
  ```
- **Client**:
  ```bash
  cd client
  npm start
  ```
- **Admin**:
  ```bash
  cd admin
  npm run dev
  # or
  npm start
  ```

## More Information
- See `server/README.md` for backend API details.
- See `admin/README.md` and `client/README.md` for frontend usage and development.

## License
ISC 