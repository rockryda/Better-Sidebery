<template lang="pug">
section(ref="el")
  h2 {{translate('settings.mouse_title')}}
  span.header-shadow
  AdvancedFold(title="Advanced")
    SelectField(
      label="settings.h_scroll_action"
      optLabel="settings.h_scroll_action_"
      v-model:value="Settings.state.hScrollAction"
      :opts="Settings.getOpts('hScrollAction')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
    SelectField(
      label="settings.scroll_through_tabs"
      optLabel="settings.scroll_through_tabs_"
      v-model:value="Settings.state.scrollThroughTabs"
      :folded="true"
      :opts="Settings.getOpts('scrollThroughTabs')"
      :note="(Settings.state.scrollThroughTabs === 'psp' || Settings.state.scrollThroughTabs === 'psg') ? translate('settings.scroll_through_tabs_preselect_note') : undefined"
      @update:value="Settings.saveDebounced(150)")
    ToggleField.-last(
      label="settings.nav_switch_panels_wheel"
      v-model:value="Settings.state.navSwitchPanelsWheel"
      @update:value="Settings.saveDebounced(150)")
    SelectField(
      label="settings.tabs_panel_double_click_action"
      optLabel="settings.tabs_panel_action_"
      v-model:value="Settings.state.tabsPanelDoubleClickAction"
      :inactive="Settings.state.tabsPanelLeftClickAction !== 'none'"
      :opts="Settings.getOpts('tabsPanelDoubleClickAction')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="tabsEl")
    .sub-title: .text {{translate('settings.nav_settings_mouse_tabs')}}
    SelectField.-no-separator(
      label="settings.tab_double_click"
      optLabel="settings.tab_action_"
      v-model:value="Settings.state.tabDoubleClick"
      :opts="Settings.getOpts('tabDoubleClick')"
      :folded="true"
      @update:value="onTabDoubleClickUpdate")
    SelectField(
      label="settings.tab_middle_click"
      optLabel="settings.tab_action_"
      v-model:value="Settings.state.tabMiddleClick"
      :opts="Settings.getOpts('tabMiddleClick')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
    AdvancedFold(title="Advanced")
      ToggleField(
        label="settings.tabs_second_click_act_prev"
        v-model:value="Settings.state.tabsSecondClickActPrev"
        @update:value="onTabsSecondClickActPrevUpdate")
  MenuSection
  DndSection
</template>

<script lang="ts" setup>
import MenuSection from './settings.menu.vue'
import DndSection from './settings.dnd.vue'
import AdvancedFold from '../../components/advanced-fold.vue'
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'
import { SetupPage } from 'src/services/setup-page'
import ToggleField from '../../components/toggle-field.vue'
import SelectField from '../../components/select-field.vue'

const el = ref<HTMLElement | null>(null)
const navEl = ref<HTMLElement | null>(null)
const tabsEl = ref<HTMLElement | null>(null)
const tabsPanelEl = ref<HTMLElement | null>(null)
const ntbEl = ref<HTMLElement | null>(null)
const bookmarksEl = ref<HTMLElement | null>(null)
const historyEl = ref<HTMLElement | null>(null)

onMounted(() => {
  SetupPage.registerEl('settings_mouse', el.value)
  SetupPage.registerEl('settings_mouse_nav', navEl.value)
  SetupPage.registerEl('settings_mouse_tabs', tabsEl.value)
  SetupPage.registerEl('settings_mouse_tabs_panel', tabsPanelEl.value)
  SetupPage.registerEl('settings_mouse_new_tab_button', ntbEl.value)
  SetupPage.registerEl('settings_mouse_bookmarks', bookmarksEl.value)
  SetupPage.registerEl('settings_mouse_history', historyEl.value)
})

function onTabsSecondClickActPrevUpdate(value: boolean): void {
  if (value) Settings.state.tabDoubleClick = 'none'
  Settings.saveDebounced(150)
}

function onTabDoubleClickUpdate(value: string): void {
  if (value !== 'none') Settings.state.tabsSecondClickActPrev = false
  Settings.saveDebounced(150)
}
</script>
