import { CollapseModeService, DRAG_OVERLAY_MARKER } from 'src/services/collapse-mode'
import { Windows } from 'src/services/windows'
import { IS_PREVIEW } from 'src/services/preview-guard'
import * as Logs from 'src/services/logs'
import {
  CompanionCss,
  CompanionProbeRequest,
  CompanionStatus,
  COMPANION_PROBE_KEY,
  COMPANION_STATUS_KEY,
} from 'src/services/companion-status'

/**
 * Checks whether the companion userChrome.css is applied to this sidebar.
 *
 * The extension cannot read the profile folder, but it can see the effect: the CSS makes the
 * sidebar exactly as wide as the mode says (48px rail, or the dragged width). Without the CSS the
 * sidebar keeps the browser's own width.
 *
 * - Passive: measured while the sidebar is in Collapsed (or Auto at rest). Nothing changes on screen.
 * - Probe: on request from the settings page the sidebar is briefly widened through the CSS and
 *   measured; this flashes for a moment, so it only runs when the user asks.
 */

const RAIL_MAX = 68
const SETTLE_MS = 1800
const REPORT_EVERY_MS = 10 * 60 * 1000

let probing = false
let timeout: number | undefined
let lastReported: CompanionStatus | undefined

function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

function measure(): { css: CompanionCss; width: number } {
  const width = window.innerWidth
  const mode = CollapseModeService.mode

  // Widths are changed on purpose while a popup is open or a drag-resize is running
  if (CollapseModeService.popupExpanded || CollapseModeService.dragMarker) {
    return { css: 'unknown', width }
  }

  if (mode === 'collapsed') {
    const expected = CollapseModeService.getWidth() ?? 48
    if (Math.abs(width - expected) <= 8) return { css: 'active', width }
    if (width > expected + 20) return { css: 'inactive', width }
  }
  // Auto at rest is the 48px rail; wider can just mean "hovered", so it proves nothing
  if (mode === 'auto' && width <= RAIL_MAX) return { css: 'active', width }
  return { css: 'unknown', width }
}

async function report(
  css: CompanionCss,
  width: number,
  via: CompanionStatus['via']
): Promise<void> {
  if (css === 'unknown') return
  const now = Date.now()
  const prev = lastReported
  const same = prev?.css === css && prev.mode === CollapseModeService.mode
  if (via === 'passive' && prev && same && now - prev.ts < REPORT_EVERY_MS) return

  const status: CompanionStatus = { css, mode: CollapseModeService.mode, width, via, ts: now }
  lastReported = status
  try {
    await browser.storage.local.set({ [COMPANION_STATUS_KEY]: status })
  } catch (err) {
    Logs.warn('CompanionCheck: cannot save status', err)
  }
}

/** Measure after the page settles; a "not applied" result is confirmed once before reporting */
function schedule(confirm = false): void {
  clearTimeout(timeout)
  timeout = window.setTimeout(() => {
    if (probing) return
    const { css, width } = measure()
    if (css === 'inactive' && !confirm) return schedule(true)
    report(css, width, 'passive')
  }, SETTLE_MS)
}

async function probe(): Promise<void> {
  if (probing) return
  probing = true
  let css: CompanionCss = 'unknown'
  let width = window.innerWidth
  try {
    const before = window.innerWidth
    CollapseModeService.dragMarker = DRAG_OVERLAY_MARKER
    Windows.updWindowPreface()
    await sleep(500)
    width = window.innerWidth
    css = width >= Math.max(before + 60, 300) ? 'active' : 'inactive'
  } finally {
    CollapseModeService.dragMarker = ''
    Windows.updWindowPreface()
    probing = false
  }
  // Report the width the sidebar really has at rest
  await sleep(300)
  await report(css, css === 'active' ? window.innerWidth : width, 'probe')
}

type Changes = Record<string, { newValue?: unknown } | undefined>

function onStorageChanged(rawChanges: unknown, area: string): void {
  if (area !== 'local') return
  const changes = rawChanges as Changes
  const req = changes[COMPANION_PROBE_KEY]?.newValue as CompanionProbeRequest | undefined
  if (!req) return
  // Only the sidebar of the window the settings page is in answers
  if (req.winId !== Windows.id) return
  probe()
}

export function initCompanionCheck(): void {
  if (IS_PREVIEW) return
  browser.storage.onChanged.addListener(onStorageChanged)
  window.addEventListener('resize', () => schedule())
  schedule()
}
