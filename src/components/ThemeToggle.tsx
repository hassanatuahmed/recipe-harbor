import { useEffect, useState } from 'react'

type ThemeMode = 'garden' | 'cupcake' | 'forest'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'garden'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'garden' || stored === 'cupcake' || stored === 'forest') {
    return stored
  }

  return 'garden'
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('garden')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === 'garden' ? 'cupcake' : mode === 'cupcake' ? 'forest' : 'garden'
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)
  }

  const label = `Theme mode: ${mode}. Click to switch themes.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="btn btn-outline btn-sm rounded-full"
    >
      {mode}
    </button>
  )
}
