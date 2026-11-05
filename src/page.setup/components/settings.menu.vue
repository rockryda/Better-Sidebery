<template lang="pug">
.wrapper(ref="el")
  .sub-title: .text {{translate('settings.ctx_menu_title')}}
  ToggleField(
    label="settings.ctx_menu_native"
    v-model:value="Settings.state.ctxMenuNative"
    @update:value="Settings.saveDebounced(150)")
  AdvancedFold(title="Advanced")
    ToggleField(
      label="settings.ctx_menu_render_inact"
      v-model:value="Settings.state.ctxMenuRenderInact"
      @update:value="Settings.saveDebounced(150)")
    ToggleField(
      label="settings.ctx_menu_render_icons"
      v-model:value="Settings.state.ctxMenuRenderIcons"
      @update:value="Settings.saveDebounced(150)")
  .ctrls
    .btn(@click="SetupPage.switchView('menu_editor')") {{translate('settings.ctx_menu_editor')}}
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'
import { SetupPage } from 'src/services/setup-page'
import ToggleField from '../../components/toggle-field.vue'

const el = ref<HTMLElement | null>(null)
onMounted(() => SetupPage.registerEl('settings_menu', el.value))
</script>
