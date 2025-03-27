# Cryptocurrency Wallet Manager

A full-stack application for managing cryptocurrency wallets, built with Angular and NestJS.

## Features

- Create and manage Bitcoin (BTC) and Ethereum (ETH) wallets
- Hierarchical Deterministic (HD) wallet support
- Real-time balance tracking
- Support for ERC-20 tokens (ETH wallets)
- Secure private key storage with encryption
- User-friendly interface with Material Design
- Responsive design for all devices

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- Angular CLI
- NestJS CLI

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/wallet-manager.git
cd wallet-manager
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Create a PostgreSQL database:

```bash
createdb wallet_manager
```

5. Configure environment variables:
   - Create a `.env` file in the backend directory with:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     DB_NAME=wallet_manager
     ENCRYPTION_KEY=your_secure_encryption_key
     ```

## Development

1. Start the backend server:

```bash
cd backend
npm run start:dev
```

2. Start the frontend development server:

```bash
cd frontend
ng serve
```

3. Access the application:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## API Documentation

### Wallet Endpoints

#### Create Wallet

```http
POST /api/wallets
Content-Type: application/json

{
  "name": "My Wallet",
  "type": "BTC" | "ETH"
}
```

#### Get Wallet

```http
GET /api/wallets/:id
```

#### Get All Wallets

```http
GET /api/wallets
```

#### Send Transaction

```http
POST /api/wallets/:id/transactions
Content-Type: application/json

{
  "amount": "0.1",
  "recipientAddress": "0x..."
}
```

## Security Features

- Private keys are encrypted using AES-256-GCM
- HD wallet support for better key management
- Secure storage of sensitive data
- Input validation and sanitization
- Error handling and logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
