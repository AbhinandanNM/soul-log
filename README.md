## Soul Log

Soul Log is a wellness companion that now ships with Google OAuth authentication backed by a custom Express + PostgreSQL API. The frontend remains a Vite + React + shadcn-ui experience, while the backend manages secure sessions, user profiles, and AI-inspired coaching prompts.

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Google Cloud project with OAuth 2.0 Web Client credentials

### Environment variables

Create an `.env` file in the project root (for the frontend) with:

```
VITE_API_BASE_URL=http://localhost:4000
```

Backend secrets live under `server/.env`; see `server/README.md` for the full list.

### Setup

1. Start the backend:

```bash
cd server
npm install
npm run dev   # http://localhost:4000
```

2. Start the frontend in a second terminal:

```bash
cd thought-retrace-main
npm install
npm run dev   # http://localhost:5173
```

Visit `http://localhost:5173` and sign in with Google to start journaling.

### Tech stack

- React 18 with TypeScript and Vite
- shadcn-ui + Tailwind CSS
- Express 4, Passport.js, Google OAuth 2.0
- PostgreSQL with `connect-pg-simple` session store

### Key features

- Google-based single-click authentication
- Secure session cookies stored in PostgreSQL
- Personalized mind/body/soul coaching prompts
- Protected journal route restricted to signed-in users
- Toast notifications for key auth events

