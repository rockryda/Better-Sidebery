export type CollapseMode = 'auto' | 'full' | 'collapsed'

export const CollapseModeService = {
  mode: 'auto' as CollapseMode,

  init(): void {
    const saved = (localStorage.getItem('sidebery_collapse_mode') as CollapseMode | null) ?? 'auto'
    this.mode = saved
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-collapse-mode', saved)
      document.body.setAttribute('data-collapse-mode', saved)
      const rootEl = document.getElementById('root')
      if (rootEl) rootEl.setAttribute('data-collapse-mode', saved)
    }
  },

  set(mode: CollapseMode): void {
    this.mode = mode
    localStorage.setItem('sidebery_collapse_mode', mode)

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-collapse-mode', mode)
      document.body.setAttribute('data-collapse-mode', mode)
      const rootEl = document.getElementById('root')
      if (rootEl) rootEl.setAttribute('data-collapse-mode', mode)
    }

    const panelFile =
      mode === 'full'
        ? 'sidebar/sidebar-full.html'
        : mode === 'collapsed'
        ? 'sidebar/sidebar-collapsed.html'
        : 'sidebar/sidebar.html'

    const sAction = (browser as any)?.sidebarAction
    if (sAction?.setPanel) {
      sAction.setPanel({ panel: panelFile })
    }
  },

  cycle(): CollapseMode {
    const next: CollapseMode =
      this.mode === 'auto' ? 'full' : this.mode === 'full' ? 'collapsed' : 'auto'
    this.set(next)
    return next
  },
}
