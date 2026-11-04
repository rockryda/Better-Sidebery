<template lang="pug">
section(ref="el")
  h2 {{translate('settings.general_title')}}
  span.header-shadow

  .sub-fields(style="margin-bottom: 16px; padding: 14px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.28); border-radius: 8px;")
    .label(style="font-size: 14px; font-weight: 600; color: #22c55e; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;")
      span 🦊
      span Floorp Browser 1-Click Setup
    .note(style="font-size: 12px; line-height: 1.6; opacity: 0.88; margin-bottom: 10px;")
      | To remove duplicate horizontal tabs and the sidebar header in Floorp:
      br
      | • <b>Hide tabs on Horizontal Tab Bar</b>
      br
      | • <b>Collapse Tree Style Tab</b> (under Tab Bar Style)
    .ctrls(style="display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap;")
      .btn(
        @click="openFloorpDesignSettings"
        style="background: rgba(34, 197, 94, 0.25); border: 1px solid #22c55e; color: #f4f4f5; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 6px;")
        span {{ statusMsg || '🚀 Open Floorp Design Settings ↗' }}
      code(style="font-size: 11px; opacity: 0.85; user-select: all; background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.08);") about:hub#/features/design

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

const statusMsg = ref('')

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
