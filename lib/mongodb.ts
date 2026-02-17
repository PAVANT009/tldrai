import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

function normalizeMongoError(error: unknown) {
  const err = error as Error & {
    code?: string;
    syscall?: string;
    hostname?: string;
  };

  if (err?.code === "ECONNREFUSED" && err?.syscall === "querySrv") {
    const friendly = new Error(
      "Database DNS SRV lookup failed. This is usually a DNS/network resolver issue. Retry, switch DNS, or use a non-SRV MongoDB URI."
    ) as Error & {
      code?: string;
      statusCode?: number;
      hostname?: string;
    };
    friendly.code = "DB_DNS_SRV_FAILED";
    friendly.statusCode = 503;
    friendly.hostname = err.hostname;
    return friendly;
  }

  return err;
}

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI!, {
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        cache.promise = null;
        throw normalizeMongoError(error);
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    throw normalizeMongoError(error);
  }
}
