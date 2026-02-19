import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_URI_NON_SRV =
  process.env.MONGODB_URI_NON_SRV ??
  process.env.MONGODB_URI_DIRECT ??
  process.env.MONGODB_URI_FALLBACK;

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
    statusCode?: number;
    name?: string;
  };

  if (isSrvLookupError(err)) {
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

  if (isServerSelectionError(err)) {
    const friendly = new Error(
      "Database server selection timed out. Verify MongoDB network access (Atlas IP Access List), connection URI, and cluster status."
    ) as Error & {
      code?: string;
      statusCode?: number;
    };
    friendly.code = "DB_SERVER_SELECTION_TIMEOUT";
    friendly.statusCode = 503;
    return friendly;
  }

  return err;
}

function isSrvLookupError(
  err: Error & { code?: string; syscall?: string; hostname?: string }
) {
  if (err?.syscall !== "querySrv") return false;
  return ["ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND", "ETIMEOUT"].includes(
    err?.code || ""
  );
}

function isServerSelectionError(err: Error & { name?: string }) {
  return (
    err?.name === "MongooseServerSelectionError" ||
    err?.message?.includes("Server selection timed out") === true
  );
}

function isRetryableMongoConnectError(
  err: Error & { code?: string; syscall?: string; hostname?: string; name?: string }
) {
  if (isSrvLookupError(err) || isServerSelectionError(err)) return true;
  return ["ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND", "ETIMEOUT", "ETIMEDOUT"].includes(
    err?.code || ""
  );
}

async function connectWithUri(uri: string) {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
}

export async function connectToDatabase() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = connectWithUri(MONGODB_URI!)
      .catch(async (error) => {
        if (
          isRetryableMongoConnectError(
            error as Error & {
              code?: string;
              syscall?: string;
              hostname?: string;
              name?: string;
            }
          ) &&
          MONGODB_URI_NON_SRV &&
          MONGODB_URI_NON_SRV !== MONGODB_URI
        ) {
          return connectWithUri(MONGODB_URI_NON_SRV);
        }
        throw error;
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
