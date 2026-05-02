# CashPilot Web

CashPilot frontend built with Astro 5 + React 18.

## Stack
- **Framework**: Astro 5.16
- **UI Islands**: React 18
- **Styling**: Tailwind CSS v4
- **State**: Custom stores + localStorage
- **Charts**: Recharts, Chart.js, ApexCharts, lightweight-charts
- **Validation**: Zod v4
- **Build**: Vite (via Astro)
- **Runtime**: Bun

## Setup

```bash
# Install dependencies
bun install

# Environment
cp .env.example .env

# Dev server
bun run dev

# Production build
bun run build
```

## Testing

```bash
# Run Vitest suite
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test:coverage
```

## Project Structure
```
src/
├── components/
│   ├── chartComponents/      # Recharts wrappers
│   ├── reactComponents/      # Client React components
│   ├── ui/                   # shadcn/ui primitives
│   └── UIComponents/         # Forms, tables, modals
├── pages/                    # Astro file-based routing
├── services/                 # API service layer
├── store/                    # Auth + theme stores
├── lib/                      # Utilities (cn, formatters)
├── i18n/                     # Translations
├── schemas/                  # Zod schemas
└── types/                    # TypeScript interfaces
```

## Key Commands
| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run test` | Run all tests |
| `bun run preview` | Preview production build |

## Environment Variables
| Variable | Description |
|----------|-------------|
| `PUBLIC_API_URL` | Backend API base URL |

## Contributing
See [CONTRIBUTING.md](../docs/CONTRIBUTING.md).
