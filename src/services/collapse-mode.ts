export type CollapseMode = 'auto' | 'full' | 'collapsed'

// Invisible markers appended to the window title preface so userChrome.css can
// detect the mode via `:root[titlepreface*="..."]` (the panel URL isn't visible to CSS).
export const COLLAPSE_MARKERS: Record<CollapseMode, string> = {
  auto: '\u200D\u2060',
  full: '',
  collapsed: '\u200C\u2060',
}

// Temporary marker: widen the rail to 260px while a popup/dialog is open (popups can't
// extend beyond the 48px frame). userChrome.css matches it via `:root[titlepreface*=...]`.
export const POPUP_EXPAND_MARKER = '\u200B\u2060'

export const CollapseModeService = {
  mode: 'auto' as CollapseMode,
  popupExpanded: false,

  marker(): string {
    if (this.popupExpanded) return POPUP_EXPAND_MARKER
    return COLLAPSE_MARKERS[this.mode] ?? ''
  },

  init(): void {
    let currentMode: CollapseMode = 'auto'
    let needsPanelSync = false
    if (typeof window !== 'undefined') {
      const href = window.location.href
      if (href.includes('sidebar-full.html')) currentMode = 'full'
      else if (href.includes('sidebar-collapsed.html')) currentMode = 'collapsed'
      else {
        currentMode =
          (localStorage.getItem('sidebery_collapse_mode') as CollapseMode | null) ?? 'auto'
        // The browser restores the default panel (sidebar.html) after a restart, while the
        // saved mode may be full/collapsed: load the matching panel so UI and mode agree.
        needsPanelSync = currentMode !== 'auto'
      }
    }
    console.log(`[collapse-mode] init mode=${currentMode} href=${typeof window !== 'undefined' ? window.location.href : ''}`)
    this.mode = currentMode
    localStorage.setItem('sidebery_collapse_mode', currentMode)
    this.applyDOM(currentMode)
    if (needsPanelSync) this.applyPanel(currentMode)
  },

  set(mode: CollapseMode): void {
    console.log(`[collapse-mode] set ${this.mode} -> ${mode}`)
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
    const log = (msg: string, ...a: unknown[]) => console.log(`[collapse-mode] ${msg}`, ...a)
    log(`applyPanel mode=${mode} url=${fullUrl} setPanel=${!!sAction?.setPanel} href=${location.href}`)
    if (!sAction?.setPanel) {
      log('browser.sidebarAction.setPanel is NOT available')
      return
    }
    sAction
      .setPanel({ panel: fullUrl })
      .then(() => log('setPanel OK ->', fullUrl))
      .catch((err: unknown) => {
        log('setPanel FAILED with full url:', err)
        sAction
          .setPanel({ panel: `/${file}` })
          .then(() => log('setPanel OK (relative) ->', file))
          .catch((err2: unknown) => log('setPanel FAILED with relative url:', err2))
      })
  },

  cycle(): CollapseMode {
    const next: CollapseMode =
      this.mode === 'auto' ? 'full' : this.mode === 'full' ? 'collapsed' : 'auto'
    this.set(next)
    return next
  },
}

