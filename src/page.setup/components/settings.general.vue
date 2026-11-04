<template lang="pug">
section(ref="el")
  h2 {{translate('settings.general_title')}}
  span.header-shadow

  .sub-fields(style="margin-bottom: 18px; padding: 16px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.28); border-radius: 8px;")
    .label(style="font-size: 15px; font-weight: 600; color: #22c55e; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;")
      span 🚀
      span Auto-Expand, Hover Rail & Zen Mode Setup

    .note(style="font-size: 12px; line-height: 1.6; opacity: 0.9; margin-bottom: 12px;")
      | To enable <b>docking to a 48px icon rail</b>, <b>auto-expanding to 260px on hover</b> (zero page reflow), <b>Floorp Zen Mode edge-reveal</b>, and hiding the top tab strip, install the companion styles:

    .ctrls(style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;")
      .btn(
        @click="copySetupScript"
        style="background: #22c55e; color: #0f172a; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 6px; border: none;")
        span {{ scriptMsg || '📋 Copy 1-Click Setup Command' }}
      code(style="font-size: 11px; opacity: 0.9; user-select: all; background: rgba(0,0,0,0.35); padding: 6px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;") curl -fsSL https://raw.githubusercontent.com/rockryda/Better-Sidebery/main/floorp/install.sh | bash

    .note(style="font-size: 11px; opacity: 0.7; margin-bottom: 14px;")
      | *Click to copy, paste into Terminal, and press Enter. Then completely restart your browser (Cmd + Q).*

    .sub-fields(style="padding: 12px 14px; background: rgba(0, 0, 0, 0.25); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.08);")
      .label(style="font-size: 13px; font-weight: 600; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;")
        span ⚡
        span Recommended for Floorp Users
      .note(style="font-size: 11.5px; line-height: 1.6; opacity: 0.9; margin-bottom: 8px;")
        | Highly recommended to avoid having Sidebery and Floorp's native tab bar running at the same time:
        br
        | • <b>Hide tabs on Horizontal Tab Bar</b>
        br
        | • <b>Collapse Tree Style Tab</b> (under Tab Bar Style)
      .ctrls(style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;")
        .btn(
          @click="openFloorpDesignSettings"
          style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #f4f4f5; font-size: 11px; font-weight: 500; cursor: pointer; padding: 5px 12px; border-radius: 4px;")
          span {{ statusMsg || '📋 Copy about:hub URL & Open Tab' }}
        code(style="font-size: 10.5px; opacity: 0.85; user-select: all; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;") about:hub#/features/design

  ToggleField(
    label="settings.native_scrollbars"
    v-model:value="Settings.state.nativeScrollbars"
    @update:value="Settings.saveDebounced(150)")
  .sub-fields
    ToggleField(
      label="settings.native_scrollbars_thin"
      :inactive="!Settings.state.nativeScrollbars"
      v-model:value="Settings.state.nativeScrollbarsThin"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.native_scrollbars_left"
      :inactive="!Settings.state.nativeScrollbars"
      v-model:value="Settings.state.nativeScrollbarsLeft"
      @update:value="Settings.saveDebounced(150)")
  ToggleField(
    label="settings.sel_win_screenshots"
    :value="Settings.state.selWinScreenshots"
    @update:value="toggleSelWinScreenshots")
  ToggleField(
    label="settings.update_sidebar_title"
    v-model:value="Settings.state.updateSidebarTitle"
    @update:value="Settings.saveDebounced(150)")
  ToggleField(
    label="settings.mark_window"
    v-model:value="Settings.state.markWindow"
    @update:value="Settings.saveDebounced(150)")
  .sub-fields
    TextField.-inline(
      label="settings.mark_window_preface"
      or="---"
      v-model:value="Settings.state.markWindowPreface"
      :note="translate('settings.mark_window_preface_note')"
      :inactive="!Settings.state.markWindow"
      @update:value="Settings.saveDebounced(500)")
  .ctrls
    .btn(@click="showStorageView") {{translate('settings.storage_btn')}} {{state.storageOveral}}
    .btn(@click="showPermissionsPopup") {{translate('settings.permissions_btn')}}
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'
import { SetupPage } from 'src/services/setup-page'
import ToggleField from '../../components/toggle-field.vue'
import TextField from '../../components/text-field.vue'
import { Stored } from 'src/types'
import * as Utils from 'src/utils'
import { Permissions } from 'src/services/permissions'

const el = ref<HTMLElement | null>(null)
const state = reactive({
  storageOveral: '-',
})

onMounted(() => {
  SetupPage.registerEl('settings_general', el.value)
  calcStorageInfo()
})

function showStorageView(): void {
  location.hash = 'storage'
}

async function calcStorageInfo(): Promise<void> {
  let stored: Stored
  try {
    stored = await browser.storage.local.get<Stored>()
  } catch (err) {
    return
  }

  state.storageOveral = Utils.strSize(JSON.stringify(stored))
}

async function toggleSelWinScreenshots(): Promise<void> {
  if (!Settings.state.selWinScreenshots && !Permissions.reactive.webData) {
    const result = await Permissions.request('<all_urls>')
    if (!result) return
  }

  Settings.state.selWinScreenshots = !Settings.state.selWinScreenshots
  Settings.saveDebounced(150)
}

function showPermissionsPopup(): void {
  SetupPage.reactive.permissions = true
}

const isFloorpDetected = typeof navigator !== 'undefined' && navigator.userAgent.includes('Floorp')
const selectedBrowser = ref(isFloorpDetected ? 'floorp' : 'firefox')
const statusMsg = ref('')
const scriptMsg = ref('')

async function copySetupScript(): Promise<void> {
  const cmd =
    'curl -fsSL https://raw.githubusercontent.com/rockryda/Better-Sidebery/main/floorp/install.sh | bash'
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(cmd)
    }
  } catch {}
  scriptMsg.value = '✓ Copied terminal command!'
  setTimeout(() => {
    scriptMsg.value = ''
  }, 4000)
}

async function openFloorpDesignSettings(): Promise<void> {
  const url = 'about:hub#/features/design'

  // Pre-copy to clipboard in case browser blocks direct about: navigation
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    }
  } catch {}

  let navigated = false

  // 1. Attempt direct navigation via WebExtensions API
  if (typeof browser !== 'undefined' && browser.tabs) {
    try {
      await browser.tabs.create({ url })
      navigated = true
    } catch {
      // Gecko WebExtension schema blocked about: URL with Illegal URL error
      try {
        await browser.tabs.create({})
      } catch {}
    }
  } else {
    try {
      window.open(url, '_blank')
      navigated = true
    } catch {}
  }

  if (navigated) {
    statusMsg.value = '✓ Opened Floorp Design Settings!'
  } else {
    statusMsg.value = '✓ Copied URL! Press Cmd+V & Enter in the new tab'
  }

  setTimeout(() => {
    statusMsg.value = ''
  }, 4000)
}
</script>
