<template lang="pug">
.AdvancedFold(:data-open="shown")
  .fold-head(@click="open = !open")
    span.chev {{shown ? '▾' : '▸'}}
    span.fold-title {{title || 'Advanced'}}
    span.fold-hint {{shown ? '' : 'rarely needed'}}
  .fold-body(v-show="shown")
    slot
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { settingsFilter } from '../page.setup/settings-filter'

defineProps<{ title?: string }>()
const open = ref(false)
// While searching, folds are always expanded so matches inside them are visible
const shown = computed(() => open.value || !!settingsFilter.q.trim())
</script>
