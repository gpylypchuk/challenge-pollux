# Wallet Management Application

A full-stack web application for creating and managing cryptocurrency wallets. Built with Angular (frontend) and NestJS (backend).

## Features

- Secure wallet creation with private key management
- HD wallet support
- Real-time token balance viewing
- Secure token transfer functionality
- User-friendly interface
- Responsive design

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Angular CLI
- NestJS CLI

## Project Structure

```
wallet-management-app/
├── backend/          # NestJS backend application
├── frontend/         # Angular frontend application
├── package.json      # Root package.json for managing the monorepo
└── README.md        # Project documentation
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd wallet-management-app
   ```

2. Install dependencies:

   ```bash
   npm run install:all
   ```

3. Start the development servers:

   Backend:

   ```bash
   npm run start:backend
   ```

   Frontend:

   ```bash
   npm run start:frontend
   ```

4. Open your browser and navigate to:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## Development

- The frontend application is built with Angular and includes routing and SCSS styling.
- The backend application is built with NestJS and provides RESTful APIs.
- Both applications include testing setups with Jest.

## Scripts

- `npm run install:all` - Install dependencies for all applications
- `npm run start:backend` - Start the backend development server
- `npm run start:frontend` - Start the frontend development server
- `npm run build` - Build both applications
- `npm run test` - Run tests for both applications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
