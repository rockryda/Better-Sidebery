<template lang="pug">
.wrapper(ref="el")
  .sub-title: .text {{translate('settings.snapshots_title')}}  ({{state.snapshotsLen}}: ~{{state.snapshotsSize}} / 10 mb)
  NumField(
    label="settings.snap_interval"
    unitLabel="settings.snap_interval_"
    v-model:value="Settings.state.snapInterval"
    v-model:unit="Settings.state.snapIntervalUnit"
    :or="'none'"
    :unitOpts="SETTINGS_OPTIONS.snapIntervalUnit"
    @update:value="Settings.saveDebounced(500)"
    @update:unit="Settings.saveDebounced(150)")
  NumField(
    label="settings.snap_limit"
    unitLabel="settings.snap_limit_"
    v-model:value="Settings.state.snapLimit"
    v-model:unit="Settings.state.snapLimitUnit"
    :or="'none'"
    :unitOpts="SETTINGS_OPTIONS.snapLimitUnit"
    :maxValue="Settings.state.snapLimitUnit === 'kb' ? MAX_SIZE_LIMIT : undefined"
    :note="translate('settings.snap_limit_note')"
    @update:value="Settings.saveDebounced(500)"
    @update:unit="Settings.saveDebounced(150)")
  .ctrls
    .btn(@click="SetupPage.switchView('snapshots')") {{translate('settings.snapshots_view_label')}}
    .btn(@click="createSnapshot") {{translate('settings.make_snapshot')}}
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { translate } from 'src/dict'
import { SETTINGS_OPTIONS } from 'src/defaults'
import { Stored } from 'src/types'
import * as IPC from 'src/services/ipc'
import { Settings } from 'src/services/settings'
import { SetupPage } from 'src/services/setup-page'
import { MAX_SIZE_LIMIT } from 'src/services/snapshots.actions'
import NumField from '../../components/num-field.vue'
import * as Utils from 'src/utils'

const el = ref<HTMLElement | null>(null)
const state = reactive({
  snapshotsLen: '-',
  snapshotsSize: '-',
})

onMounted(() => {
  SetupPage.registerEl('settings_snapshots', el.value)

  calcInfo()
})

async function createSnapshot(): Promise<void> {
  await IPC.bg('createSnapshot')
  calcInfo()
}

async function calcInfo(): Promise<void> {
  let stored: Stored
  try {
    stored = await browser.storage.local.get<Stored>('snapshots')
  } catch (err) {
    return
  }

  const snapshots = stored.snapshots ?? []
  state.snapshotsLen = snapshots.length.toString()
  state.snapshotsSize = Utils.bytesToStr(new Blob([JSON.stringify(snapshots)]).size)
}
</script>
