export type CollapseMode = 'auto' | 'full' | 'collapsed'

export const CollapseModeService = {
  mode: 'auto' as CollapseMode,

  init(): void {
    const saved = (localStorage.getItem('sidebery_collapse_mode') as CollapseMode | null) ?? 'auto'
    this.mode = saved
    this.apply(saved)
  },

  set(mode: CollapseMode): void {
    this.mode = mode
    localStorage.setItem('sidebery_collapse_mode', mode)
    this.apply(mode)
  },

  apply(mode: CollapseMode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-collapse-mode', mode)
      document.body.setAttribute('data-collapse-mode', mode)
      const rootEl = document.getElementById('root')
      if (rootEl) rootEl.setAttribute('data-collapse-mode', mode)
    }

    const preface = mode === 'full' ? '[full] ' : mode === 'collapsed' ? '[compact] ' : ''
    if (typeof browser !== 'undefined' && browser.windows) {
      browser.windows.getCurrent().then(win => {
        if (win?.id) {
          browser.windows.update(win.id, { titlePreface: preface }).catch(() => {})
        }
      }).catch(() => {})
    }
  },

  cycle(): CollapseMode {
    const next: CollapseMode =
      this.mode === 'auto' ? 'full' : this.mode === 'full' ? 'collapsed' : 'auto'
    this.set(next)
    return next
  },
}
