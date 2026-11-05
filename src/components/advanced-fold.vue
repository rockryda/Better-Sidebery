<template lang="pug">
.AdvancedFold(:data-open="shown")
  .fold-head(@click="open = !open")
    span.chev {{shown ? '▾' : '▸'}}
    span.fold-title {{title || 'Advanced'}}
  .fold-body(ref="bodyEl" v-show="shown")
    slot
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { settingsFilter } from '../page.setup/settings-filter'

defineProps<{ title?: string }>()
const emit = defineEmits<{ (e: 'body', el: HTMLElement): void }>()
const bodyEl = ref<HTMLElement | null>(null)
onMounted(() => bodyEl.value && emit('body', bodyEl.value))
const open = ref(false)
// While searching, folds are always expanded so matches inside them are visible
const shown = computed(() => open.value || !!settingsFilter.q.trim())
</script>
