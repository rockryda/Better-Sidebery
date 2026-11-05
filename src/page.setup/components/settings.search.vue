<template lang="pug">
.wrapper(ref="el")
  .sub-title: .text {{translate('settings.search_title')}}
  SelectField(
    label="settings.search_bar_mode"
    optLabel="settings.search_bar_mode_"
    v-model:value="Settings.state.searchBarMode"
    :opts="Settings.getOpts('searchBarMode')"
    @update:value="Settings.saveDebounced(150)")
  AdvancedFold(title="Advanced")
    SelectField(
      label="settings.search_panel_switch"
      optLabel="settings.search_panel_switch_"
      v-model:value="Settings.state.searchPanelSwitch"
      :opts="Settings.getOpts('searchPanelSwitch')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
  InfoField(
    label="settings.search.shortcuts"
    :value="translate('settings.search.shortcuts.note')")
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { SetupPage } from 'src/services/setup-page'
import { Settings } from 'src/services/settings'
import SelectField from '../../components/select-field.vue'
import InfoField from 'src/components/info-field.vue'

const el = ref<HTMLElement | null>(null)

onMounted(() => SetupPage.registerEl('settings_search', el.value))
</script>
