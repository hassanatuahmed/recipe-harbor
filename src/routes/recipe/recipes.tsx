import type { difficultyLevel, Prisma } from "@prisma/client";
import { Link, createFileRoute, notFound, redirect, useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { useState } from "react";

import authClient from "../../lib/auth-client";
import prisma from "../../lib/prisma";
import auth from "../../lib/server/auth";

const authorSelect = {
  id: true,
  name: true,
  image: true,
} as const;

export type RecipeWithAuthor = Prisma.RecipeGetPayload<{
  include: {
    author: {
      select: typeof authorSelect;
    };
  };
}>;

export type RecipeCreateInput = {
  title?: string | null;
  overview?: string | null;
  ingredients: string[];
  steps: string[];
  difficulty?: difficultyLevel | null;
  cookTime?: number | null;
  isPublic?: boolean;
};

export type RecipeUpdateInput = Partial<RecipeCreateInput>;

const normalizeOptionalText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const normalizeStringList = (items?: string[]) =>
  items?.map((item) => item.trim()).filter(Boolean) ?? [];

const getSession = async () =>
  auth.api.getSession({
    headers: getRequest().headers,
  });

const requireUser = async () => {
  const session = await getSession();

  if (!session?.user) {
    throw redirect({
      to: "/login",
    });
  }

  return session.user;
};

const getOwnedRecipe = async (id: string) => {
  const user = await requireUser();
  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      authorId: user.id,
    },
  });

  if (!recipe) {
    throw notFound();
  }

  return recipe;
};

const buildCreateData = (input: RecipeCreateInput) => ({
  title: normalizeOptionalText(input.title),
  overview: normalizeOptionalText(input.overview),
  ingredients: normalizeStringList(input.ingredients),
  steps: normalizeStringList(input.steps),
  difficulty: input.difficulty ?? null,
  cookTime: input.cookTime ?? null,
  isPublic: input.isPublic ?? true,
});

const buildUpdateData = (input: RecipeUpdateInput): Prisma.RecipeUpdateInput => {
  const data: Prisma.RecipeUpdateInput = {};

  if ("title" in input) {
    data.title = normalizeOptionalText(input.title);
  }

  if ("overview" in input) {
    data.overview = normalizeOptionalText(input.overview);
  }

  if ("ingredients" in input) {
    data.ingredients = normalizeStringList(input.ingredients);
  }

  if ("steps" in input) {
    data.steps = normalizeStringList(input.steps);
  }

  if ("difficulty" in input) {
    data.difficulty = input.difficulty ?? null;
  }

  if ("cookTime" in input) {
    data.cookTime = input.cookTime ?? null;
  }

  if ("isPublic" in input) {
    data.isPublic = input.isPublic ?? true;
  }

  return data;
};

export const getRecipes = createServerFn({ method: "GET" }).handler(async () => {
  return prisma.recipe.findMany({
    where: {
      isPublic: true,
    },
    include: {
      author: {
        select: authorSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const getRecipeById = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await getSession();

    return prisma.recipe.findFirst({
      where: session?.user
        ? {
            id: data.id,
            OR: [{ isPublic: true }, { authorId: session.user.id }],
          }
        : {
            id: data.id,
            isPublic: true,
          },
      include: {
        author: {
          select: authorSelect,
        },
      },
    });
  });

export const getAuthorRecipes = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireUser();

  return prisma.recipe.findMany({
    where: {
      authorId: user.id,
    },
    include: {
      author: {
        select: authorSelect,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const addRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: RecipeCreateInput) => data)
  .handler(async ({ data }) => {
    const user = await requireUser();

    return prisma.recipe.create({
      data: {
        ...buildCreateData(data),
        authorId: user.id,
      },
      include: {
        author: {
          select: authorSelect,
        },
      },
    });
  });

export const removeRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await getOwnedRecipe(data.id);

    return prisma.recipe.delete({
      where: {
        id: data.id,
      },
      include: {
        author: {
          select: authorSelect,
        },
      },
    });
  });

export const updateRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; input: RecipeUpdateInput }) => data)
  .handler(async ({ data }) => {
    await getOwnedRecipe(data.id);

    return prisma.recipe.update({
      where: {
        id: data.id,
      },
      data: buildUpdateData(data.input),
      include: {
        author: {
          select: authorSelect,
        },
      },
    });
  });

export const updateRecipePrivacy = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; isPublic?: boolean }) => data)
  .handler(async ({ data }) => {
    const recipe = await getOwnedRecipe(data.id);

    return prisma.recipe.update({
      where: {
        id: data.id,
      },
      data: {
        isPublic: data.isPublic ?? !recipe.isPublic,
      },
      include: {
        author: {
          select: authorSelect,
        },
      },
    });
  });

