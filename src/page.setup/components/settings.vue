<template lang="pug">
.Settings(ref="rootEl" @scroll.passive="onScroll")
  .settings-search
    input(
      type="search"
      placeholder="Search settings..."
      v-model="settingsFilter.q"
      spellcheck="false"
      autocomplete="off")
  SidebarSection(v-show="show('settings_sidebar')")
  TabsSection(v-show="show('settings_tabs')")
  ControlsSection(v-show="show('settings_controls')")
  DataSection(v-show="show('settings_data')")
  FooterSection

  .btw: p v{{Info.reactive.addonVer}}

  Transition(name="popup")
    .popup-layer(
      v-if="SetupPage.reactive.permissions"
      @click="SetupPage.closePermissionsPopup")
      .popup-box(@click.stop="")
        PermissionsPopup
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onActivated } from 'vue'
import { settingsFilter } from '../settings-filter'
import { SetupPage } from 'src/services/setup-page'
import { Info } from 'src/services/info'
import SidebarSection from './settings.sidebar.vue'
import TabsSection from './settings.tabs.vue'
import ControlsSection from './settings.controls.vue'
import DataSection from './settings.data.vue'
import PermissionsPopup from 'src/page.setup/components/popup.permissions.vue'
import FooterSection from './footer-section.vue'

const rootEl = ref<HTMLElement | null>(null)

// Each top-level section is a page; while searching, every page is shown
const show = (page: string): boolean =>
  !!settingsFilter.q.trim() || SetupPage.reactive.settingsPage === page
watch(
  () => SetupPage.reactive.settingsPage,
  () => {
    if (rootEl.value) rootEl.value.scrollTop = 0
  }
)

// Settings search: hide fields (and their sub-fields) that don't match the query
const FIELD_SEL = '.ToggleField, .SelectField, .NumField, .CountField, .TextField, .InfoField'
watch(
  () => settingsFilter.q,
  async q => {
    await nextTick()
    const root = rootEl.value
    if (!root) return
    const query = q.trim().toLowerCase()
    for (const el of Array.from(root.querySelectorAll<HTMLElement>(FIELD_SEL))) {
      if (el.closest('.settings-search')) continue
      const hit = !query || (el.textContent ?? '').toLowerCase().includes(query)
      el.style.display = hit ? '' : 'none'
    }
  }
)

// Restore prev scroll position
let scrollY = 0
onActivated(() => {
  if (scrollY && rootEl.value) rootEl.value.scrollTop = scrollY
})

function onScroll(e: Event): void {
  scrollY = (e.target as HTMLElement).scrollTop
  if (SetupPage.navLock) return
  SetupPage.updateActiveSection((e.target as HTMLElement).scrollTop)
}
</script>
