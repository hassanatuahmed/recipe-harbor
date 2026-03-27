import { useState } from 'react'

import type { RecipeCreateInput } from '../routes/recipe/recipes'

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const

type RecipeFormValues = {
  title?: string | null
  overview?: string | null
  ingredients?: string[]
  steps?: string[]
  difficulty?: RecipeCreateInput['difficulty']
  cookTime?: number | null
  isPublic?: boolean
}

type RecipeFormProps = {
  kicker: string
  title: string
  description: string
  submitLabel: string
  submittingLabel: string
  initialValues?: RecipeFormValues
  hideIntro?: boolean
  onSubmit: (data: RecipeCreateInput) => Promise<void>
}

export default function RecipeForm({
  kicker,
  title,
  description,
  submitLabel,
  submittingLabel,
  initialValues,
  hideIntro = false,
  onSubmit,
}: RecipeFormProps) {
  const [recipeTitle, setRecipeTitle] = useState(initialValues?.title ?? '')
  const [overview, setOverview] = useState(initialValues?.overview ?? '')
  const [ingredients, setIngredients] = useState(
    initialValues?.ingredients?.join('\n') ?? '',
  )
  const [steps, setSteps] = useState(initialValues?.steps?.join('\n') ?? '')
  const [difficulty, setDifficulty] = useState(initialValues?.difficulty ?? '')
  const [cookTime, setCookTime] = useState(
    initialValues?.cookTime ? String(initialValues.cookTime) : '',
  )
  const [isPublic, setIsPublic] = useState(initialValues?.isPublic ?? true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const ingredientList = ingredients
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    const stepList = steps
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    if (ingredientList.length === 0) {
      setError('Add at least one ingredient.')
      return
    }

    if (stepList.length === 0) {
      setError('Add at least one cooking step.')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: recipeTitle,
        overview,
        ingredients: ingredientList,
        steps: stepList,
        difficulty: difficulty
          ? (difficulty as (typeof DIFFICULTIES)[number])
          : null,
        cookTime: cookTime ? Number(cookTime) : null,
        isPublic,
      })
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save your recipe right now.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="glass-panel card fade-up border border-base-300/70 bg-base-100/90 shadow-2xl"
      style={{ animationDelay: '100ms' }}
    >
      <form className="card-body space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
        {hideIntro ? null : (
          <div>
            <p className="section-label mb-3">{kicker}</p>
            <h1 className="brand-title mb-4 text-4xl font-bold text-base-content sm:text-5xl">
              {title}
            </h1>
            <p className="text-base leading-8 text-base-content/70">
              {description}
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-control sm:col-span-2">
            <div className="label">
              <span className="label-text font-medium">Recipe title</span>
            </div>
            <input
              className="input input-bordered w-full"
              value={recipeTitle}
              onChange={(event) => setRecipeTitle(event.target.value)}
              placeholder="Smoky tomato jollof"
            />
          </label>

          <label className="form-control sm:col-span-2">
            <div className="label">
              <span className="label-text font-medium">Overview</span>
            </div>
            <textarea
              className="textarea textarea-bordered min-h-28 w-full"
              value={overview}
              onChange={(event) => setOverview(event.target.value)}
              placeholder="A rich one-pot rice dish with deep tomato flavor and gentle heat."
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Difficulty</span>
            </div>
            <select
              className="select select-bordered w-full"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="">Select difficulty</option>
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text font-medium">Cook time (minutes)</span>
            </div>
            <input
              className="input input-bordered w-full"
              type="number"
              min="0"
              value={cookTime}
              onChange={(event) => setCookTime(event.target.value)}
              placeholder="45"
            />
          </label>

          <label className="form-control sm:col-span-2">
            <div className="label">
              <span className="label-text font-medium">Ingredients</span>
              <span className="label-text-alt text-base-content/50">One item per line</span>
            </div>
            <textarea
              className="textarea textarea-bordered min-h-36 w-full"
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
              placeholder={'2 cups jasmine rice\n1 red onion\n3 tomatoes'}
              required
            />
          </label>

          <label className="form-control sm:col-span-2">
            <div className="label">
              <span className="label-text font-medium">Steps</span>
              <span className="label-text-alt text-base-content/50">One step per line</span>
            </div>
            <textarea
              className="textarea textarea-bordered min-h-40 w-full"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder={
                'Blend the tomatoes and onion.\nToast the rice lightly.\nSimmer until tender.'
              }
              required
            />
          </label>
        </div>

        <label className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200/60 px-4 py-4">
          <div>
            <span className="block text-sm font-medium text-base-content">
              Make this recipe public
            </span>
            <span className="block text-xs text-base-content/60">
              Public recipes appear in the community feed.
            </span>
          </div>
          <input
            className="toggle toggle-primary"
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
          />
        </label>

        {error ? (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        ) : null}

        <button className="btn btn-primary rounded-full sm:w-max" type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </form>
    </section>
  )
}
