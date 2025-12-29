# Stajnia Psia Góra - Development Instructions

## Project Overview
This is a bilingual (PL/EN) horse stable management system built with React + TypeScript frontend and Node.js + Express backend.

## Tech Stack
- Frontend: React 18, TypeScript, Vite, TailwindCSS, React Router, i18next
- Backend: Express, TypeScript, Prisma ORM, SQLite, JWT
- Styling: TailwindCSS with nature-themed design

## Development Commands
- `npm run dev` - Start both frontend and backend
- `npm run dev:client` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with sample data

## Project Structure
- `/client` - React frontend application
- `/server` - Express backend API
- `/server/prisma` - Database schema and migrations

## Key Features
1. Role-based authentication (Admin, Rider, Trainer, Stable Hand)
2. Horse welfare validation (work limits, breaks)
3. Level matching warnings (horse vs rider)
4. Automatic feeding list generation
5. Bilingual interface (PL/EN toggle)

## Code Style
- Use TypeScript strict mode
- Follow React functional component patterns
- Use TailwindCSS for styling
- Use lucide-react for icons
- Support both Polish and English translations
