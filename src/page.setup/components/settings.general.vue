<template lang="pug">
section(ref="el")
  h2 {{translate('settings.general_title')}}
  span.header-shadow
  .sub-fields(style="margin-bottom: 18px; padding: 14px 16px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.28); border-radius: 8px;")
    .label(style="font-size: 14px; font-weight: 600; color: #22c55e; margin-bottom: 6px;") Companion setup (Floorp / Firefox)
    .note(style="font-size: 12px; line-height: 1.5; opacity: 0.9; margin-bottom: 10px;")
      | Optional: adds the 48px icon rail, hover-expand, drag-to-resize and Zen mode. Copy the command, run it in Terminal, then restart the browser.
    .ctrls(style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;")
      .btn(
        @click="copySetupScript"
        style="background: #22c55e; color: #0f172a; font-weight: 600; cursor: pointer; padding: 6px 14px; border-radius: 6px;")
        span {{ scriptMsg || 'Copy setup command' }}
      .btn(
        @click="openFloorpDesignSettings"
        style="cursor: pointer; padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(128,128,128,.5);")
        span {{ statusMsg || 'Open Floorp tab settings' }}
    .note(style="font-size: 11.5px; line-height: 1.5; opacity: 0.75; margin-top: 8px;")
      | Also turn on "Hide tabs on Horizontal Tab Bar" and "Collapse Tree Style Tab" in Floorp so the native tab bar doesn't run alongside Sidebery.
  ToggleField(
    label="settings.native_scrollbars"
    v-model:value="Settings.state.nativeScrollbars"
    @update:value="Settings.saveDebounced(150)")
  ToggleField(
    label="settings.update_sidebar_title"
    v-model:value="Settings.state.updateSidebarTitle"
    @update:value="Settings.saveDebounced(150)")
  AdvancedFold(title="Advanced")
    ToggleField(
      label="settings.native_scrollbars_thin"
      :inactive="!Settings.state.nativeScrollbars"
      v-model:value="Settings.state.nativeScrollbarsThin"
      @update:value="Settings.saveDebounced(150)")
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
import { Stored } from 'src/types'
import * as Utils from 'src/utils'

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

function showPermissionsPopup(): void {
  SetupPage.reactive.permissions = true
}

const statusMsg = ref('')
const scriptMsg = ref('')

async function copySetupScript(): Promise<void> {
  const cmd =
    'curl -fsSL https://raw.githubusercontent.com/rockryda/Better-Sidebery/Master/floorp/install.sh | bash'
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(cmd)
    }
  } catch {
    // ignore: clipboard/tab API unavailable
  }
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
  } catch {
    // ignore: clipboard/tab API unavailable
  }

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
      } catch {
        // ignore: clipboard/tab API unavailable
      }
    }
  } else {
    try {
      window.open(url, '_blank')
      navigated = true
    } catch {
      // ignore: clipboard/tab API unavailable
    }
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
