"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionPending && session?.user) {
      router.replace("/chat");
    }
  }, [router, session, sessionPending]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");

    if (!email.trim() || !password) {
      setErrorText("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorText(error.message || "Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/chat");
    router.refresh();
  }

  return (
    <section className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Continue to your TL;DR workspace.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {errorText ? (
          <p className="text-sm text-destructive">{errorText}</p>
        ) : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}

