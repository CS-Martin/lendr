# Contributing to Lendr

Thank you for your interest in contributing to Lendr! 🚀

We welcome all kinds of contributions: new features, bug fixes, documentation improvements, and more.

## How to Contribute

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/<your-username>/lendr.git
   cd lendr
   ```
3. **Create a new branch**
   ```bash
   git checkout -b feature/my-feature
   ```
4. **Make your changes**
   - Follow the code style and structure of the project.
   - Add tests if applicable.
   - Update documentation as needed.
5. **Commit your changes**
   ```bash
   git commit -m "feat: add my awesome feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```
7. **Open a Pull Request**
   - Go to the original repository on GitHub.
   - Click "Compare & pull request".
   - Fill out the PR template and submit.

## Code Style & Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
- Run `npm run lint` and `npm run format` before committing.
- Ensure all tests pass before submitting your PR.
- Use descriptive PR titles and provide context in the description.

### Commit Message Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) to keep our commit history clean and meaningful. Please use the following structure for your commit messages:

```
type(scope?): subject

body? (optional, longer explanation)

footer? (optional, e.g. BREAKING CHANGE or issue reference)
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
- `feat(api): add rental endpoint`
- `fix(client): correct rental post display bug`
- `docs: update README with getting started instructions`
- `chore: update dependencies`
- `refactor(api): simplify user service logic`

For more details, see the [Conventional Commits documentation](https://www.conventionalcommits.org/).

## Running Locally

- Install dependencies: `npm install`
- Start development: `npm run dev`
- See [README.md](./README.md#getting-started) for more info.

## Reporting Issues

- Use [GitHub Issues](https://github.com/CS-Martin/lendr/issues) to report bugs or request features.
- Please provide as much detail as possible (steps to reproduce, screenshots, logs, etc).

## Code of Conduct

Please be respectful and considerate in all interactions. See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) if available.

---

Thank you for helping make Lendr better! 💜
