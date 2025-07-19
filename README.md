# Lendr - Decentralized NFT Rental Marketplace

[![GitHub](https://img.shields.io/github/license/CS-Martin/lendr)](LICENSE)
[![Docker](https://img.shields.io/docker/pulls/csmartin/lendr)](https://hub.docker.com/r/csmartin/lendr)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/CS-Martin/lendr?utm_source=oss&utm_medium=github&utm_campaign=CS-Martin%2Flendr&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

Lendr is a decentralized platform that allows users to rent NFTs securely using collateralized smart agreements, with an integrated reputation system, support for bidding, and a seamless Web3 login experience via Sign-In With Ethereum (SIWE).

## Key Features

- **Web3 Authentication**
  - Sign-In With Ethereum (SIWE) using MetaMask or WalletConnect
  - Stateless authentication using NextAuth + JWT
  - Wallet-based identity system

- **User Profiles**
  - Customizable profile with username, bio, and avatar
  - Public profile with owned and listed NFTs
  - Social metrics including reputation score, ratings, and rental history

- **NFT Listings**
  - List NFTs with price per day and collateral requirements
  - Set rental duration and auto-renewal options
  - Pull NFT metadata from blockchain or IPFS

- **Rental Contracts**
  - Secure rental agreements with collateral locking
  - Automated NFT return system
  - Smart contract dispute resolution

- **Bidding System**
  - Optional bidding for high-value NFTs
  - Custom bid parameters (price, duration, message)
  - Owner review and acceptance workflow

## Use Cases

- **Gamers**: Rent rare weapons, skins, or characters
- **Collectors**: Generate yield from idle NFTs
- **DAOs**: Offer shared NFT assets to members
- **Events**: Rent ticket NFTs for gated content

## Project Structure

```
lendr/
├── api/                 # Backend API services
├── client/             # Frontend React application
└── rental-escrow-smart-contract/  # Smart contract implementation
```

## Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: React, Next.js, TypeScript, RainbowKit
- **Smart Contracts**: Solidity, Hardhat
- **Authentication**: SIWE, NextAuth.js
- **Database**: PostgreSQL
- **Orchestration**: Docker Compose

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (v7+ for workspaces support)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (for database and optional services)

### 2. Install Dependencies (Monorepo)
From the root of the repository:

```bash
npm install
```
This will install dependencies for all packages and apps (API, client, etc.) using npm workspaces.

### 3. Environment Variables
Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
# Edit .env as needed
```

### 4. Running the Applications

#### Run Everything (API & Client)
From the root directory:
```bash
npm run dev
```
This starts both the API (NestJS) and client (Next.js) apps in parallel using Turborepo.

#### Run Only the API
```bash
npm run dev:api
```

#### Run Only the Client
```bash
npm run dev:client
```

- By default, the API runs on [http://localhost:3000](http://localhost:3000)
- The client runs on [http://localhost:8080](http://localhost:8080) (see `apps/client/package.json` for port)

#### Run with Docker Compose (optional)
If you want to start supporting services (e.g., PostgreSQL):
```bash
docker-compose up -d
```

### 5. Building the Applications
```bash
npm run build
```
This builds all apps/packages using Turborepo.

### 6. Linting & Formatting
```bash
npm run lint   # Lint all apps/packages
npm run format # Format all apps/packages
```

---

For more details on project structure and advanced commands, see the rest of this README.

   # Access the application
   http://localhost:3000
   ```

## Development

- **Live Reload**: Nx/Turbo for fast development
- **Type Safety**: Shared DTOs for frontend/backend
- **Dockerized**: Fully containerized development environment
- **CI/CD Ready**: Pre-configured for deployment

## Security

- **Smart Contracts**: Secure implementation of ERC-4907/ERC-5006
- **Authentication**: Wallet-based identity verification
- **Data Protection**: End-to-end encryption for sensitive data

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository.

## Roadmap

- [x] Basic NFT rental system
- [x] SIWE authentication
- [ ] User messaging system
- [ ] Multi-chain support
- [ ] On-chain dispute resolution
