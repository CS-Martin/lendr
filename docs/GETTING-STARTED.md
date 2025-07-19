# Getting Started

Welcome to Lendr! This guide will help you set up and run the project locally.

## Prerequisites

- Node.js (v18 or later)
- pnpm (v10.13.1 or later)
- Git
- PostgreSQL (v14 or later)
- MetaMask or other Web3 wallet

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/CS-Martin/lendr.git
cd lendr
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install workspace dependencies
pnpm install -r
```

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   - Database connection string
   - JWT secret
   - Web3 provider URLs
   - Contract addresses

### 4. Set Up Database

1. Start PostgreSQL server
2. Create a new database for the project
3. Update the database URL in `.env`

### 5. Run Database Migrations

```bash
npx prisma migrate dev
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

## Running the Application

### Development Mode

Start both API and client in development mode:

```bash
pnpm run dev
```

Or start them individually:

```bash
# Start API server
pnpm run dev:api

# In another terminal, start the client
pnpm run dev:client
```

### Testing

Run the test suite:

```bash
pnpm test
```

### Production Build

```bash
# Build all packages
pnpm run build

# Start in production mode
pnpm start
```

## Development URLs

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Prisma Studio**: http://localhost:5555

## Next Steps

- [Architecture Overview](./architecture.md)
- [API Documentation](./api/README.md)
- [Development Guidelines](./development.md)
