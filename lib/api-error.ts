import { NextResponse } from "next/server";

type MaybeError = Error & {
  code?: string;
  statusCode?: number;
  hostname?: string;
};

export function toApiErrorResponse(error: unknown) {
  const err = error as MaybeError;

  if (err?.code === "DB_DNS_SRV_FAILED") {
    return NextResponse.json(
      {
        error:
          "Database connection failed due to DNS SRV lookup. Retry in a moment, or switch to a non-SRV MongoDB URI.",
        code: "DB_DNS_SRV_FAILED",
        hostname: err.hostname || null,
      },
      { status: err.statusCode || 503 }
    );
  }

  if (err?.code === "DB_SERVER_SELECTION_TIMEOUT") {
    return NextResponse.json(
      {
        error:
          "Database server selection timed out. Check Atlas IP Access List, connection URI, and cluster availability.",
        code: "DB_SERVER_SELECTION_TIMEOUT",
      },
      { status: err.statusCode || 503 }
    );
  }

  if (err?.code === "AUTH_REQUIRED") {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: err.statusCode || 401 }
    );
  }

  console.error("API error:", err);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
