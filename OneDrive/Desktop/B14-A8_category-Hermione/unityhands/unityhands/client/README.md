# UnityHands – Social Development Events Platform

**Deployment status:** Live client/API URLs and the two GitHub repository URLs have not yet been verified. Add the real links here after deployment; see [DEPLOY.md](DEPLOY.md).

## Features
- Create, update and delete community service events, with ownership enforced on the server
- Public Upcoming Events page with search and type filter; past events are hidden automatically
- Join events (stored in MongoDB, duplicates blocked) and see them sorted by date on Joined Events
- Email/password and GitHub login with BetterAuth; JWT-protected Express API
- Light/dark theme toggle, loading skeletons, and profile name/photo update
- Validation on login, register, create and update forms, with SweetAlert2 toasts

## Submission checklist
- Publish and verify the client and server, then record both live URLs above.
- Record the client and server GitHub repository URLs here.
- Verify at least 15 meaningful client commits and 8 meaningful server commits in the real repository histories.
- Test GitHub OAuth with the deployed callback URL.
- Reload each protected route while logged in, and verify public event details while logged out.
- Test create, update, join and delete with two accounts to verify ownership restrictions.

## Setup
Client: `cd client && cp .env.example .env.local && npm i && npm run dev`  
Server: `cd server && npm i && npm run dev` (create `.env` using the variable list in `DEPLOY.md`)  
Set `CLIENT_URL` on the server to the client's origin (it fetches the JWKS from `/api/auth/jwks`).

## Project structure
- `app/` pages: `/`, `/events`, `/events/[id]`, `/create`, `/manage`, `/joined`, `/profile`, `/login`, `/register`
- `app/api/auth/[...all]` BetterAuth handler; `lib/auth.js` holds the config (MongoDB adapter, email/password, GitHub, JWT plugin)
- `lib/api.js` calls the Express API and attaches a short-lived JWT from `authClient.token()`
- `middleware.js` redirects logged-out visitors from `/create`, `/manage`, `/joined` and `/profile` to `/login?next=...`

## Code verification
Run `npm test` in both `client/` and `server/`.

Client checks parse every application source file and verify event validation, safe login redirects and the server-side registration password policy. Server checks exercise the real Express routes and signed JWT validation with isolated in-memory database fixtures, including ownership, duplicate joins, past-event exclusion and the six-event limit. These checks do not replace a production build or testing against the deployed MongoDB and GitHub OAuth configuration.

Protected pages wait for the persisted BetterAuth session before loading private data. The API verifies the JWT signature, expiry, issuer, audience and identity. Browser form failures display SweetAlert feedback and release their loading state.
