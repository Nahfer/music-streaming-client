This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

🎵 Music Streaming App (Frontend + API)

This repository contains a full-stack music streaming project, split into two main applications:

music-streaming-api/ — Backend (Next.js API routes, Prisma + Supabase)
GOTO: https://github.com/Nahfer/music-streaming-API

music-streaming-frontend/ — Frontend (Next.js app, React)

The backend exposes REST API endpoints for artists, albums, playlists, authentication, and search.
The frontend consumes these APIs and provides a responsive UI with pages for discovery, artists, albums, playlists, profile, and authentication.

👥 Members

Nahom Demeke — Backend & API Development

Tihitna Ejigu — Frontend / Client-side Development

⚡ Tech Stack

Frontend: Next.js (App Router), React

Backend: Next.js (API Routes), Prisma

Database / Storage: Supabase (Postgres & Storage Buckets)

Authentication: JWT + bcrypt (backend)

ORM: Prisma (connected to Supabase Postgres)

📂 Project Structure (high-level)
music-streaming-api/         # Backend
 ├── app/api/                # API routes (artist, auth, discover, lyrics, playlist, profile, search)
 ├── lib/prisma.ts           # Prisma client
 ├── prisma/schema.prisma    # Database schema
 └── middleware/             # Authentication & validation middleware

music-streaming-frontend/    # Frontend
 ├── app/                    # App router pages
 ├── components/             # Shared UI components
 └── services/               # API client helpers

🗄️ Supabase (Database & Storage)

This project uses Supabase for:

Postgres Database (schema managed by Prisma)

Storage Buckets (for album art, artist images, audio files, user avatars)

Supabase assets are cached on a CDN to improve latency and reduce client-side processing.

How it all fits together:

Prisma manages and queries the Postgres database.

Supabase Storage stores and serves media assets with signed URLs.

Backend generates signed upload/download URLs when needed.

Example Environment Variables

##Backend (.env):

 Supabase Database
DATABASE_URL="postgresql://USER:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

 Auth
JWT_SECRET="your-secret-key"


Frontend (.env.local):

NEXT_PUBLIC_API_BASE_URL=https://music-streaming-api-next.vercel.app

🛠️ Local Development
1. Prerequisites

Node.js v18+

npm / pnpm / yarn

A Supabase project with Postgres + storage bucket

2. Backend Setup
cd music-streaming-api
npm install


Create .env and add DATABASE_URL, DIRECT_URL, JWT_SECRET.

Run the development server:

npm run dev


Database setup:

npx prisma generate
npx prisma db push        # or: npx prisma migrate deploy

3. Frontend Setup
cd music-streaming-frontend
npm install


Create .env.local with NEXT_PUBLIC_API_BASE_URL.

Run the development server:

npm run dev


By default, both Next.js apps run on port 3000.
If running frontend and backend together, use different ports (e.g. backend on 3001).

📌 API Endpoints
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	Login & receive JWT
/api/artist	GET	List artists
/api/artist/[artist_id]	GET	Artist details
/api/artist/[artist_id]/[album_id]	GET	Album details
/api/discover	GET	Discovery home
/api/discover/[genre_id]	GET	Discover by genre
/api/lyrics	GET	Fetch lyrics
/api/playlist	GET/POST	Manage playlists
/api/playlist/[playlist_id]	GET	Playlist details
/api/profile	GET	User profile (protected)
/api/search	GET	Search across resources
🚀 Deployment

Both frontend and backend are deployed on Vercel.

Next.js provides first-class support for Vercel deployments.

🔮 Next Steps

Verify Prisma schema matches your Supabase schema.

Configure RLS policies and bucket permissions in Supabase before production.

Consider using Supabase’s JS client for signed URL generation and media uploads.

🤝 Contributing

Open issues or PRs for bug fixes & improvements.

Keep environment keys secret and out of source control.
