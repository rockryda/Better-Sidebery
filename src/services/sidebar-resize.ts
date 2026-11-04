import { CollapseModeService, WIDTH_MIN } from 'src/services/collapse-mode'
import { Windows } from 'src/services/windows'

const MAX_WIDTH = 488
const HANDLE_ID = 'bsb_resize_handle'

/**
 * Drag handle on the sidebar's right edge. The browser (not the extension) owns the sidebar
 * width, so the new width is sent to userChrome.css through the window title marker.
 * Not used in Full mode (native Firefox splitter handles it there).
 */
export function initSidebarResize(): void {
  if (document.getElementById(HANDLE_ID)) return

  const style = document.createElement('style')
  style.textContent = `
    #${HANDLE_ID} { position: fixed; top: 0; right: 0; bottom: 0; width: 6px; cursor: col-resize;
      z-index: 2147483647; background: transparent; touch-action: none; }
    #${HANDLE_ID}:hover, #${HANDLE_ID}[data-drag="true"] { background: rgba(120, 160, 255, 0.45); }
    html[data-collapse-mode="full"] #${HANDLE_ID} { display: none; }
  `
  document.head.appendChild(style)

  const handle = document.createElement('div')
  handle.id = HANDLE_ID
  handle.title = 'Drag to resize (double-click to reset)'
  document.body.appendChild(handle)

  let startX = 0
  let startW = 0
  let raf = 0

  const apply = (w: number) => {
    CollapseModeService.setWidth(w)
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      Windows.updWindowPreface()
    })
  }

  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0 || CollapseModeService.mode === 'full') return
    e.preventDefault()
    e.stopPropagation()
    startX = e.screenX
    startW = document.documentElement.clientWidth
    handle.setPointerCapture(e.pointerId)
    handle.dataset.drag = 'true'
  })

  handle.addEventListener('pointermove', e => {
    if (handle.dataset.drag !== 'true') return
    const w = Math.max(WIDTH_MIN, Math.min(MAX_WIDTH, startW + (e.screenX - startX)))
    apply(w)
  })

  const end = (e: PointerEvent) => {
    if (handle.dataset.drag !== 'true') return
    delete handle.dataset.drag
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId)
  }
  handle.addEventListener('pointerup', end)
  handle.addEventListener('pointercancel', end)

  handle.addEventListener('dblclick', () => {
    CollapseModeService.setWidth(undefined)
    Windows.updWindowPreface()
  })
}
