<template lang="pug">
section(ref="el")
  h2 {{translate('settings.controls_title')}}
  span.header-shadow
  MouseSection
  MenuSection
  DndSection
  BookmarksSection
  HistorySection
  AdvancedFold(@body="onAdvBody")
</template>

<script lang="ts" setup>
import { shallowRef, provide } from 'vue'
import AdvancedFold from '../../components/advanced-fold.vue'
import { ADV_KEY } from '../advanced-target'
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { SetupPage } from 'src/services/setup-page'
import MouseSection from './settings.mouse.vue'
import MenuSection from './settings.menu.vue'
import DndSection from './settings.dnd.vue'
import BookmarksSection from './settings.bookmarks.vue'
import HistorySection from './settings.history.vue'

const el = ref<HTMLElement | null>(null)
const advTarget = shallowRef<HTMLElement | null>(null)
provide(ADV_KEY, advTarget)
function onAdvBody(el: HTMLElement): void {
  advTarget.value = el
}
onMounted(() => SetupPage.registerEl('settings_controls', el.value))
</script>
