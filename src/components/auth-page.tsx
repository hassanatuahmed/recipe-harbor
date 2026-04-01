import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import authClient from "../lib/auth-client";

type AuthPageProps = {
  mode: "login" | "signup";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const title = mode === "login" ? "Welcome back to the kitchen." : "Create your recipe account.";
  const kicker = mode === "login" ? "Login" : "Sign Up";
  const submitLabel = mode === "login" ? "Log In" : "Create Account";
  const switchHref = mode === "login" ? "/signup" : "/login";
  const switchLabel = mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const redirectTo = "/recipe/recipes";

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);

    try {
      if (mode === "login") {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: redirectTo,
        });

        if (result.error) {
          setError(result.error.message ?? "Unable to log in.");
          return;
        }
      } else {
        const result = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: redirectTo,
        });

        if (result.error) {
          setError(result.error.message ?? "Unable to create your account.");
          return;
        }
      }

      await navigate({ to: redirectTo });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsPending(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsPending(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Google sign-in failed.");
      setIsPending(false);
    }
  };

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="hero-panel card fade-up border border-base-300/70 bg-base-100/85 shadow-2xl">
          <div className="card-body gap-8 p-8 sm:p-10">
            <div>
              <p className="section-label mb-4">{kicker}</p>
              <h1 className="brand-title max-w-xl text-5xl leading-tight font-bold text-base-content sm:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-base-content/70">
                Save private drafts, publish finished dishes, and keep your recipe collection organized in one calm workspace.
              </p>
            </div>

            <div className="stats stats-vertical glass-panel border border-base-300/70 bg-base-100/70 shadow">
              <div className="stat">
                <div className="stat-title">Private while testing</div>
                <div className="stat-value text-primary">Draft</div>
                <div className="stat-desc">Keep works in progress out of the public feed.</div>
              </div>
              <div className="stat">
                <div className="stat-title">Fast sign in</div>
                <div className="stat-value text-secondary">Google</div>
                <div className="stat-desc">Join quickly with your existing account.</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Private drafts", "Keep unfinished recipes hidden until they are ready."],
                ["Quick publishing", "Make recipes public whenever you want to share them."],
                ["Your kitchen", "Manage the dishes you authored in one simple flow."],
                ["Cleaner notes", "Store ingredients, timing, and method without clutter."],
              ].map(([heading, copy]) => (
                <article key={heading} className="card border border-base-300/70 bg-base-100/75 shadow-lg">
                  <div className="card-body gap-2 p-5">
                    <h2 className="card-title text-lg">{heading}</h2>
                    <p className="text-sm leading-7 text-base-content/70">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <section
          className="glass-panel card fade-up border border-base-300/70 bg-base-100/90 shadow-2xl"
          style={{ animationDelay: "120ms" }}
        >
          <div className="card-body p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleEmailAuth}>
              <div>
                <p className="section-label mb-3">Account access</p>
                <h2 className="text-3xl font-semibold text-base-content">{submitLabel}</h2>
              </div>

              {mode === "signup" ? (
                <label className="form-control w-full ">
                  <div className="label">
                    <span className="label-text font-medium">Name</span>
                  </div>
                  <input
                    className="input input-bordered w-full mb-4"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Chef name"
                    autoComplete="name"
                    required
                  />
                </label>
              ) : null}

              <label className="form-control w-full ">
                <div className="label">
                  <span className="label-text font-medium">Email</span>
                </div>
                <input
                  className="input input-bordered w-full mb-4"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-control w-full ">
                <div className="label">
                  <span className="label-text font-medium">Password</span>
                </div>
                <input
                  className="input input-bordered w-full mb-4"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter a secure password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </label>

              {mode === "signup" ? (
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium">Confirm password</span>
                  </div>
                  <input
                    className="input input-bordered w-full mb-4"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                </label>
              ) : null}

              {error ? (
                <div className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              ) : null}

              <button className="btn btn-primary w-full rounded-full" type="submit" disabled={isPending}>
                {isPending ? "Working..." : submitLabel}
              </button>
            </form>

            <div className="divider text-xs font-bold uppercase tracking-[0.25em] text-base-content/50">or</div>

            <button
              className="btn btn-outline w-full rounded-full"
              type="button"
              onClick={handleGoogleAuth}
              disabled={isPending}
            >
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-base-content/70">
              <Link to={switchHref} className="link link-hover font-semibold text-primary">
                {switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
