<template lang="pug">
.SettingsPreview
  .sp-grip.-x(
    :title="translate('settings.preview_resize')"
    @pointerdown="startResize($event, 'x')"
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
  .sp-grip.-y(
    :title="translate('settings.preview_resize')"
    @pointerdown="startResize($event, 'y')"
    @dblclick="resetSize")
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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

// Resizable preview box: width and height of the whole card (wide windows)
const SIZE_KEY = 'sidebery_preview_size_v2'
const DEFAULT_W = 300
const DEFAULT_H = 640
const MIN_W = 260
const MAX_W = 640
const MIN_H = 420
const MAX_H = 1200
const boxW = ref(DEFAULT_W)
const boxH = ref(DEFAULT_H)

function applySize(): void {
  const root = document.documentElement.style
  root.setProperty('--sp-w', boxW.value + 'px')
  root.setProperty('--sp-h', boxH.value + 'px')
}
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
function saveSize(): void {
  try {
    localStorage.setItem(SIZE_KEY, JSON.stringify({ w: boxW.value, h: boxH.value }))
  } catch {
    // ignore: storage unavailable
  }
}
function resetSize(): void {
  boxW.value = DEFAULT_W
  boxH.value = DEFAULT_H
  applySize()
  saveSize()
}
function startResize(e: PointerEvent, axis: 'x' | 'y'): void {
  e.preventDefault()
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture(e.pointerId)
  const startX = e.clientX
  const startY = e.clientY
  const startW = boxW.value
  const startH = boxH.value
  const move = (ev: PointerEvent): void => {
    // The box is docked to the right edge: dragging its left edge to the left makes it wider
    if (axis === 'x') boxW.value = clamp(startW + (startX - ev.clientX), MIN_W, MAX_W)
    else boxH.value = clamp(startH + (ev.clientY - startY), MIN_H, MAX_H)
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
      boxW.value = clamp(Number(size.w) || DEFAULT_W, MIN_W, MAX_W)
      boxH.value = clamp(Number(size.h) || DEFAULT_H, MIN_H, MAX_H)
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
