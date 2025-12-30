# 🐴 Stajnia Wolnowybiegowa na Psiej Górze

A comprehensive horse stable management system with bilingual support (Polish/English).

## Features

### 🔐 Member Portal (Portal Jeźdźca)
- Login system for riders (email + password)
- View upcoming training sessions
- Information includes: Time, Trainer name, and assigned Horse

### 🍽️ Feeding Module (Moduł Żywieniowy)
- Define post-training meals for each horse
- Automatic generation of feeding lists based on Sunday schedule
- Dedicated view for stable hands with task checklist

### 📊 Admin Dashboard
- Full management capabilities
- Horse workload visualization (green/yellow/red indicators)
- Welfare validation system

### 👤 Role-Based Access
- **Admin**: Full system management
- **Rider**: View personal schedule
- **Trainer**: View assigned lessons
- **Stable Hand**: Feeding task management

### 🐎 Horse Welfare System
- Work limit validation (blocks assignment if limits exceeded)
- Required break validation (1h rest after 2h work)
- Level matching warnings (horse level vs rider level)

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- i18next (PL/EN)
- Lucide Icons
- date-fns

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite Database
- JWT Authentication
- bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up the database:
```bash
cd server
npx prisma generate
npx prisma db push
```

3. Seed the database with sample data:
```bash
npm run db:seed
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Demo Credentials

Default password for all demo accounts is controlled by `SEED_PASSWORD` environment variable (default: `changeme123`).

| Role | Email |
|------|-------|
| Admin | admin@stajnia.pl |
| Trainer | anna@stajnia.pl |
| Rider | maria@example.com |
| Stable Hand | tomek@stajnia.pl |

## Project Structure

```
stajnia-psia-gora/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   ├── i18n.ts         # Translations
│   │   └── App.tsx         # Main app component
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── seed.ts         # Database seeder
│   │   └── index.ts        # Server entry point
│   └── prisma/
│       └── schema.prisma   # Database schema
└── package.json            # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (Admin only)
- `GET /api/auth/me` - Get current user

### Horses
- `GET /api/horses` - List all horses
- `POST /api/horses` - Create horse (Admin)
- `PUT /api/horses/:id` - Update horse (Admin)
- `DELETE /api/horses/:id` - Deactivate horse (Admin)

### Users
- `GET /api/users` - List all users (Admin)
- `GET /api/users/riders` - List riders
- `GET /api/users/trainers` - List trainers

### Schedules
- `GET /api/schedules/date/:date` - Get schedules for date
- `GET /api/schedules/my-schedules` - Get rider's schedules
- `GET /api/schedules/trainer-schedules` - Get trainer's schedules
- `POST /api/schedules` - Create schedule (Admin)
- `POST /api/schedules/validate` - Validate welfare

### Feeding
- `GET /api/feeding/date/:date` - Get feeding tasks
- `PUT /api/feeding/:id/complete` - Mark task complete
- `POST /api/feeding/generate/:date` - Generate tasks

## License

Private - All rights reserved

---

Built with ❤️ for Stajnia Wolnowybiegowa na Psiej Górze
