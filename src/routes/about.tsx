import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-shell pb-16 pt-8 md:pt-10">
      <section className="hero-panel card border border-base-300/70 bg-base-100/85 shadow-2xl">
        <div className="card-body gap-5 p-8 sm:p-10">
          <p className="section-label">About</p>
          <h1 className="brand-title text-5xl font-bold text-base-content sm:text-6xl">
            A recipe app with a calmer kitchen feel.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-base-content/70">
            Recipe Harbor is built on TanStack Start with server functions, Prisma, and Better Auth. The goal is simple: make it easy to write, revise, and share recipes without the interface getting in your way.
          </p>
        </div>
      </section>
    </main>
  )
}
