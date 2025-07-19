# API Documentation

This document provides detailed information about the Lendr API, including endpoints, request/response formats, and authentication.

## Base URL

```
https://api.lendr.app/v1  # Production
http://localhost:4000/v1   # Development
```

## Authentication

All API endpoints (except public ones) require authentication using JWT tokens.

### Obtaining a Token

1. **Request**
   ```http
   POST /auth/siwe
   Content-Type: application/json
   
   {
     "message": "...",
     "signature": "...",
     "address": "0x..."
   }
   ```

2. **Response**
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "user_123",
       "address": "0x...",
       "username": "user123"
     }
   }
   ```

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per minute with valid API key

## Endpoints

### Authentication

- `POST /auth/siwe` - Authenticate with SIWE
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate refresh token

### Users

- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PATCH /users/me` - Update user profile

### NFTs

- `GET /nfts` - List all NFTs
- `GET /nfts/:id` - Get NFT details
- `POST /nfts` - Create new NFT listing
- `PATCH /nfts/:id` - Update NFT listing
- `DELETE /nfts/:id` - Remove NFT listing

### Rentals

- `GET /rentals` - List rentals
- `POST /rentals` - Create new rental
- `GET /rentals/:id` - Get rental details
- `PATCH /rentals/:id` - Update rental status

## Error Handling

Errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ],
  "timestamp": "2023-04-01T12:00:00.000Z",
  "path": "/api/v1/nfts"
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## WebSocket API

For real-time updates, connect to:

```
wss://api.lendr.app/v1/ws  # Production
ws://localhost:4000/v1/ws   # Development
```

### Events

- `rental.created` - New rental created
- `rental.updated` - Rental status updated
- `nft.listed` - New NFT listed
- `nft.updated` - NFT details updated

## SDKs

Official SDKs are available for:

- [JavaScript/TypeScript](https://github.com/CS-Martin/lendr-sdk-js)
- [Python](https://github.com/CS-Martin/lendr-sdk-python)

## Versioning

API versioning is done through the URL path:

```
/v1/...  # Current stable version
```

## Support

For API support, please contact support@lendr.app or open an issue in the GitHub repository.
