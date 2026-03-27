import { Link, createFileRoute } from '@tanstack/react-router'

import authClient from '../lib/auth-client'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card fade-up border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body gap-10 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-12">
          <div className="max-w-3xl flex-1">
            <p className="section-label mb-4">Recipe Harbor</p>
            <h1 className="brand-title max-w-3xl text-5xl leading-none font-bold tracking-tight text-base-content sm:text-6xl lg:text-7xl">
              Turn everyday cooking into a collection worth keeping.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-base-content/70 sm:text-lg">
              Save the dishes you actually make, keep experiments private until they are ready, and publish the recipes friends always ask for.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/recipe/recipes" className="btn btn-primary btn-lg rounded-full">
                Browse Recipes
              </Link>
              <Link to="/add-recipe" className="btn btn-outline btn-lg rounded-full">
                Add a Recipe
              </Link>

              {isPending ? (
                <span className="inline-flex items-center px-3">
                  <span className="loading loading-dots loading-md text-primary" />
                </span>
              ) : session?.user ? (
                <Link to="/recipe/my" className="btn btn-secondary btn-lg rounded-full">
                  Continue Cooking
                </Link>
              ) : null}
            </div>
          </div>

          <div className="w-full max-w-xl space-y-4">
            <div className="stats stats-vertical glass-panel w-full border border-base-300/70 bg-base-100/80 shadow">
              <div className="stat">
                <div className="stat-title">Build your cookbook</div>
                <div className="stat-value text-primary">Draft</div>
                <div className="stat-desc">Keep ideas private while you test and tweak.</div>
              </div>
              <div className="stat">
                <div className="stat-title">Publish when ready</div>
                <div className="stat-value text-secondary">Share</div>
                <div className="stat-desc">Flip one switch and put your best dishes in the feed.</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Weeknight-friendly", "Capture quick dinners, prep ideas, and reliable comfort food."],
                ["Kitchen memory", "Store ingredients, overview, difficulty, and clear step-by-step notes."],
              ].map(([title, copy]) => (
                <article
                  key={title}
                  className="glass-panel card border border-base-300/70 bg-base-100/80 shadow-lg"
                >
                  <div className="card-body gap-2 p-5">
                    <h2 className="card-title text-lg">{title}</h2>
                    <p className="text-sm leading-7 text-base-content/70">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Public recipe feed", "Browse what the community is cooking and find your next repeat meal."],
          ["Private drafts", "Hide unfinished ideas until the ingredients and steps feel right."],
          ["Fast author controls", "Edit, delete, and change visibility without leaving the recipe flow."],
          ["Clean cooking notes", "Keep ingredients, method, difficulty, and cook time together in one place."],
        ].map(([title, copy], index) => (
          <article
            key={title}
            className="card fade-up border border-base-300/70 bg-base-100/85 shadow-xl"
            style={{ animationDelay: `${index * 70 + 80}ms` }}
          >
            <div className="card-body gap-3">
              <div className="badge badge-outline badge-secondary">{index + 1}</div>
              <h2 className="card-title text-xl">{title}</h2>
              <p className="text-sm leading-7 text-base-content/70">{copy}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="card border border-base-300/70 bg-neutral text-neutral-content shadow-2xl">
          <div className="card-body gap-4 p-8">
            <p className="section-label text-amber-300">From kitchen to community</p>
            <h2 className="brand-title text-4xl font-bold">A simple flow that feels good every time.</h2>
            <p className="max-w-xl text-sm leading-8 text-neutral-content/80">
              Start with a rough idea, save it privately, and polish it into a recipe that is easy to revisit months later.
            </p>
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["1. Capture", "Write the title, ingredients, and the method while the dish is still fresh in your head."],
            ["2. Refine", "Update the overview, cook time, and difficulty as you learn what works best."],
            ["3. Share", "Publish the final version so other people can cook it too."],
          ].map(([title, copy]) => (
            <article key={title} className="card border border-base-300/70 bg-base-100/85 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg">{title}</h3>
                <p className="text-sm leading-7 text-base-content/70">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
