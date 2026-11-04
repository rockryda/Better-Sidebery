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

// Custom sidebar width (drag-resize). CSS can't read numbers from the title, so the width is
// quantized to WIDTH_STEP px steps and encoded as 6 binary zero-width chars between delimiters:
// \u2063 [\u200B=0 | \u200C=1]x6 \u2064   (userChrome.css has one rule per step)
export const WIDTH_MIN = 48
export const WIDTH_STEP = 8
export const WIDTH_STEPS = 55 // 48 .. 488px
export const widthToStep = (w: number): number =>
  Math.max(0, Math.min(WIDTH_STEPS - 1, Math.round((w - WIDTH_MIN) / WIDTH_STEP)))

function widthToken(w: number): string {
  const step = widthToStep(w)
  let bits = ''
  for (let i = 5; i >= 0; i--) bits += (step >> i) & 1 ? '\u200C' : '\u200B'
  return '\u2063' + bits + '\u2064'
}

const widthKey = (mode: CollapseMode) => `sidebery_width_${mode}`

export const CollapseModeService = {
  mode: 'auto' as CollapseMode,
  popupExpanded: false,

  getWidth(mode?: CollapseMode): number | undefined {
    try {
      const v = Number(localStorage.getItem(widthKey(mode ?? this.mode)))
      return v > 0 ? v : undefined
    } catch {
      return undefined
    }
  },

  setWidth(w: number | undefined, mode?: CollapseMode): void {
    const key = widthKey(mode ?? this.mode)
    try {
      if (w === undefined) localStorage.removeItem(key)
      else localStorage.setItem(key, String(WIDTH_MIN + widthToStep(w) * WIDTH_STEP))
    } catch {
      // ignore
    }
  },

  marker(): string {
    if (this.popupExpanded) return POPUP_EXPAND_MARKER
    const base = COLLAPSE_MARKERS[this.mode] ?? ''
    if (this.mode === 'full') return base
    const w = this.getWidth()
    return w === undefined ? base : base + widthToken(w)
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

