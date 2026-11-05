<template lang="pug">
section(ref="el")
  h2 {{translate('settings.data_title')}}
  span.header-shadow
  SnapshotsSection
  HelpSection
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { SetupPage } from 'src/services/setup-page'
import SnapshotsSection from './settings.snapshots.vue'
import HelpSection from './settings.help.vue'

const el = ref<HTMLElement | null>(null)
onMounted(() => SetupPage.registerEl('settings_data', el.value))
</script>
