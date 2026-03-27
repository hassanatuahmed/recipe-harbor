import type { difficultyLevel } from "@prisma/client";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import authClient from "../../lib/auth-client";
import {
  getAuthorRecipes,
  removeRecipe,
  updateRecipePrivacy,
} from "./recipes";

export const Route = createFileRoute("/recipe/my")({
  loader: () => getAuthorRecipes(),
  component: MyRecipesRoute,
});

const formatDifficultyLabel = (difficulty?: difficultyLevel | null) =>
  difficulty
    ? difficulty.charAt(0) + difficulty.slice(1).toLowerCase()
    : null;

function MyRecipesRoute() {
  const router = useRouter();
  const recipes = Route.useLoaderData();
  const { data: session } = authClient.useSession();
  const deleteRecipe = useServerFn(removeRecipe);
  const toggleRecipePrivacy = useServerFn(updateRecipePrivacy);
  const [busyRecipeId, setBusyRecipeId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const publicCount = recipes.filter((recipe) => recipe.isPublic).length;
  const privateCount = recipes.length - publicCount;

  const handleDelete = async (id: string, title?: string | null) => {
    const confirmed = window.confirm(
      `Delete "${title || "this recipe"}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyRecipeId(id);
    setActionError(null);

    try {
      await deleteRecipe({
        data: { id },
      });
      await router.invalidate();
    } catch (error) {
      setActionError(
        error instanceof Error && error.message !== "HTTPError"
          ? error.message
          : "Unable to delete that recipe right now.",
      );
    } finally {
      setBusyRecipeId(null);
    }
  };

  const handlePrivacyToggle = async (id: string) => {
    setBusyRecipeId(id);
    setActionError(null);

    try {
      await toggleRecipePrivacy({
        data: { id },
      });
      await router.invalidate();
    } catch (error) {
      setActionError(
        error instanceof Error && error.message !== "HTTPError"
          ? error.message
          : "Unable to update recipe visibility right now.",
      );
    } finally {
      setBusyRecipeId(null);
    }
  };

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body gap-8 p-8 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="section-label mb-4">My Recipes</p>
              <h1 className="brand-title text-5xl font-bold tracking-tight text-base-content sm:text-6xl">
                {session?.user?.name
                  ? `${session.user.name}'s kitchen`
                  : "Your kitchen dashboard"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-base-content/70">
                See every recipe you have written, including private drafts. Edit, publish, or remove anything from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/add-recipe" className="btn btn-primary rounded-full">
                Add Recipe
              </Link>
              <Link to="/recipe/recipes" className="btn btn-outline rounded-full">
                Community Feed
              </Link>
            </div>
          </div>

          <div className="stats stats-vertical glass-panel border border-base-300/70 bg-base-100/75 shadow lg:stats-horizontal">
            <div className="stat">
              <div className="stat-title">All recipes</div>
              <div className="stat-value text-primary">{recipes.length}</div>
              <div className="stat-desc">Everything you have added so far.</div>
            </div>
            <div className="stat">
              <div className="stat-title">Public</div>
              <div className="stat-value text-secondary">{publicCount}</div>
              <div className="stat-desc">Visible in the community cookbook.</div>
            </div>
            <div className="stat">
              <div className="stat-title">Private drafts</div>
              <div className="stat-value text-accent">{privateCount}</div>
              <div className="stat-desc">Only visible to you until you publish them.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5">
        {actionError ? (
          <div className="alert alert-error shadow-sm">
            <span>{actionError}</span>
          </div>
        ) : null}

        {recipes.length === 0 ? (
          <article className="card border border-base-300/70 bg-base-100/85 shadow-xl">
            <div className="card-body items-start gap-4 p-8">
              <h2 className="card-title text-2xl">Your kitchen is still empty.</h2>
              <p className="text-sm leading-7 text-base-content/70">
                Start your collection with a private draft or publish your first recipe when it is ready.
              </p>
              <Link to="/add-recipe" className="btn btn-primary rounded-full">
                Create your first recipe
              </Link>
            </div>
          </article>
        ) : (
          recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="card border border-base-300/70 bg-base-100/90 shadow-xl transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="card-body gap-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className={`badge ${recipe.isPublic ? "badge-primary" : "badge-outline"}`}>
                        {recipe.isPublic ? "Public" : "Private draft"}
                      </span>
                      {formatDifficultyLabel(recipe.difficulty) ? (
                        <span className="badge badge-secondary badge-outline">
                          {formatDifficultyLabel(recipe.difficulty)}
                        </span>
                      ) : null}
                      {recipe.cookTime ? (
                        <span className="badge badge-outline">{recipe.cookTime} min</span>
                      ) : null}
                    </div>

                    <Link
                      to="/recipe/$recipeId"
                      params={{ recipeId: recipe.id }}
                      className="brand-title block text-3xl font-bold text-base-content transition hover:text-primary"
                    >
                      {recipe.title || "Untitled recipe"}
                    </Link>
                    <p className="mt-3 text-sm text-base-content/60">
                      Added {new Date(recipe.createdAt).toLocaleDateString()}
                    </p>
                    {recipe.overview ? (
                      <p className="mt-4 text-sm leading-7 text-base-content/72">{recipe.overview}</p>
                    ) : (
                      <p className="mt-4 text-sm italic leading-7 text-base-content/45">
                        No overview yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="rounded-full bg-base-200 px-4 py-2 text-base-content/75">
                    {recipe.ingredients.length} ingredients
                  </div>
                  <div className="rounded-full bg-base-200 px-4 py-2 text-base-content/75">
                    {recipe.steps.length} steps
                  </div>
                </div>

                <div className="card-actions justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/recipe/$recipeId"
                      params={{ recipeId: recipe.id }}
                      className="btn btn-primary btn-sm rounded-full"
                    >
                      View
                    </Link>
                    <Link
                      to="/recipe/$recipeId/edit"
                      params={{ recipeId: recipe.id }}
                      className="btn btn-outline btn-sm rounded-full"
                    >
                      Edit
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm rounded-full"
                      onClick={() => handlePrivacyToggle(recipe.id)}
                      disabled={busyRecipeId === recipe.id}
                    >
                      {busyRecipeId === recipe.id
                        ? "Working..."
                        : recipe.isPublic
                          ? "Move to Drafts"
                          : "Publish"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-error btn-outline btn-sm rounded-full"
                      onClick={() => handleDelete(recipe.id, recipe.title)}
                      disabled={busyRecipeId === recipe.id}
                    >
                      {busyRecipeId === recipe.id ? "Working..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
