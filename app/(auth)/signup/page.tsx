"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!name.trim() || !email.trim() || !password) {
      setErrorText("Name, email, and password are required.");
      return;
    }

    if (password.length < 8) {
      setErrorText("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorText(error.message || "Failed to create account.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/chat");
    router.refresh();
  }

  return (
    <section className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Start using TL;DR with your own workspace.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter password"
          />
        </div>

        {errorText ? (
          <p className="text-sm text-destructive">{errorText}</p>
        ) : null}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}

