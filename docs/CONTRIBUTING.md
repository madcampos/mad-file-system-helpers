# Contributing guide

## Development Environment

- **Package Manager**: `pnpm`
- **Language**: TypeScript
- **Runtime**: Node.js
- **Formatter**: `dprint`
- **Linter**: `oxlint`
- **Testing**: `vitest` with Playwright (for browser FS API)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Install Playwright browsers (required for tests):
   ```bash
   pnpm run bootstrap
   ```

## Workflow

1. Fork the repo and create your branch from `main`.
2. Implement new features or fix bugs.
3. Review existings tests to ensure nothign breaks, and add new tests for the added functionality.
4. Update the code documentation.
5. Run lining and formatter.
6. Create a Pull Request.

### Useful Commands

- `pnpm run test`: Run tests using Vitest.
- `pnpm run format`: Format code using `dprint`.
- `pnpm run lint`: Run type-checking and `oxlint`.
- `pnpm run docs`: Generate API documentation in markdown format from typescript.

## Code Standards

- **Formatting**: We use `dprint`. Please run `pnpm run format` before committing.
- **Linting**: We use `oxlint`. Ensure `pnpm run lint` passes.
- **Style**:
  - Prefer modern, standards-based web APIs.
  - Simple and direct code is better than clever.
  - No shims or dead-code comments. Code specific to a platform should be self contained in a module.

## Commit Messages

The repo follows [Conventional Commits](https://www.conventionalcommits.org/).

Example: `feat: implemented a new feature`

## Licensing

By contributing, you agree that your contributions will be licensed under its LGPL-2.1-or-later License.
