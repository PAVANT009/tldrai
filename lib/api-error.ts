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

  console.error("API error:", err);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
