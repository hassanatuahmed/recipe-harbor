import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body items-start gap-6 p-8 sm:p-10">
          <div>
            <p className="section-label mb-4">Page not found</p>
            <h1 className="brand-title text-5xl font-bold tracking-tight text-base-content sm:text-6xl">
              That recipe page is off the menu.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-base-content/70">
              The page may have been moved, deleted, or never existed. You can head back to the recipe list or return home.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/recipe/recipes" className="btn btn-primary rounded-full">
              Browse Recipes
            </Link>
            <Link to="/" className="btn btn-outline rounded-full">
              Back Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
