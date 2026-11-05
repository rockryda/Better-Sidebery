<template lang="pug">
.SettingsSaveBar(v-if="Settings.draft.dirty || savedMsg")
  template(v-if="Settings.draft.dirty")
    .msg {{translate('settings.draft_msg')}}
    .btn(@click="discard") {{translate('settings.draft_discard')}}
    .btn.-primary(@click="save") {{translate('settings.draft_save')}}
  .msg(v-else) {{savedMsg}}
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { translate } from 'src/dict'
import { Settings } from 'src/services/settings'

const savedMsg = ref('')
let savedTimeout: number | undefined

async function save(): Promise<void> {
  await Settings.commitDraft()
  savedMsg.value = translate('settings.draft_saved')
  clearTimeout(savedTimeout)
  savedTimeout = window.setTimeout(() => (savedMsg.value = ''), 2500)
}

function discard(): void {
  Settings.discardDraft()
}
</script>
