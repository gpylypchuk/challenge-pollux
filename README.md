# Wallet Management Application

A secure wallet management application built with Angular, NestJS, and Tailwind CSS.

## Features

- Create and manage HD wallets
- Secure private key storage with password encryption
- Responsive and user-friendly interface
- RESTful API for wallet operations

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Project Structure

```
challenge-pollux/
├── frontend/          # Angular frontend application
└── backend/          # NestJS backend application
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend/wallet-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend will be available at `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend/wallet-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:4200`.

## API Endpoints

### Wallets

- `POST /api/wallets/create` - Create a new wallet

  - Body: `{ name: string, password: string }`

- `GET /api/wallets` - Get all wallets

- `GET /api/wallets/:id` - Get a specific wallet

- `DELETE /api/wallets/:id` - Delete a wallet

## Security Considerations

- Private keys are encrypted with user-provided passwords
- HD wallets are used for better key management
- No private keys are stored in plain text
- Passwords are never stored, only used for encryption/decryption

## Development

### Frontend

The frontend is built with:

- Angular 17
- Tailwind CSS for styling
- Angular Reactive Forms for form handling
- HTTP Client for API communication

### Backend

The backend is built with:

- NestJS
- ethers.js for wallet operations
- In-memory storage (can be extended to use a database)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
