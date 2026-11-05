<template lang="pug">
.SettingsPreview(ref="boxEl" :data-sized="sized")
  .sp-grip.-l(
    :title="translate('settings.preview_resize')"
    @pointerdown="startResize($event, 'l')"
    @dblclick="resetSize")
  .sp-grip.-r(
    :title="translate('settings.preview_resize')"
    @pointerdown="startResize($event, 'r')"
    @dblclick="resetSize")
  .sp-grip.-t(
    :title="translate('settings.preview_resize')"
    @pointerdown="startResize($event, 't')"
    @dblclick="resetSize")
  .sp-head
    .sp-title {{translate('settings.preview_title')}}
    .sp-note {{translate('settings.preview_note')}}
  .sp-screen(:data-scheme="scheme")
    //- The real sidebar page in read-only preview mode (see services/preview-guard.ts)
    .frame(:data-mode="mode" :data-anim="Settings.state.animations" :data-editing="editing")
      iframe(
        ref="frameEl"
        :key="mode"
        :src="src"
        :tabindex="editing ? 0 : -1"
        :inert="!editing"
        :aria-hidden="editing ? undefined : 'true'"
        :title="translate('settings.preview_title')"
        @load="onFrameLoad")
    .page-body
      i(v-for="w in PAGE_LINES" :key="w" :style="{ width: w + '%' }")
  .sp-state(:data-editing="editing") {{editing ? translate('settings.preview_state_editing') : translate('settings.preview_state_locked')}}
  .sp-modes(role="group")
    button(
      v-for="m in MODES"
      :key="m"
      type="button"
      :data-active="mode === m"
      @click="setMode(m)") {{translate('settings.preview_mode_' + m)}}
  .sp-note.-small {{editing ? translate('settings.preview_legend_editing') : translate('settings.preview_legend_live')}}
  .sp-grip.-b(
    :title="translate('settings.preview_resize')"
    @pointerdown="startResize($event, 'b')"
    @dblclick="resetSize")
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'
import { DEFAULT_SETTINGS } from 'src/defaults'
import * as Utils from 'src/utils'

type PreviewMode = 'auto' | 'full' | 'collapsed'
const MODES: PreviewMode[] = ['auto', 'full', 'collapsed']
const MODE_KEY = 'sidebery_collapse_mode'
const PAGE_LINES = [60, 92, 84, 90, 40, 88, 70]
const PANELS: Record<PreviewMode, string> = {
  auto: 'sidebar/sidebar.html',
  full: 'sidebar/sidebar-full.html',
  collapsed: 'sidebar/sidebar-collapsed.html',
}

const mode = ref<PreviewMode>('auto')

// Resizable preview box: all four edges. By default it keeps its natural size.
const SIZE_KEY = 'sidebery_preview_size_v3'
const DEFAULT_W = 300
const DEFAULT_TOP = 16
const DEFAULT_RIGHT = 16
const MIN_W = 260
const MAX_W = 800
const MIN_H = 360
const MAX_H = 1400
const boxEl = ref<HTMLElement | null>(null)
const box = reactive({
  w: DEFAULT_W,
  h: null as number | null,
  top: DEFAULT_TOP,
  right: DEFAULT_RIGHT,
})
const sized = computed(() => box.h !== null)

type Edge = 'l' | 'r' | 't' | 'b'

