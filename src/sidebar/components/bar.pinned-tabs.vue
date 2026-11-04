<template lang="pug">
.PinnedTabsBar(
  tabindex="-1"
  :data-empty="pinnedTabs.length === 0"
  :data-collapsed="collapsed"
  :data-dnd-end="dropToEnd"
  data-dnd-type="pinned-bar"
  :data-dnd-id="panel?.id ?? NOID"
  @wheel="onWheel"
  @drop="onDrop")
  //- Icon-only rail: header that folds/unfolds the pinned tray
  .pinned-header(
    :title="collapsed ? 'Show pinned tabs' : 'Hide pinned tabs'"
    @mousedown.stop
    @mouseup.stop
    @click.stop="toggleCollapsed")
    span.ph-pin 📌
    span.ph-count {{pinnedTabs.length}}
    span.ph-chev {{collapsed ? '▸' : '▾'}}
  .tab-wrapper(v-for="id in pinnedTabs" :key="id" :data-targeted="DnD.reactive.dstPin && dropId === id")
    Tab(:tabId="id" :iconOnly="iconOnly")
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { DropType, TabsPanel, WheelDirection } from 'src/types'
import { Settings } from 'src/services/settings'
import { Tabs } from 'src/services/tabs.fg'
import { Mouse } from 'src/services/mouse'
import { DnD } from 'src/services/drag-and-drop'
import Tab from './tab.vue'
import { NOID } from 'src/defaults'

const props = defineProps<{ panel?: TabsPanel }>()

const COLLAPSED_KEY = 'sidebery_pinned_collapsed'
function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}
const collapsed = ref(loadCollapsed())
function toggleCollapsed(): void {
  collapsed.value = !collapsed.value
  try {
    localStorage.setItem(COLLAPSED_KEY, collapsed.value ? '1' : '0')
  } catch {
    // ignore
  }
}
const pinnedTabs = computed(() => {
  if (props.panel) return props.panel.reactive.pinnedTabIds
  else return Tabs.reactive.pinnedIds
})
const dropId = computed(() => {
  const tab = Tabs.list[DnD.reactive.dstIndex]
  if (!tab || !tab.pinned || (props.panel && tab.panelId !== props.panel.id)) return NOID
  else return tab.id
})
const dropToEnd = computed(() => DnD.reactive.dstPin && dropId.value === NOID)
const iconOnly = computed<boolean>(() => {
  if (
    Settings.state.pinnedTabsList &&
    (Settings.state.pinnedTabsPosition === 'panel' || Settings.state.pinnedTabsPosition === 'top')
  ) {
    return false
  }
  return true
})

const onWheel = Mouse.getWheelDebouncer(WheelDirection.Vertical, (e: WheelEvent) => {
  if (
    Settings.state.pinnedTabsPosition !== 'panel' &&
    Settings.state.scrollThroughTabs !== 'none'
  ) {
    const globaly = (Settings.state.scrollThroughTabs === 'global') !== e.shiftKey
    const cyclic = Settings.state.scrollThroughTabsCyclic !== e.ctrlKey

    if (e.deltaY > 0) Tabs.switchTab(globaly, cyclic, 1, true)
    if (e.deltaY < 0) Tabs.switchTab(globaly, cyclic, -1, true)
  }
})

function onDrop(): void {
  DnD.reactive.dstType = DropType.Tabs
  DnD.reactive.dstPin = true
}
</script>
