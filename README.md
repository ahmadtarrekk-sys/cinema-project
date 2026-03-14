# Lumière Cinema — Premium Booking Platform

A full-featured cinema booking web application built with **Next.js 16**, **TypeScript**, **Prisma + PostgreSQL**, **Auth.js**, **Tailwind CSS + shadcn/ui**, **Framer Motion**, and **Socket.IO**.

## Features

- 🎬 **Movie & Cinema catalog** with search, filters, and cinematic design
- 🪑 **Interactive seat selection** with real-time sync via Socket.IO
- 🍿 **Concessions ordering** — snacks, drinks, combos with size/flavor options
- 💳 **Payment flow** — Stripe test mode or built-in mock payment
- 🤖 **Smart chatbot** — mood-based movie recommendations (local engine + optional OpenAI)
- 🔐 **Auth** — login, register, forgot/reset password with Auth.js Credentials
- 📱 **Responsive** premium dark theme with cinematic animations
- 🛡️ **Admin panel** — CRUD management for cinemas, movies, showtimes, concessions

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| Language       | TypeScript                          |
| Database       | PostgreSQL + Prisma ORM             |
| Auth           | Auth.js (Credentials)               |
| Styling        | Tailwind CSS + shadcn/ui            |
| Animations     | Framer Motion                       |
| Real-time      | Socket.IO                           |
| State          | Zustand (client)                    |
| Validation     | Zod                                 |
| Payments       | Stripe (optional) / Mock fallback   |
| AI             | Local rules engine / OpenAI (optional) |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### 1. Clone & install

```bash
cd cinema
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DATABASE_URL="postgresql://user:password@localhost:5432/cinema_db"
NEXTAUTH_SECRET="any-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login

| Email              | Password  | Role  |
| ------------------ | --------- | ----- |
| demo@lumiere.com   | demo1234  | User  |
| admin@lumiere.com  | admin1234 | Admin |

## Optional Features

### Stripe Payments

Add your Stripe test keys to `.env`:

```
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

Without keys, the app uses a built-in mock payment flow that marks bookings as paid.

### OpenAI Chatbot

Add your OpenAI key to `.env`:

```
OPENAI_API_KEY="sk-..."
```

Without the key, the chatbot uses a local rules-based recommendation engine.

## Project Structure

```
cinema/
├── prisma/              # Schema, migrations, seed
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # UI components
│   │   ├── layout/      # Navbar, Footer
│   │   └── ui/          # shadcn/ui + custom components
│   └── lib/             # Utilities, constants, DB client
├── .env.example
├── next.config.ts
└── package.json
```

## License

MIT
