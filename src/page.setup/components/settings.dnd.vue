<template lang="pug">
.wrapper(ref="el")
  .sub-title: .text {{translate('settings.dnd_title')}}
  SelectField(
    label="settings.dnd_outside"
    optLabel="settings.dnd_outside_"
    v-model:value="Settings.state.dndOutside"
    :opts="Settings.getOpts('dndOutside')"
    :note="translate('settings.settings.dnd_outside_note')"
    @update:value="Settings.saveDebounced(150)")
  AdvancedItems
    ToggleField(
      label="settings.dnd_tab_act"
      v-model:value="Settings.state.dndTabAct"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.dnd_act_tab_from_link"
      v-model:value="Settings.state.dndActTabFromLink"
      @update:value="Settings.saveDebounced(150)")
    SelectField(
      label="settings.dnd_exp"
      optLabel="settings.dnd_exp_"
      v-model:value="Settings.state.dndExp"
      :opts="Settings.getOpts('dndExp')"
      :folded="true"
      @update:value="Settings.saveDebounced(150)")
</template>

<script lang="ts" setup>
import AdvancedItems from '../../components/advanced-items.vue'
import { onMounted, ref } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'
import { SetupPage } from 'src/services/setup-page'
import ToggleField from '../../components/toggle-field.vue'
import SelectField from '../../components/select-field.vue'

const el = ref<HTMLElement | null>(null)

onMounted(() => SetupPage.registerEl('settings_dnd', el.value))
</script>
