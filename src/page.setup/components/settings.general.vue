<template lang="pug">
section(ref="el")
  h2 {{translate('settings.general_title')}}
  span.header-shadow

  .sub-fields(style="margin-bottom: 18px; padding: 14px 16px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.28); border-radius: 8px;")
    .label(style="font-size: 14px; font-weight: 600; color: #22c55e; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;")
      span(style="display: flex; align-items: center; gap: 6px;")
        span 🦊
        span Browser Optimization (Clean Vertical Tabs)
      .ctrls(style="display: flex; gap: 6px;")
        .btn(
          :style="selectedBrowser === 'floorp' ? 'background: rgba(34, 197, 94, 0.35); border-color: #22c55e; color: #ffffff;' : 'opacity: 0.6;'"
          @click="selectedBrowser = 'floorp'"
          style="padding: 2px 10px; font-size: 11px; border-radius: 4px; cursor: pointer;") Floorp
        .btn(
          :style="selectedBrowser === 'firefox' ? 'background: rgba(34, 197, 94, 0.35); border-color: #22c55e; color: #ffffff;' : 'opacity: 0.6;'"
          @click="selectedBrowser = 'firefox'"
          style="padding: 2px 10px; font-size: 11px; border-radius: 4px; cursor: pointer;") Firefox / Other

    // Floorp Tab
    template(v-if="selectedBrowser === 'floorp'")
      .note(style="font-size: 12px; line-height: 1.6; opacity: 0.88; margin-bottom: 10px;")
        | In Floorp, hide the duplicate top bar and sidebar header via built-in settings:
        br
        | 1. Toggle <b>Hide tabs on Horizontal Tab Bar</b>
        br
        | 2. Select <b>Collapse Tree Style Tab</b> (under Tab Bar Style)
      .ctrls(style="display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap;")
        .btn(
          @click="openFloorpDesignSettings"
          style="background: rgba(34, 197, 94, 0.25); border: 1px solid #22c55e; color: #f4f4f5; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 6px;")
          span {{ statusMsg || '📋 Copy URL & Open New Tab ↗' }}
        code(style="font-size: 11px; opacity: 0.85; user-select: all; background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08);") about:hub#/features/design
      .note(style="font-size: 11px; opacity: 0.7; margin-top: 6px;")
        | *Click to copy the link and open a new tab, then press <b>Cmd + V</b> & <b>Enter</b> in the address bar.*

    // Firefox & Other Browsers Tab
    template(v-else)
      .note(style="font-size: 12px; line-height: 1.6; opacity: 0.88; margin-bottom: 10px;")
        | For standard Firefox, LibreWolf, or Waterfox:
        br
        | • <b>Firefox 131+:</b> Enable built-in vertical tabs under <i>Settings ➔ General ➔ Tabs</i>.
        br
        | • <b>All Firefox Versions:</b> Use our 1-click companion script to cleanly hide the top bar and sidebar header:
      .ctrls(style="display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap;")
        .btn(
          @click="copySetupScript"
          style="background: rgba(34, 197, 94, 0.25); border: 1px solid #22c55e; color: #f4f4f5; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 6px;")
          span {{ scriptMsg || '📋 Copy Terminal Command' }}
        code(style="font-size: 11px; opacity: 0.85; user-select: all; background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;") curl -fsSL https://raw.githubusercontent.com/rockryda/Better-Sidebery/main/floorp/install.sh | bash
      .note(style="font-size: 11px; opacity: 0.7; margin-top: 6px;")
        | *Click to copy, paste into your terminal, and press Enter. Then restart your browser.*

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
