import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

declare global {
  var betterAuthMongoClient: MongoClient | undefined;
}

const mongoClient =
  global.betterAuthMongoClient ?? new MongoClient(MONGODB_URI);

if (!global.betterAuthMongoClient) {
  global.betterAuthMongoClient = mongoClient;
}

const authSecret = process.env.BETTER_AUTH_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;
const baseURL =
  process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? vercelUrl;
const envTrustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "https://tldrai-opal.vercel.app",
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_APP_URL,
      vercelUrl,
      ...envTrustedOrigins,
    ].filter((value): value is string => Boolean(value))
  )
);

if (!authSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET in environment variables");
}

export const auth = betterAuth({
  secret: authSecret,
  baseURL,
  trustedOrigins,
  database: mongodbAdapter(mongoClient.db(), {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            prompt: "select_account",
          },
        }
      : undefined,
});
