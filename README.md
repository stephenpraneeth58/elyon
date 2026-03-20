# Elyon

A full-stack web application built with React, TypeScript, and Motoko on the Internet Computer.

## Features

- Modern React frontend with TypeScript and Vite
- 3D graphics support with Three.js
- Motoko backend deployed on Internet Computer
- Responsive UI with TailwindCSS
- Type-safe development experience

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- pnpm >= 7.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/stephenpraneeth58/elyon.git
cd elyon

# Install dependencies
pnpm install

# Build the project
pnpm run build
```

### Available Scripts

- `pnpm run build` - Build all packages
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run check` - Run code quality checks
- `pnpm run fix` - Auto-fix code issues

## Project Structure

```
elyon/
├── src/
│   ├── frontend/   # React application
│   └── backend/    # Motoko smart contracts
├── scripts/        # Build and utility scripts
└── icp.yaml        # Internet Computer configuration
```

## License

See LICENSE file for details