/** Shared by the sidebar (which measures) and the settings page (which shows the result) */

export type CompanionCss = 'active' | 'inactive' | 'unknown'

export interface CompanionStatus {
  css: CompanionCss
  /** Sidebar mode when it was measured */
  mode: string
  /** Sidebar width in px when it was measured */
  width: number
  via: 'passive' | 'probe'
  ts: number
}

export interface CompanionProbeRequest {
  id: number
  winId: number
}

export const COMPANION_STATUS_KEY = 'companionStatus'
export const COMPANION_PROBE_KEY = 'companionProbe'
