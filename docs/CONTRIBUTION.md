# Development Guide

This guide provides information for developers working on the Lendr project, including setup, coding standards, and contribution guidelines.

## Prerequisites

- Node.js v18+
- pnpm v10.13.1+
- PostgreSQL 14+
- Git
- Docker (optional, for local development)

## Getting Started

1. **Fork and Clone**
   ```bash
   git clone git@github.com:YOUR_USERNAME/lendr.git
   cd lendr
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Update .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Start all services
   pnpm run dev
   
   # Or start individually
   pnpm run dev:api     # API server
   pnpm run dev:client  # Frontend
   ```

## Project Structure

```
lendr/
├── apps/
│   ├── api/            # NestJS backend
│   └── client/         # Next.js frontend
├── packages/
│   ├── contracts/      # Smart contracts
│   ├── types/          # Shared TypeScript types
│   └── ui/             # Shared UI components
├── prisma/            # Database schema and migrations
└── docs/              # Project documentation
```

## Code Style

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use `camelCase` for variables and functions
- Use `PascalCase` for types and interfaces
- Use `UPPER_CASE` for constants
- Use 2 spaces for indentation
- Use single quotes (`'`) for strings
- Always include type annotations

### React Components
- Use functional components with hooks
- Follow [React Hooks Rules](https://reactjs.org/docs/hooks-rules.html)
- Use `PascalCase` for component files
- One component per file
- Use TypeScript interfaces for props

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Changes to the build process or auxiliary tools

## Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat(scope): add amazing feature"
   ```

3. Push your changes and create a PR:
   ```bash
   git push -u origin feat/your-feature-name
   # Create PR from GitHub UI
   ```

## Testing

Run tests:
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test:file apps/api/test/your.test.ts
```

## Code Quality

### Linting
```bash
# Run ESLint
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

### Formatting
```bash
# Check formatting
pnpm format:check

# Format code
pnpm format:write
```

## Pull Requests

1. Keep PRs focused on a single feature/bug
2. Update documentation as needed
3. Add tests for new features
4. Ensure all tests pass
5. Get at least one approval before merging

## Code Review

- Be constructive and respectful
- Focus on code, not the person
- Suggest improvements, not just point out issues
- Keep feedback actionable and specific

## Troubleshooting

Common issues and solutions:

1. **Prisma client not found**
   ```bash
   npx prisma generate
   ```

2. **Database connection issues**
   - Verify PostgreSQL is running
   - Check `.env` database URL
   - Run migrations: `npx prisma migrate dev`

3. **Dependency issues**
   ```bash
   rm -rf node_modules
   pnpm install
   ```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Ethereum Developer Docs](https://ethereum.org/developers/)
