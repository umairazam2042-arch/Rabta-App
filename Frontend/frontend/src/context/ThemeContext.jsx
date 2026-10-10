import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_THEME, THEME_IDS } from '../config/themes'

const STORAGE_KEY = 'rabta_site_theme'

export const ThemeContext = createContext(null)

const readSaved = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEME_IDS.includes(saved) ? saved : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readSaved)

  // Theme badalte hi poori site par laga do
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback((id) => {
    if (!THEME_IDS.includes(id)) return
    setThemeState(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // storage band ho to bhi theme is session mein chalegi
    }
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}