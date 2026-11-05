<template lang="pug">
section(ref="el")
  h2 {{translate('settings.tabs_title')}}
  span.header-shadow
  SelectField(
    label="settings.warn_on_multi_tab_close"
    optLabel="settings.warn_on_multi_tab_close_"
    v-model:value="Settings.state.warnOnMultiTabClose"
    :opts="Settings.getOpts('warnOnMultiTabClose')"
    @update:value="Settings.saveDebounced(150)")
  SelectField(
    label="settings.tab_rm_btn"
    optLabel="settings.tab_rm_btn_"
    v-model:value="Settings.state.tabRmBtn"
    :folded="true"
    :opts="Settings.getOpts('tabRmBtn')"
    @update:value="Settings.saveDebounced(150)")
  SelectField(
    label="settings.tabs_url_in_tooltip"
    optLabel="settings.tabs_url_in_tooltip_"
    v-model:value="Settings.state.tabsUrlInTooltip"
    :opts="Settings.getOpts('tabsUrlInTooltip')"
    @update:value="Settings.saveDebounced(150)")
  ToggleField(
    label="settings.show_new_tab_btns"
    v-model:value="Settings.state.showNewTabBtns"
    @update:value="Settings.saveDebounced(150)")
  .sub-fields
    SelectField(
      label="settings.new_tab_bar_position"
      optLabel="settings.new_tab_bar_position_"
      v-model:value="Settings.state.newTabBarPosition"
      :inactive="!Settings.state.showNewTabBtns"
      :opts="Settings.getOpts('newTabBarPosition')"
      @update:value="Settings.saveDebounced(150)")
  AdvancedItems
    ToggleField(
      label="settings.tabs_rm_undo_note"
      v-model:value="Settings.state.tabsRmUndoNote"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.activate_last_tab_on_panel_switching"
      :inactive="Settings.state.hideInact"
      :value="Settings.state.activateLastTabOnPanelSwitching"
      @update:value="toggleActivateLastTabOnPanelSwitching")
    SelectField(
      label="settings.switch_panel_after_switching_tab"
      :inactive="Settings.state.hideInact"
      optLabel="settings.switch_panel_after_switching_tab_"
      v-model:value="Settings.state.switchPanelAfterSwitchingTab"
      :folded="true"
      :opts="Settings.getOpts('switchPanelAfterSwitchingTab')"
      @update:value="toggleSwitchPanelAfterSwitchingTab")
    SelectField(
      label="settings.activate_after_closing"
      optLabel="settings.activate_after_closing_"
      v-model:value="Settings.state.activateAfterClosing"
      :folded="true"
      :opts="Settings.getOpts('activateAfterClosing')"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.tabs_unread_mark"
      v-model:value="Settings.state.tabsUnreadMark"
      @update:value="Settings.saveDebounced(150)")
    SelectField(
      label="settings.tabs_update_mark"
      optLabel="settings.tabs_update_mark_"
      v-model:value="Settings.state.tabsUpdateMark"
      :opts="Settings.getOpts('tabsUpdateMark')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
    CountField.-inline(
      label="settings.tabs_reload_limit"
      v-model:value="Settings.state.tabsReloadLimit"
      :min="1"
      @update:value="Settings.saveDebounced(500)")
    ToggleField(
      label="settings.tabs_reload_limit_notif"
      v-model:value="Settings.state.tabsReloadLimitNotif"
      :inactive="!(Settings.state.tabsReloadLimit > 0)"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.tabs_panel_switch_act_move"
      :inactive="Settings.state.hideInact"
      :value="Settings.state.tabsPanelSwitchActMove"
      @update:value="toggleTabsPanelSwitchActMove")
    ToggleField(
      label="settings.tabs_panel_switch_act_move_auto"
      :inactive="Settings.state.hideInact"
      :value="Settings.state.tabsPanelSwitchActMoveAuto"
      @update:value="toggleTabsPanelSwitchActMoveAuto")
  //- ToggleField(
  //-   label="settings.tab_warmup_on_hover"
  //-   v-model:value="Settings.state.tabWarmupOnHover"
  //-   @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="newTabPosEl")
    .sub-title: .text {{translate('settings.nav_settings_new_tab_position')}}
    SelectField(
      label="settings.move_new_tab"
      optLabel="settings.move_new_tab_"
      v-model:value="Settings.state.moveNewTab"
      :opts="Settings.getOpts('moveNewTab')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
    AdvancedItems
      SelectField.-no-separator(
        label="settings.move_new_tab_pin"
        optLabel="settings.move_new_tab_pin_"
        v-model:value="Settings.state.moveNewTabPin"
        :opts="Settings.getOpts('moveNewTabPin')"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.pinned_auto_group"
        :inactive="!Settings.state.tabsTree"
        v-model:value="Settings.state.pinnedAutoGroup"
        @update:value="Settings.saveDebounced(150)")
      SelectField(
        label="settings.move_new_tab_parent"
        optLabel="settings.move_new_tab_parent_"
        v-model:value="Settings.state.moveNewTabParent"
        :opts="Settings.getOpts('moveNewTabParent')"
        :folded="true"
        @update:value="Settings.saveDebounced(150)")
      SelectField(
        :inactive="!relativeToActiveTab"
        label="settings.move_new_tab_active_pin"
        optLabel="settings.move_new_tab_pin_"
        v-model:value="Settings.state.moveNewTabActivePin"
        :opts="Settings.getOpts('moveNewTabActivePin')"
        @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="pinTabsEl")
    .sub-title: .text {{translate('settings.nav_settings_pinned_tabs')}}
    SelectField.-no-separator(
      v-model:value="Settings.state.pinnedTabsPosition"
      label="settings.pinned_tabs_position"
      optLabel="settings.pinned_tabs_position_"
      :opts="Settings.getOpts('pinnedTabsPosition')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.pinned_tabs_list"
      :inactive="Settings.state.pinnedTabsPosition !== 'panel' && Settings.state.pinnedTabsPosition!== 'top'"
      v-model:value="Settings.state.pinnedTabsList"
      @update:value="Settings.saveDebounced(150)")
    AdvancedItems
      ToggleField(
        label="settings.pinned.no_unload"
        :inactive="Settings.state.pinnedTabsPosition !== 'panel'"
        v-model:value="Settings.state.pinnedNoUnload"
        @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="tabsTreeEl")
    .sub-title: .text {{translate('settings.nav_settings_tabs_tree')}}
    ToggleField.-no-separator(
      label="settings.tabs_tree_layout"
      v-model:value="Settings.state.tabsTree"
      @update:value="Settings.saveDebounced(150)")
    SelectField(
      label="settings.tabs_tree_limit"
      optLabel="settings.tabs_tree_limit_"
      v-model:value="Settings.state.tabsTreeLimit"
      :inactive="!Settings.state.tabsTree"
      :opts="Settings.getOpts('tabsTreeLimit')"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.auto_fold_tabs"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.autoFoldTabs"
      @update:value="Settings.saveDebounced(150)")
    SelectField(
      label="settings.rm_child_tabs"
      optLabel="settings.rm_child_tabs_"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.rmChildTabs"
      :opts="Settings.getOpts('rmChildTabs')"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.tabs_lvl_dots"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.tabsLvlDots"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.show_new_group_conf"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.showNewGroupConf"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.sort_groups_first"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.sortGroupsFirst"
      @update:value="Settings.saveDebounced(150)")
    AdvancedItems
      SelectField(
        label="settings.auto_fold_tabs_except"
        optLabel="settings.auto_fold_tabs_except_"
        v-model:value="Settings.state.autoFoldTabsExcept"
        :inactive="!Settings.state.tabsTree || !Settings.state.autoFoldTabs"
        :opts="Settings.getOpts('autoFoldTabsExcept')"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.group_on_open_layout"
        v-model:value="Settings.state.groupOnOpen"
        :inactive="!Settings.state.tabsTree"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.auto_exp_tabs"
        :inactive="!Settings.state.tabsTree"
        v-model:value="Settings.state.autoExpandTabs"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.auto_exp_tabs_on_new"
        :inactive="!Settings.state.tabsTree"
        v-model:value="Settings.state.autoExpandTabsOnNew"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.discard_folded"
        :inactive="!Settings.state.tabsTree"
        v-model:value="Settings.state.discardFolded"
        @update:value="Settings.saveDebounced(150)")
      SelectField(
        label="settings.tree_rm_outdent"
        optLabel="settings.tree_rm_outdent_"
        v-model:value="Settings.state.treeRmOutdent"
        :inactive="!Settings.state.tabsTree"
        :opts="Settings.getOpts('treeRmOutdent')"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.auto_group_on_close"
        :inactive="!Settings.state.tabsTree"
        v-model:value="Settings.state.autoGroupOnClose"
        @update:value="Settings.saveDebounced(150)")
      ToggleField(
        label="settings.ignore_folded_parent"
        :inactive="!Settings.state.tabsTree"
        v-model:value="Settings.state.ignoreFoldedParent"
        @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="tabsColorEl")
    .sub-title: .text {{translate('settings.nav_settings_tabs_colorization')}}
    ToggleField.-no-separator(
      label="settings.colorize_tabs"
      v-model:value="Settings.state.colorizeTabs"
      @update:value="Settings.saveDebounced(150)")
    .sub-fields
      SelectField(
        label="settings.colorize_tabs_src"
        optLabel="settings.colorize_tabs_src_"
        v-model:value="Settings.state.colorizeTabsSrc"
        :inactive="!Settings.state.colorizeTabs"
        :opts="Settings.getOpts('colorizeTabsSrc')"
        @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.colorize_branches"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.colorizeTabsBranches"
      @update:value="Settings.saveDebounced(150)")
    .sub-fields
      SelectField(
        label="settings.colorize_branches_src"
        optLabel="settings.colorize_branches_src_"
        v-model:value="Settings.state.colorizeTabsBranchesSrc"
        :inactive="!Settings.state.tabsTree || !Settings.state.colorizeTabsBranches"
        :opts="Settings.getOpts('colorizeTabsBranchesSrc')"
        @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.tabs.inherit_custom_color"
      :inactive="!Settings.state.tabsTree"
      v-model:value="Settings.state.inheritCustomColor"
      @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="tabsPreviewEl")
    .sub-title: .text {{translate('settings.nav_settings_tabs_preview')}}
    ToggleField.-no-separator(
      label="settings.tabs.preview"
      :value="Settings.state.previewTabs"
      @update:value="togglePreviewTabs")
    AdvancedItems
      SelectField(
        label="settings.tabs.preview_mode"
        optLabel="settings.tabs.preview_mode_"
        v-model:value="Settings.state.previewTabsMode"
        :inactive="!Settings.state.previewTabs"
        :opts="Settings.getOpts('previewTabsMode')"
        :folded="true"
        @update:value="Settings.saveDebounced(150)")
      SelectField(
        label="settings.tabs.preview_side"
        optLabel="settings.tabs.preview_side_"
        v-model:value="Settings.state.previewTabsSide"
        :inactive="!Settings.state.previewTabs || Settings.state.previewTabsMode === 'i'"
        :opts="Settings.getOpts('previewTabsSide')"
        @update:value="Settings.saveDebounced(150)")
  .wrapper(ref="nativeTabsEl")
    .sub-title: .text {{translate('settings.nav_settings_tabs_native')}}
    ToggleField.-no-separator(
      label="settings.hide_inactive_panel_tabs"
    note="While on, these stay enabled and are locked: Activate last tab, Move tab when switching panels, Switch panel after switching tab."
      :value="Settings.state.hideInact"
      @update:value="toggleHideInact")
    AdvancedItems
      ToggleField(
        label="settings.hide_folded_tabs"
        :inactive="!Settings.state.tabsTree"
        :value="Settings.state.hideFoldedTabs"
        @update:value="toggleHideFoldedTabs")
  GroupSection
  ContainersSection
  AdvancedFold(@body="onAdvBody")
</template>

<script lang="ts" setup>
import GroupSection from './settings.group.vue'
import ContainersSection from './settings.containers.vue'
import { ref, computed, onMounted, shallowRef, provide } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'
import { Permissions } from 'src/services/permissions'
import { SetupPage } from 'src/services/setup-page'
import CountField from '../../components/count-field.vue'
import ToggleField from '../../components/toggle-field.vue'
import SelectField from '../../components/select-field.vue'
import AdvancedItems from '../../components/advanced-items.vue'
import AdvancedFold from '../../components/advanced-fold.vue'
import { ADV_KEY } from '../advanced-target'

const el = ref<HTMLElement | null>(null)
const newTabPosEl = ref<HTMLElement | null>(null)
const pinTabsEl = ref<HTMLElement | null>(null)
const tabsTreeEl = ref<HTMLElement | null>(null)
const tabsColorEl = ref<HTMLElement | null>(null)
const tabsPreviewEl = ref<HTMLElement | null>(null)
const nativeTabsEl = ref<HTMLElement | null>(null)

const relativeToActiveTab = computed<boolean>(() => {
  return (
    Settings.state.moveNewTab === 'after' ||
    Settings.state.moveNewTab === 'before' ||
    Settings.state.moveNewTab === 'first_child' ||
    Settings.state.moveNewTab === 'last_child'
  )
})

function toggleActivateLastTabOnPanelSwitching(): void {
  Settings.state.activateLastTabOnPanelSwitching = !Settings.state.activateLastTabOnPanelSwitching

  if (!Settings.state.activateLastTabOnPanelSwitching && Settings.state.hideInact) {
    Settings.state.hideInact = false
  }

  Settings.saveDebounced(150)
}

async function toggleHideInact(): Promise<void> {
  if (!Settings.state.hideInact && !Permissions.reactive.tabHide) {
    const result = await Permissions.request('tabHide')
    if (!result) return
  }

  Settings.state.hideInact = !Settings.state.hideInact

  if (Settings.state.hideInact && !Settings.state.activateLastTabOnPanelSwitching) {
    Settings.state.activateLastTabOnPanelSwitching = true
  }

  if (Settings.state.hideInact && !Settings.state.tabsPanelSwitchActMove) {
    Settings.state.tabsPanelSwitchActMove = true
  }

  if (Settings.state.hideInact && !Settings.state.tabsPanelSwitchActMoveAuto) {
    Settings.state.tabsPanelSwitchActMoveAuto = true
  }

  const notAlwaysSwitch = Settings.state.switchPanelAfterSwitchingTab !== 'always'
  if (Settings.state.hideInact && notAlwaysSwitch) {
    Settings.state.switchPanelAfterSwitchingTab = 'always'
  }

  Settings.saveDebounced(150)
}

function toggleTabsPanelSwitchActMove(): void {
  Settings.state.tabsPanelSwitchActMove = !Settings.state.tabsPanelSwitchActMove

  if (!Settings.state.tabsPanelSwitchActMove && Settings.state.hideInact) {
    Settings.state.hideInact = false
  }

  Settings.saveDebounced(150)
}

function toggleTabsPanelSwitchActMoveAuto(): void {
  Settings.state.tabsPanelSwitchActMoveAuto = !Settings.state.tabsPanelSwitchActMoveAuto

  if (!Settings.state.tabsPanelSwitchActMoveAuto && Settings.state.hideInact) {
    Settings.state.hideInact = false
  }

  Settings.saveDebounced(150)
}

async function toggleHideFoldedTabs(): Promise<void> {
  // Only ask for the permission when turning the setting on
  if (!Settings.state.hideFoldedTabs && !Permissions.reactive.tabHide) {
    const result = await Permissions.request('tabHide')
    if (!result) return
  }

  Settings.state.hideFoldedTabs = !Settings.state.hideFoldedTabs

  Settings.saveDebounced(150)
}

function toggleSwitchPanelAfterSwitchingTab() {
  const notAlways = Settings.state.switchPanelAfterSwitchingTab !== 'always'

  if (notAlways && Settings.state.hideInact) {
    Settings.state.hideInact = false
  }

  Settings.saveDebounced(150)
}

async function togglePreviewTabs() {
  if (!Settings.state.previewTabs && !Permissions.reactive.webData) {
    const result = await Permissions.request('<all_urls>')
    if (!result) return
  }

  Settings.state.previewTabs = !Settings.state.previewTabs

  Settings.saveDebounced(150)
}

const advTarget = shallowRef<HTMLElement | null>(null)
provide(ADV_KEY, advTarget)
function onAdvBody(el: HTMLElement): void {
  advTarget.value = el
}
onMounted(() => {
  SetupPage.registerEl('settings_tabs', el.value)
  SetupPage.registerEl('settings_new_tab_position', newTabPosEl.value)
  SetupPage.registerEl('settings_pinned_tabs', pinTabsEl.value)
  SetupPage.registerEl('settings_tabs_tree', tabsTreeEl.value)
  SetupPage.registerEl('settings_tabs_colorization', tabsColorEl.value)
  SetupPage.registerEl('settings_tabs_preview', tabsPreviewEl.value)
  SetupPage.registerEl('settings_tabs_native', nativeTabsEl.value)
})
</script>
