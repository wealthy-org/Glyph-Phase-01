# Glyph — Phase 01

> Autonomous Economic Being with Onchain Identity

Glyph is an autonomous digital being with an onchain identity, wallet, memory, economic history, and the ability to make and record market decisions. Phase 01 is a **Testnet / Paper Trading MVP**.

## Core Loop

**Identity → Wallet → Capital Simulation → Research → Decision → Onchain Record → Outcome → Memory → Reputation**

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion
- **Database:** PostgreSQL + Prisma ORM
- **Blockchain:** Wagmi, Viem, OpenZeppelin (ERC-8004)
- **UI:** shadcn/ui, Lucide Icons

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/             # Next.js App Router pages
│   ├── about/       # About page
│   ├── identity/    # Identity module
│   ├── life/        # Life module
│   └── trades/      # Trades module
├── features/        # Feature-based modules
contracts/           # Smart contracts (Solidity)
prisma/              # Database schema & migrations
```

## Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Start development server     |
| `npm run build`    | Build for production         |
| `npm run start`    | Start production server      |
| `npm run lint`     | Run ESLint                   |
| `npm run prisma:reset` | Reset & seed database   |

## License

Private — All rights reserved.
