<template lang="pug">
section(ref="el")
  h2 {{translate('settings.sidebar_title')}}
  span.header-shadow
  NavbarSection
  SearchSection
  AppearanceSection
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { SetupPage } from 'src/services/setup-page'
import NavbarSection from './settings.navbar.vue'
import SearchSection from './settings.search.vue'
import AppearanceSection from './settings.appearance.vue'

const el = ref<HTMLElement | null>(null)
onMounted(() => SetupPage.registerEl('settings_sidebar', el.value))
</script>
