# Deploy UnityHands (about 20 minutes)

1. **MongoDB Atlas**: create a free cluster, add a database user, allow access from anywhere (0.0.0.0/0), copy the connection string.
2. **Push to GitHub**: two repos, `unityhands-client` (the client folder) and `unityhands-server` (the server folder). Preserve meaningful development history (15+ notable client commits, 8+ notable server commits); do not create empty commits to reach a count.
3. **Deploy server on Vercel** (import the server repo). Environment variables:
   MONGODB_URI, DB_NAME=unityhands, CLIENT_URL=(client URL, set after step 4). Redeploy once CLIENT_URL is set.
4. **Deploy client on Vercel** (import the client repo). Environment variables:
   MONGODB_URI, DB_NAME, BETTER_AUTH_SECRET (any long random text), BETTER_AUTH_URL=(client URL),
   NEXT_PUBLIC_API_URL=(server URL), GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
   You get the client URL after the first deploy: set BETTER_AUTH_URL then redeploy.
5. **GitHub login**: GitHub > Settings > Developer settings > OAuth Apps > New. Callback URL: CLIENT_URL/api/auth/callback/github.
6. **Seed events**: register on your live site, then locally in server/: set MONGODB_URI and SEED_EMAIL (your login email) in .env, run `npm i && npm run seed`.
7. Put the live URL in client/README.md, then test: reload /manage while logged in, and reload /events/<id> while logged out.

## Final verification
- Confirm the production build succeeds and the actual client/API URLs are recorded in README.md.
- Create at least six future events through the Create Event page; confirm all six appear on Home.
- Register with `Abcdef` (valid); reject passwords missing an uppercase letter, lowercase letter or six characters.
- Confirm create success redirects to Upcoming Events. Update and delete only your own events.
- As a second account, join an event and confirm Joined Events is sorted by date; repeat join attempts must not duplicate records.
- Verify anonymous visitors can read event details but must sign in to join.
- Reload /create, /manage, /joined and /profile while signed in; confirm the session persists.
- Test GitHub login, mobile navigation, display-name hover, visible logout, and both themes on phone, tablet and desktop.
- Gallery and newsletter are static presentation sections; newsletter subscriptions are intentionally not collected.
