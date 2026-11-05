import type { InjectionKey, Ref } from 'vue'

/** Element of the page-level "Advanced" block that sub-sections teleport their advanced fields into */
export const ADV_KEY: InjectionKey<Ref<HTMLElement | null>> = Symbol('advanced-target')
