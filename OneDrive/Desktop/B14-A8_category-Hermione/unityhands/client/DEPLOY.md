# Deploy UnityHands (about 20 minutes)

1. **MongoDB Atlas**: create a free cluster, add a database user, allow access from anywhere (0.0.0.0/0), copy the connection string.
2. **Push to GitHub**: two repos, `unityhands-client` (the client folder) and `unityhands-server` (the server folder). Commit in small steps (15+ client, 8+ server).
3. **Deploy server on Vercel** (import the server repo). Environment variables:
   MONGODB_URI, DB_NAME=unityhands, CLIENT_URL=(client URL, set after step 4). Redeploy once CLIENT_URL is set.
4. **Deploy client on Vercel** (import the client repo). Environment variables:
   MONGODB_URI, DB_NAME, BETTER_AUTH_SECRET (any long random text), BETTER_AUTH_URL=(client URL),
   NEXT_PUBLIC_API_URL=(server URL), GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
   You get the client URL after the first deploy: set BETTER_AUTH_URL then redeploy.
5. **GitHub login**: GitHub > Settings > Developer settings > OAuth Apps > New. Callback URL: CLIENT_URL/api/auth/callback/github.
6. **Seed events**: register on your live site, then locally in server/: set MONGODB_URI and SEED_EMAIL (your login email) in .env, run `npm i && npm run seed`.
7. Put the live URL in client/README.md, then test: reload /manage while logged in, and reload /events/<id> while logged out.
