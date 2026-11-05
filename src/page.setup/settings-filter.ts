import { reactive } from 'vue'

/** Shared state of the settings search box (also force-opens the "Advanced" folds) */
export const settingsFilter = reactive({ q: '' })
