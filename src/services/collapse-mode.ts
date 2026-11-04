export type CollapseMode = 'auto' | 'full' | 'collapsed'

// Invisible markers appended to the window title preface so userChrome.css can
// detect the mode via `:root[titlepreface*="..."]` (the panel URL isn't visible to CSS).
export const COLLAPSE_MARKERS: Record<CollapseMode, string> = {
  auto: '\u200D\u2060',
  full: '',
  collapsed: '\u200C\u2060',
}

export const CollapseModeService = {
  mode: 'auto' as CollapseMode,

  marker(): string {
    return COLLAPSE_MARKERS[this.mode] ?? ''
  },

  init(): void {
    let currentMode: CollapseMode = 'auto'
    if (typeof window !== 'undefined') {
      const href = window.location.href
      if (href.includes('sidebar-full.html')) currentMode = 'full'
      else if (href.includes('sidebar-collapsed.html')) currentMode = 'collapsed'
      else {
        currentMode =
          (localStorage.getItem('sidebery_collapse_mode') as CollapseMode | null) ?? 'auto'
      }
    }
    this.mode = currentMode
    localStorage.setItem('sidebery_collapse_mode', currentMode)
    this.applyDOM(currentMode)
  },

  set(mode: CollapseMode): void {
    this.mode = mode
    localStorage.setItem('sidebery_collapse_mode', mode)
    this.applyDOM(mode)
    this.applyPanel(mode)
  },

  applyDOM(mode: CollapseMode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-collapse-mode', mode)
      document.body.setAttribute('data-collapse-mode', mode)
      const rootEl = document.getElementById('root')
      if (rootEl) rootEl.setAttribute('data-collapse-mode', mode)
    }
  },

  applyPanel(mode: CollapseMode): void {
    const file =
      mode === 'full'
        ? 'sidebar/sidebar-full.html'
        : mode === 'collapsed'
        ? 'sidebar/sidebar-collapsed.html'
        : 'sidebar/sidebar.html'

    const fullUrl =
      typeof browser !== 'undefined' && browser.runtime?.getURL
        ? browser.runtime.getURL(file)
        : `/${file}`

    const sAction = (browser as any)?.sidebarAction
    if (sAction?.setPanel) {
      sAction.setPanel({ panel: fullUrl }).catch(() => {
        sAction.setPanel({ panel: `/${file}` }).catch(() => {})
      })
    }
  },

  cycle(): CollapseMode {
    const next: CollapseMode =
      this.mode === 'auto' ? 'full' : this.mode === 'full' ? 'collapsed' : 'auto'
    this.set(next)
    return next
  },
}

