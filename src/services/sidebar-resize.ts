import {
  CollapseModeService,
  WIDTH_MIN,
  WIDTH_STEP,
  WIDTH_STEPS,
} from 'src/services/collapse-mode'
import { Windows } from 'src/services/windows'

const MAX_WIDTH = WIDTH_MIN + (WIDTH_STEPS - 1) * WIDTH_STEP
const HANDLE_ID = 'bsb_resize_handle'
const GUIDE_ID = 'bsb_resize_guide'
const BUFFER = WIDTH_STEP // frame is this much wider than the target while dragging

/**
 * Drag handle on the sidebar's right edge (all modes). The browser (not the extension) owns the
 * sidebar width, so the width is sent to userChrome.css through the window title marker, live
 * while dragging. The frame is kept a few px wider than the pointer target so the pointer
 * doesn't leave it between updates; the pointer is captured so events keep flowing anyway.
 */
export function initSidebarResize(): void {
  if (document.getElementById(HANDLE_ID)) return

  const style = document.createElement('style')
  style.textContent = `
    #${HANDLE_ID} { position: fixed; top: 0; right: 0; bottom: 0; width: 8px; cursor: col-resize;
      z-index: 2147483646; background: transparent; touch-action: none; }
    #${HANDLE_ID}:hover { background: rgba(120, 160, 255, 0.45); }
    #${GUIDE_ID} { position: fixed; top: 0; bottom: 0; left: 0; right: 0; display: none;
      z-index: 2147483647; cursor: col-resize; background: transparent; }
    #${GUIDE_ID}[data-on="true"] { display: block; }
    #${GUIDE_ID} .line { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -2px;
      background: rgb(120, 160, 255); }
    #${GUIDE_ID} .label { position: absolute; top: 8px; margin-left: 8px; padding: 2px 6px;
      border-radius: 4px; font: 11px sans-serif; color: #fff; background: rgba(0, 0, 0, 0.7); }
  `
  document.head.appendChild(style)

  const handle = document.createElement('div')
  handle.id = HANDLE_ID
  handle.title = 'Drag to resize (double-click to reset)'
  document.body.appendChild(handle)

  const guide = document.createElement('div')
  guide.id = GUIDE_ID
  const line = document.createElement('div')
  line.className = 'line'
  const label = document.createElement('div')
  label.className = 'label'
  guide.append(line, label)
  document.body.appendChild(guide)

  const DRAG_THRESHOLD = 3
  const DBLCLICK_MS = 450

  let pressed = false
  let dragging = false
  let pressX = 0
  let startW = 0
  let target = 0
  let lastPressAt = 0
  let pointerId = 0

  const showTarget = (w: number) => {
    target = Math.max(WIDTH_MIN, Math.min(MAX_WIDTH, w))
    line.style.left = target + 'px'
    label.style.left = target + 'px'
    label.textContent = Math.round(target) + 'px'
    if (dragging) applyLive()
  }

  let raf = 0
  const applyLive = () => {
    CollapseModeService.setWidth(Math.min(MAX_WIDTH, target + BUFFER))
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      Windows.updWindowPreface()
    })
  }

  // The frame is only widened once the pointer actually moves, so a plain click (or the first
  // click of a double-click) never changes anything.
  let prevWidth: number | undefined
  const beginDrag = () => {
    dragging = true
    prevWidth = CollapseModeService.getWidth()
    guide.dataset.on = 'true'
    showTarget(startW)
    guide.setPointerCapture(pointerId)
  }

  const finish = (apply: boolean) => {
    pressed = false
    if (!dragging) return
    dragging = false
    delete guide.dataset.on
    CollapseModeService.setWidth(apply ? target : prevWidth)
    Windows.updWindowPreface()
  }

  handle.addEventListener('pointerdown', e => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const now = Date.now()
    if (now - lastPressAt < DBLCLICK_MS) {
      // Double-click: reset to the default width
      lastPressAt = 0
      pressed = false
      CollapseModeService.setWidth(undefined)
      Windows.updWindowPreface()
      return
    }
    lastPressAt = now

    pressed = true
    pointerId = e.pointerId
    pressX = e.clientX
    startW = document.documentElement.clientWidth
    handle.setPointerCapture(e.pointerId)
  })

  handle.addEventListener('pointermove', e => {
    if (!pressed || dragging) return
    if (Math.abs(e.clientX - pressX) >= DRAG_THRESHOLD) beginDrag()
  })

  // The frame's left edge is fixed, so clientX is the desired width
  guide.addEventListener('pointermove', e => {
    if (dragging) showTarget(e.clientX)
  })

  const up = (e: PointerEvent) => {
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId)
    if (guide.hasPointerCapture(e.pointerId)) guide.releasePointerCapture(e.pointerId)
    finish(true)
  }
  handle.addEventListener('pointerup', up)
  guide.addEventListener('pointerup', up)
  guide.addEventListener('pointercancel', () => finish(false))
  handle.addEventListener('pointercancel', () => finish(false))
}
