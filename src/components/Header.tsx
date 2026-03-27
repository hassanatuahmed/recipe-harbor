import { Link, useRouter } from "@tanstack/react-router";

import authClient from "../lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userLabel = session?.user?.name || session?.user?.email || "Chef";
  const userInitial = userLabel.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await authClient.signOut();
    await router.invalidate();
    await router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <div className="page-shell">
        <div className="navbar glass-panel rounded-[1.75rem] border border-base-300/70 bg-base-100/85 px-4 shadow-xl">
          <div className="navbar-start gap-2">
            <div className="dropdown lg:hidden">
              <button tabIndex={0} type="button" className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
              >
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/recipe/recipes">Recipes</Link>
                </li>
                <li>
                  <Link to="/recipe/my">My Recipes</Link>
                </li>
                <li>
                  <Link to="/add-recipe">Add Recipe</Link>
                </li>
              </ul>
            </div>

            <Link to="/" className="brand-title text-2xl font-bold tracking-tight text-base-content">
              Recipe Harbor
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal rounded-full bg-base-200/70 p-1 text-sm font-medium">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/recipe/recipes">Recipes</Link>
              </li>
              <li>
                <Link to="/recipe/my">My Recipes</Link>
              </li>
              <li>
                <Link to="/add-recipe">Add Recipe</Link>
              </li>
            </ul>
          </div>

          <div className="navbar-end gap-2">
            {isPending ? (
              <span className="loading loading-dots loading-md text-primary" />
            ) : session?.user ? (
              <>
                <div className="hidden items-center gap-3 rounded-full bg-base-200/80 px-3 py-2 sm:flex">
                  <div className="avatar placeholder">
                    <div className="w-10 rounded-full bg-primary text-primary-content">
                      <span className="text-sm font-bold">{userInitial}</span>
                    </div>
                  </div>
                  <div className="leading-tight">
                    <p className="m-0 text-sm font-semibold text-base-content">{userLabel}</p>
                    <p className="m-0 text-xs text-base-content/60">Kitchen owner</p>
                  </div>
                </div>
                <button type="button" className="btn btn-neutral btn-sm rounded-full" onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm rounded-full">
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm rounded-full">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
