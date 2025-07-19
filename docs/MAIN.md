# Lendr Documentation

Welcome to the Lendr documentation!

This section provides guides, technical references, and best practices for working with the Lendr monorepo, backend, frontend, and smart contracts.

## Table of Contents

- [Getting Started](../README.md#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [API Reference](./api.md)
- [Client Reference](./client.md)
- [Smart Contracts](./smart-contracts.md)
- [Contributing](#contributing)

---

## Project Structure

```
lendr/
├── apps/
│   ├── api/      # Backend (NestJS)
│   └── client/   # Frontend (Next.js)
├── rental-escrow-smart-contract/  # Solidity contracts
├── docs/         # Project documentation
├── README.md     # Main project overview
└── ...
```

## Development Workflow

- Use `npm install` at the root to install all dependencies.
- Use `npm run dev`, `npm run dev:api`, or `npm run dev:client` to start development servers.
- See [README.md](../README.md) for detailed instructions.

---

## Contributing

See the [Contributing section](../README.md#contributing) in the main README for guidelines.
