<template lang="pug">
Teleport(v-if="target" :to="target")
  slot
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { ADV_KEY } from '../page.setup/advanced-target'

// Renders its content inside the page-level "Advanced" block (one per settings page)
const target = inject(ADV_KEY, null)
</script>
