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

if (!authSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET in environment variables");
}

export const auth = betterAuth({
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  database: mongodbAdapter(mongoClient.db(), {
    client: mongoClient,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
});
