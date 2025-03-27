# API Documentation

## Overview

The Wallet Manager API provides endpoints for managing cryptocurrency wallets, including creation, balance checking, and transaction management. The API is built using NestJS and follows RESTful principles.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication. Include the following header in your requests:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Wallets

#### Create Wallet

Creates a new cryptocurrency wallet.

```http
POST /wallets
Content-Type: application/json

{
  "name": "My Wallet",
  "type": "BTC" | "ETH"
}
```

**Response**

```json
{
  "id": 1,
  "name": "My Wallet",
  "type": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

#### Get Wallet

Retrieves wallet information including balance and token holdings.

```http
GET /wallets/:id
```

**Response**

```json
{
  "id": 1,
  "name": "My Wallet",
  "type": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "balance": "0.001",
  "tokens": [
    {
      "symbol": "USDT",
      "balance": "100.00",
      "price": 1.0
    }
  ]
}
```

#### Get All Wallets

Retrieves a list of all wallets for the authenticated user.

```http
GET /wallets
```

**Response**

```json
[
  {
    "id": 1,
    "name": "My BTC Wallet",
    "type": "BTC",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "balance": "0.001"
  },
  {
    "id": 2,
    "name": "My ETH Wallet",
    "type": "ETH",
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "balance": "0.01"
  }
]
```

### Transactions

#### Send Transaction

Sends cryptocurrency from one wallet to another.

```http
POST /wallets/:id/transactions
Content-Type: application/json

{
  "amount": "0.1",
  "recipientAddress": "0x..."
}
```

**Response**

```json
{
  "id": "tx_1234567890",
  "status": "pending",
  "amount": "0.1",
  "recipientAddress": "0x..."
}
```

## Error Responses

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common error codes:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per hour per user

## WebSocket Updates

The API provides real-time updates via WebSocket connections:

```javascript
// Connect to WebSocket
const ws = new WebSocket("ws://localhost:3000/ws");

// Subscribe to wallet updates
ws.send(
  JSON.stringify({
    type: "subscribe",
    walletId: 1,
  })
);

// Handle updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log("Wallet update:", update);
};
```

## Best Practices

1. **Error Handling**

   - Always check response status codes
   - Implement proper error handling for network issues
   - Display user-friendly error messages

2. **Security**

   - Never store private keys or mnemonics
   - Use HTTPS for all API calls
   - Implement proper input validation
   - Follow the principle of least privilege

3. **Performance**

   - Cache wallet balances when appropriate
   - Implement pagination for large lists
   - Use WebSocket for real-time updates

4. **Testing**
   - Test all API endpoints
   - Verify error handling
   - Test rate limiting
   - Validate WebSocket connections
