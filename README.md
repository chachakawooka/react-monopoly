# Monopoly Online

A real-time multiplayer Monopoly game (UK Classic Edition) built with Next.js and Partykit.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Partykit** for real-time multiplayer WebSocket server
- **Zustand** for client-side state management

## Getting Started

```bash
npm install

# Start the Next.js dev server
npm run dev

# In another terminal, start the Partykit server
npm run party:dev
```

Open [http://localhost:3000](http://localhost:3000) to create or join a game.

## Deployment

- **Frontend**: Deploy to Vercel (`vercel deploy`)
- **Game Server**: Deploy Partykit (`npm run party:deploy`)
- Set `NEXT_PUBLIC_PARTYKIT_HOST` env var to your deployed Partykit URL

## Features

- 2-4 player real-time multiplayer
- Full UK Classic Monopoly board (40 spaces)
- Property buying, rent, houses/hotels
- Chance & Community Chest cards
- Jail mechanics
- Auctions when a property is declined
- Trading between players
- Mortgage/unmortgage properties
- Bankruptcy and win detection