export const Route = createFileRoute("/recipe/recipes")({
  loader: () => getRecipes(),
  component: RecipesRoute,
});

const formatDifficultyLabel = (difficulty?: difficultyLevel | null) =>
  difficulty
    ? difficulty.charAt(0) + difficulty.slice(1).toLowerCase()
    : null;

function RecipesRoute() {
  const router = useRouter();
  const recipes = Route.useLoaderData();
  const { data: session } = authClient.useSession();
  const deleteRecipe = useServerFn(removeRecipe);
  const toggleRecipePrivacy = useServerFn(updateRecipePrivacy);
  const [busyRecipeId, setBusyRecipeId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const ownRecipeCount = session?.user
    ? recipes.filter((recipe) => recipe.author.id === session.user.id).length
    : 0;

  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body gap-8 p-8 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="section-label mb-4">Community cookbook</p>
              <h1 className="brand-title text-5xl font-bold tracking-tight text-base-content sm:text-6xl">
                Browse recipes people actually want to cook again.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-base-content/70">
                Public dishes live here. If a recipe is yours, you can also edit it, delete it, or move it back into private testing.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/add-recipe" className="btn btn-primary rounded-full">
                Add Recipe
              </Link>
              <Link to="/" className="btn btn-outline rounded-full">
                Back Home
              </Link>
            </div>
          </div>

          <div className="stats stats-vertical glass-panel border border-base-300/70 bg-base-100/75 shadow lg:stats-horizontal">
            <div className="stat">
              <div className="stat-title">Public recipes</div>
              <div className="stat-value text-primary">{recipes.length}</div>
              <div className="stat-desc">Fresh ideas from the whole community.</div>
            </div>
            <div className="stat">
              <div className="stat-title">Your recipes here</div>
              <div className="stat-value text-secondary">{ownRecipeCount}</div>
              <div className="stat-desc">
                {session?.user ? "Recipes you can edit right now." : "Log in to manage your own recipes."}
              </div>
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
              <h2 className="card-title text-2xl">No public recipes yet.</h2>
              <p className="text-sm leading-7 text-base-content/70">
                Be the first to publish something worth repeating.
              </p>
              <Link to="/add-recipe" className="btn btn-primary rounded-full">
                Add the first recipe
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
                        {recipe.isPublic ? "Public" : "Private"}
                      </span>
                      {formatDifficultyLabel(recipe.difficulty) ? (
                        <span className="badge badge-secondary badge-outline">
                          {formatDifficultyLabel(recipe.difficulty)}
                        </span>
                      ) : null}
                      {recipe.cookTime ? <span className="badge badge-outline">{recipe.cookTime} min</span> : null}
                      {session?.user?.id === recipe.author.id ? (
                        <span className="badge badge-accent badge-outline">Your recipe</span>
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
                      By {recipe.author.name || "Anonymous"} / Added {new Date(recipe.createdAt).toLocaleDateString()}
                    </p>
                    {recipe.overview ? (
                      <p className="mt-4 text-sm leading-7 text-base-content/72">{recipe.overview}</p>
                    ) : null}
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
                    <Link to="/recipe/$recipeId" params={{ recipeId: recipe.id }} className="btn btn-primary btn-sm rounded-full">
                      View Recipe
                    </Link>

                    {session?.user?.id === recipe.author.id ? (
                      <Link
                        to="/recipe/$recipeId/edit"
                        params={{ recipeId: recipe.id }}
                        className="btn btn-outline btn-sm rounded-full"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>

                  {session?.user?.id === recipe.author.id ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm rounded-full"
                        onClick={() => handlePrivacyToggle(recipe.id)}
                        disabled={busyRecipeId === recipe.id}
                      >
                        {busyRecipeId === recipe.id
                          ? 'Working...'
                          : recipe.isPublic
                            ? 'Make Private'
                            : 'Make Public'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-error btn-outline btn-sm rounded-full"
                        onClick={() => handleDelete(recipe.id, recipe.title)}
                        disabled={busyRecipeId === recipe.id}
                      >
                        {busyRecipeId === recipe.id ? 'Working...' : 'Delete'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
