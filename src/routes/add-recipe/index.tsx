import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import RecipeForm from '../../components/recipe-form'
import authClient from '../../lib/auth-client'
import { addRecipe } from '../recipe/recipes'

export const Route = createFileRoute('/add-recipe/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const createRecipe = useServerFn(addRecipe)
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  if (isSessionPending) {
    return (
      <main className="page-shell pb-16 pt-8 md:pt-10">
        <section className="card border border-base-300/70 bg-base-100/85 shadow-xl">
          <div className="card-body items-center gap-4 p-10 text-center">
            <span className="loading loading-dots loading-lg text-primary" />
            <p className="text-sm text-base-content/70">Loading your kitchen...</p>
          </div>
        </section>
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="page-shell pb-16 pt-8 md:pt-10">
        <section className="hero-panel card border border-base-300/70 bg-base-100/85 shadow-2xl">
          <div className="card-body gap-6 p-8 sm:p-10">
            <p className="section-label">Add recipe</p>
            <h1 className="brand-title text-5xl font-bold text-base-content sm:text-6xl">
              Sign in before you start cooking.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-base-content/70">
              You need an account to save recipes, keep drafts private, and manage your own dishes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="btn btn-primary rounded-full">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-secondary rounded-full">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card fade-up border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body gap-8 p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="section-label mb-4">Recipe Studio</p>
              <h1 className="brand-title text-5xl font-bold tracking-tight text-base-content sm:text-6xl">
                Write a recipe people can cook without guessing.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-base-content/70">
                Start with the essentials, keep the steps clear, and decide later whether the recipe stays private or joins the public cookbook.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/recipe/recipes" className="btn btn-outline rounded-full">
                Browse Recipes
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['1. Name it well', 'Use a title that tells people what the dish actually is.'],
              ['2. Make it repeatable', 'Break your method into short steps that are easy to follow.'],
              ['3. Choose visibility', 'Save it as a private test or publish it for everyone.'],
            ].map(([title, copy]) => (
              <article key={title} className="card border border-base-300/70 bg-base-100/75 shadow-lg">
                <div className="card-body gap-2 p-5">
                  <h2 className="card-title text-lg">{title}</h2>
                  <p className="text-sm leading-7 text-base-content/70">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <RecipeForm
          kicker="New Recipe"
          title="Capture the dish while it still tastes fresh in your mind."
          description="Add ingredients, clear steps, and a short overview so future-you or anyone you share it with can cook it again with confidence."
          submitLabel="Save Recipe"
          submittingLabel="Saving..."
          hideIntro
          onSubmit={async (data) => {
            await createRecipe({ data })
            await navigate({ to: '/recipe/recipes' })
          }}
        />

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <article className="card border border-base-300/70 bg-neutral text-neutral-content shadow-2xl">
            <div className="card-body gap-4 p-6">
              <p className="section-label text-amber-300">Before you save</p>
              <ul className="space-y-3 text-sm leading-7 text-neutral-content/80">
                <li className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  <span>One ingredient per line keeps the recipe easy to edit later.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-secondary" />
                  <span>Each step should describe one action instead of combining everything at once.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
                  <span>Use private mode while testing, then publish once the recipe feels reliable.</span>
                </li>
              </ul>
            </div>
          </article>

          <article className="glass-panel card border border-base-300/70 bg-base-100/90 shadow-xl">
            <div className="card-body gap-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="card-title text-xl">Good recipe checklist</h2>
                <span className="badge badge-secondary badge-outline">Creator mode</span>
              </div>

              <div className="space-y-3 text-sm text-base-content/70">
                <div className="rounded-2xl bg-base-200/70 px-4 py-3">
                  Clear title and short overview
                </div>
                <div className="rounded-2xl bg-base-200/70 px-4 py-3">
                  Real ingredient list, not paragraphs
                </div>
                <div className="rounded-2xl bg-base-200/70 px-4 py-3">
                  Steps written in the order someone cooks them
                </div>
                <div className="rounded-2xl bg-base-200/70 px-4 py-3">
                  Cook time and difficulty when you know them
                </div>
              </div>
            </div>
          </article>

          <article className="glass-panel card border border-base-300/70 bg-base-100/90 shadow-xl">
            <div className="card-body gap-4 p-6">
              <p className="section-label">Privacy</p>
              <h2 className="card-title text-xl">You control when it goes public.</h2>
              <p className="text-sm leading-7 text-base-content/70">
                Save drafts privately while you test the dish. When it is ready, flip visibility on and it will show up in the public recipes feed.
              </p>
            </div>
          </article>
        </aside>
      </section>
    </main>
  )
}
