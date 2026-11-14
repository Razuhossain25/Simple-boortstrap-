# UnityHands – Social Development Events Platform

**Live site:** https://your-unityhands-client.vercel.app  
**API:** https://your-unityhands-server.vercel.app

## Features
- Create, update and delete community service events, with ownership enforced on the server
- Public Upcoming Events page with search and type filter; past events are hidden automatically
- Join events (stored in MongoDB, duplicates blocked) and see them sorted by date on Joined Events
- Email/password and GitHub login with BetterAuth; JWT-protected Express API
- Light/dark theme toggle, loading skeletons, and profile name/photo update
- Validation on login, register, create and update forms, with SweetAlert2 toasts

## Setup
Client: `cd client && cp .env.example .env.local && npm i && npm run dev`  
Server: `cd server && cp .env.example .env && npm i && npm run dev`  
Set `CLIENT_URL` on the server to the client's origin (it fetches the JWKS from `/api/auth/jwks`).

## Project structure
- `app/` pages: `/`, `/events`, `/events/[id]`, `/create`, `/manage`, `/joined`, `/profile`, `/login`, `/register`
- `app/api/auth/[...all]` BetterAuth handler; `lib/auth.js` holds the config (MongoDB adapter, email/password, GitHub, JWT plugin)
- `lib/api.js` calls the Express API and attaches a short-lived JWT from `authClient.token()`
- `middleware.js` redirects logged-out visitors from `/create`, `/manage`, `/joined` and `/profile` to `/login?next=...`
