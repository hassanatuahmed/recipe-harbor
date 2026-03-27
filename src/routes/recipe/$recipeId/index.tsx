import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import authClient from '../../../lib/auth-client'
import { getRecipeById } from '../recipes'

export const Route = createFileRoute('/recipe/$recipeId/')({
  loader: async ({ params }) => {
    const recipe = await getRecipeById({ data: { id: params.recipeId } })

    if (!recipe) {
      throw notFound()
    }

    return recipe
  },
  component: RecipeDetailsRoute,
})

function RecipeDetailsRoute() {
  const recipe = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const isAuthor = session?.user?.id === recipe.author.id
  const formattedDifficulty = recipe.difficulty
    ? recipe.difficulty.charAt(0) + recipe.difficulty.slice(1).toLowerCase()
    : 'Not specified'

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card fade-up border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body gap-8 p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="section-label mb-4">Recipe details</p>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`badge ${recipe.isPublic ? 'badge-primary' : 'badge-outline'} badge-lg`}>
                  {recipe.isPublic ? 'Public recipe' : 'Private recipe'}
                </span>
                <span className="badge badge-secondary badge-outline badge-lg">{formattedDifficulty}</span>
                {recipe.cookTime ? <span className="badge badge-outline badge-lg">{recipe.cookTime} min</span> : null}
              </div>
              <h1 className="brand-title text-5xl font-bold tracking-tight text-base-content sm:text-6xl">
                {recipe.title || 'Untitled recipe'}
              </h1>
              <p className="mt-4 text-sm text-base-content/65">
                By {recipe.author.name || 'Anonymous'} / Added {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
              {recipe.overview ? (
                <p className="mt-5 max-w-3xl text-base leading-8 text-base-content/70">{recipe.overview}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/recipe/recipes" className="btn btn-outline rounded-full">
                Back to Recipes
              </Link>
              {isAuthor ? (
                <Link to="/recipe/$recipeId/edit" params={{ recipeId: recipe.id }} className="btn btn-primary rounded-full">
                  Edit Recipe
                </Link>
              ) : null}
            </div>
          </div>

          <div className="stats stats-vertical glass-panel border border-base-300/70 bg-base-100/75 shadow lg:stats-horizontal">
            <div className="stat">
              <div className="stat-title">Ingredients</div>
              <div className="stat-value text-primary">{recipe.ingredients.length}</div>
              <div className="stat-desc">Every item you need in one place.</div>
            </div>
            <div className="stat">
              <div className="stat-title">Steps</div>
              <div className="stat-value text-secondary">{recipe.steps.length}</div>
              <div className="stat-desc">A method you can actually follow.</div>
            </div>
            <div className="stat">
              <div className="stat-title">Cook time</div>
              <div className="stat-value text-accent">{recipe.cookTime ?? '-'}</div>
              <div className="stat-desc">
                {recipe.cookTime ? 'Minutes from start to finish.' : 'Add timing when you know it.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <article className="glass-panel card border border-base-300/70 bg-base-100/90 shadow-2xl">
          <div className="card-body gap-5 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label mb-2">Ingredients</p>
                <h2 className="text-2xl font-semibold text-base-content">Shopping-ready list</h2>
              </div>
              <span className="badge badge-neutral badge-lg">{recipe.ingredients.length} items</span>
            </div>

            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-base-300/70 bg-base-200/50 px-4 py-3 text-sm text-base-content/80"
                >
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="glass-panel card border border-base-300/70 bg-base-100/90 shadow-2xl">
          <div className="card-body gap-5 p-6 sm:p-8">
            <div>
              <p className="section-label mb-2">Method</p>
              <h2 className="text-2xl font-semibold text-base-content">Cook it step by step</h2>
            </div>

            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li
                  key={`${step}-${index}`}
                  className="rounded-[1.5rem] border border-base-300/70 bg-base-200/50 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                      {index + 1}
                    </div>
                    <p className="m-0 pt-1 text-sm leading-7 text-base-content/80">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </article>
      </section>
    </main>
  )
}
