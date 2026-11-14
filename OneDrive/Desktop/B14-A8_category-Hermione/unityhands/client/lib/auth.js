import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

// Reuse one Mongo client across hot reloads and serverless invocations.
const globalForMongo = globalThis;
const client = (globalForMongo._unityhandsMongo ||= new MongoClient(process.env.MONGODB_URI));
const db = client.db(process.env.DB_NAME || "unityhands");

const githubConfigured = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders: githubConfigured
    ? { github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET } }
    : {},
  // The Express API verifies this token against /api/auth/jwks and reads email + name from it.
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({ email: user.email, name: user.name }),
      },
    }),
  ],
});
