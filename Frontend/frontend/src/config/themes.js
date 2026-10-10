// id: CSS mein [data-theme='...'] ke saath match hona chahiye
export const DEFAULT_THEME = 'light'

export const THEMES = [
  {
    id: 'light',
    name: 'Clean Light',
    note: 'Saaf, safed aur neela',
    swatches: ['#F6F7F9', '#2F5BFF', '#0F172A'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    note: 'Aankhon ke liye araam, dark',
    swatches: ['#0E1220', '#6D8BFF', '#E8EBF4'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    note: 'Garam rang, gol corners',
    swatches: ['#FFF7ED', '#EA580C', '#3B1D0F'],
  },
  {
    id: 'forest',
    name: 'Forest',
    note: 'Hara, compact aur seedha',
    swatches: ['#F1F8F3', '#15803D', '#0F2A1C'],
  },
]

export const THEME_IDS = THEMES.map((t) => t.id)