<template lang="pug">
section(ref="el")
  h2 {{translate('settings.sidebar_title')}}
  span.header-shadow
  GeneralSection
  NavbarSection
  SearchSection
  AppearanceSection
  AdvancedFold(@body="onAdvBody")
</template>

<script lang="ts" setup>
import { shallowRef, provide } from 'vue'
import AdvancedFold from '../../components/advanced-fold.vue'
import { ADV_KEY } from '../advanced-target'
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { SetupPage } from 'src/services/setup-page'
import GeneralSection from './settings.general.vue'
import NavbarSection from './settings.navbar.vue'
import SearchSection from './settings.search.vue'
import AppearanceSection from './settings.appearance.vue'

const el = ref<HTMLElement | null>(null)
const advTarget = shallowRef<HTMLElement | null>(null)
provide(ADV_KEY, advTarget)
function onAdvBody(el: HTMLElement): void {
  advTarget.value = el
}
onMounted(() => SetupPage.registerEl('settings_sidebar', el.value))
</script>