function applySize(): void {
  const root = document.documentElement.style
  root.setProperty('--sp-w', box.w + 'px')
  root.setProperty('--sp-top', box.top + 'px')
  root.setProperty('--sp-right', box.right + 'px')
  if (box.h === null) root.removeProperty('--sp-h')
  else root.setProperty('--sp-h', box.h + 'px')
}
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
function saveSize(): void {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify({ ...box }))
  } catch {
    // ignore: storage unavailable
  }
}
function resetSize(): void {
  box.w = DEFAULT_W
  box.h = null
  box.top = DEFAULT_TOP
  box.right = DEFAULT_RIGHT
  applySize()
  saveSize()
}
function startResize(e: PointerEvent, edge: Edge): void {
  const card = boxEl.value
  if (!card) return
  e.preventDefault()
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture(e.pointerId)

  const rect = card.getBoundingClientRect()
  const startX = e.clientX
  const startY = e.clientY
  const startW = rect.width
  const startH = rect.height
  const startTop = rect.top
  const startRight = window.innerWidth - rect.right

  const move = (ev: PointerEvent): void => {
    if (edge === 'l') {
      box.w = clamp(startW + (startX - ev.clientX), MIN_W, MAX_W)
    } else if (edge === 'r') {
      // The left edge stays where it is: the box grows to the right
      box.w = clamp(startW + (ev.clientX - startX), MIN_W, MAX_W)
      box.right = Math.max(0, Math.round(startRight - (box.w - startW)))
    } else if (edge === 'b') {
      box.h = clamp(startH + (ev.clientY - startY), MIN_H, MAX_H)
    } else {
      // Top edge: the bottom stays where it is
      box.h = clamp(startH + (startY - ev.clientY), MIN_H, MAX_H)
      box.top = Math.max(0, Math.round(startTop - (box.h - startH)))
    }
    applySize()
  }
  const up = (): void => {
    target.removeEventListener('pointermove', move)
    target.removeEventListener('pointerup', up)
    target.removeEventListener('pointercancel', up)
    saveSize()
  }
  target.addEventListener('pointermove', move)
  target.addEventListener('pointerup', up)
  target.addEventListener('pointercancel', up)
}
onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--sp-w')
  document.documentElement.style.removeProperty('--sp-h')
  document.documentElement.style.removeProperty('--sp-top')
  document.documentElement.style.removeProperty('--sp-right')
})
const frameEl = ref<HTMLIFrameElement | null>(null)
// Unsaved edits: the preview shows them and becomes interactive, the real sidebar does not change
const editing = computed(() => Settings.draft.dirty)

onMounted(() => {
  try {
    const saved = localStorage.getItem(MODE_KEY) as PreviewMode | null
    if (saved && MODES.includes(saved)) mode.value = saved
    const size = JSON.parse(localStorage.getItem(SIZE_KEY) ?? 'null')
    if (size) {
      box.w = clamp(Number(size.w) || DEFAULT_W, MIN_W, MAX_W)
      box.h = size.h == null ? null : clamp(Number(size.h) || MIN_H, MIN_H, MAX_H)
      box.top = size.top == null ? DEFAULT_TOP : Math.max(0, Number(size.top) || 0)
      box.right = size.right == null ? DEFAULT_RIGHT : Math.max(0, Number(size.right) || 0)
    }
  } catch {
    // ignore: storage unavailable
  }
  applySize()
})

function setMode(m: PreviewMode): void {
  mode.value = m
}

// Send the current (draft) settings to the preview sidebar
let sendTimeout: number | undefined
function sendSettings(): void {
  clearTimeout(sendTimeout)
  sendTimeout = window.setTimeout(() => {
    const win = frameEl.value?.contentWindow
    if (!win) return
    const settings = Utils.recreateNormalizedObject(
      Utils.cloneObject(Settings.state),
      DEFAULT_SETTINGS
    )
    win.postMessage({ type: 'bs-preview-settings', settings }, location.origin)
  }, 40)
}
function onFrameLoad(): void {
  sendSettings()
  // The sidebar inside needs a moment to initialize: send again once it is ready
  window.setTimeout(sendSettings, 600)
}
watch(() => Settings.state, sendSettings, { deep: true })

// `preview=1` makes the sidebar read-only: no writes, no connection to the background script
const src = computed(() => {
  const url = browser.runtime.getURL(PANELS[mode.value])
  return `${url}?preview=1&mode=${mode.value}`
})

// Background behind the transparent sidebar, like the browser frame
const scheme = computed<'dark' | 'light'>(() => {
  const cs = Settings.state.colorScheme
  if (cs === 'dark' || cs === 'light') return cs
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})
</script>
