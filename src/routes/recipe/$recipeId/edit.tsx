import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import RecipeForm from '../../../components/recipe-form'
import authClient from '../../../lib/auth-client'
import { getRecipeById, updateRecipe } from '../recipes'

export const Route = createFileRoute('/recipe/$recipeId/edit')({
  loader: async ({ params }) => {
    const recipe = await getRecipeById({ data: { id: params.recipeId } })

    if (!recipe) {
      throw notFound()
    }

    return recipe
  },
  component: EditRecipeRoute,
})

function EditRecipeRoute() {
  const navigate = useNavigate()
  const recipe = Route.useLoaderData()
  const saveRecipe = useServerFn(updateRecipe)
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <main className="page-shell pb-16 pt-8 md:pt-10">
        <section className="card border border-base-300/70 bg-base-100/85 shadow-xl">
          <div className="card-body items-center gap-4 p-10 text-center">
            <span className="loading loading-dots loading-lg text-primary" />
            <p className="text-sm text-base-content/70">Loading recipe editor...</p>
          </div>
        </section>
      </main>
    )
  }

  if (!session?.user || session.user.id !== recipe.author.id) {
    return (
      <main className="page-shell pb-16 pt-8 md:pt-10">
        <section className="hero-panel card border border-base-300/70 bg-base-100/85 shadow-2xl">
          <div className="card-body gap-6 p-8 sm:p-10">
            <p className="section-label">Edit recipe</p>
            <h1 className="brand-title text-5xl font-bold text-base-content sm:text-6xl">
              You can only edit your own recipes.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-base-content/70">
              Sign in with the original author account to update this recipe.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="btn btn-primary rounded-full">
                Log In
              </Link>
              <Link to="/recipe/recipes" className="btn btn-outline rounded-full">
                Back to Recipes
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hero-panel card fade-up border border-base-300/70 bg-base-100/85 shadow-2xl">
          <div className="card-body gap-6 p-8 sm:p-10">
            <p className="section-label">Edit recipe</p>
            <h1 className="brand-title text-5xl font-bold text-base-content sm:text-6xl">
              Refine the details and keep this recipe sharp.
            </h1>
            <p className="text-base leading-8 text-base-content/70">
              Adjust ingredients, fix the steps, or change visibility whenever this dish evolves.
            </p>

            <div className="stats stats-vertical border border-base-300/70 bg-base-100/70 shadow">
              <div className="stat">
                <div className="stat-title">Current status</div>
                <div className="stat-value text-primary">{recipe.isPublic ? 'Public' : 'Private'}</div>
                <div className="stat-desc">Visibility can change any time.</div>
              </div>
              <div className="stat">
                <div className="stat-title">Ingredient count</div>
                <div className="stat-value text-secondary">{recipe.ingredients.length}</div>
                <div className="stat-desc">You can add or remove items below.</div>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                ['Tighten the method', 'Clarify steps so the recipe is easier to repeat.'],
                ['Update the story', 'Refresh the overview when the dish changes direction.'],
                ['Control visibility', 'Flip between private testing and public sharing.'],
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
        </div>

        <RecipeForm
          kicker="Recipe Editor"
          title={recipe.title || 'Untitled recipe'}
          description="Edit the content below and save when the recipe feels right."
          submitLabel="Update Recipe"
          submittingLabel="Updating..."
          initialValues={{
            title: recipe.title,
            overview: recipe.overview,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            difficulty: recipe.difficulty,
            cookTime: recipe.cookTime,
            isPublic: recipe.isPublic,
          }}
          onSubmit={async (data) => {
            await saveRecipe({
              data: {
                id: recipe.id,
                input: data,
              },
            })

            await navigate({ to: '/recipe/recipes' })
          }}
        />
      </section>
    </main>
  )
}
