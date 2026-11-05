<template lang="pug">
.CompanionSetup(:data-state="overall")
  .cs-head
    .cs-title Companion setup (Floorp / Firefox)
    .cs-chip(:data-state="overall") {{overallLabel}}
  .cs-note Optional: adds the 48px icon rail, hover-expand, drag-to-resize and Zen mode. Copy the command, run it in Terminal, then restart the browser.

  .cs-row(:data-state="cssState")
    .cs-icon {{cssIcon}}
    .cs-body
      .cs-name Icon rail styles (userChrome.css)
      .cs-detail {{cssDetail}}

  .cs-ctrls
    .btn.-primary(@click="copySetupScript") {{scriptMsg || 'Copy setup command'}}
    .btn(:data-disabled="checking" @click="checkNow") {{checking ? 'Checking...' : 'Check now'}}
    .btn(@click="openFloorpDesignSettings") {{statusMsg || 'Open Browser tab settings'}}
    .btn(@click="showUninstall = !showUninstall") {{showUninstall ? 'Hide uninstall steps' : 'How to uninstall'}}

  .cs-uninstall(v-if="showUninstall")
    .cs-name Uninstall the companion styles
    ol
      li Copy the uninstall command below and run it in Terminal.
      li It restores the backup of your own <code>userChrome.css</code> if there was one, or removes the file.
      li Completely quit the browser (Cmd+Q on macOS) and start it again.
      li Come back here: the status above should change to "Not detected" once the sidebar has loaded.
    .cs-ctrls
      .btn(@click="copyUninstallCommand") {{uninstallMsg || 'Copy uninstall command'}}
    .cs-note.-small By hand: open <code>about:support</code>, press "Open Profile Folder", then delete <code>chrome/userChrome.css</code> (or put your old copy back from <code>userChrome.css.bak</code>) and restart. The setting <code>toolkit.legacyUserProfileCustomizations.stylesheets</code> that the installer turned on is left as it is; it does nothing without the file.
  .cs-note.-small Also turn on "Hide tabs on Horizontal Tab Bar" and "Collapse Tree Style Tab" in the Browser Settings so the native tab bar doesn't run alongside Sidebery.
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Windows } from 'src/services/windows'
import {
  CompanionCss,
  CompanionStatus,
  COMPANION_PROBE_KEY,
  COMPANION_STATUS_KEY,
} from 'src/services/companion-status'

const status = ref<CompanionStatus | null>(null)
const checking = ref(false)
const noResponse = ref(false)
const now = ref(Date.now())
let tick: number | undefined
let checkTimeout: number | undefined
let requestTs = 0

onMounted(async () => {
  try {
    const stored =
      await browser.storage.local.get<Record<string, CompanionStatus>>(COMPANION_STATUS_KEY)
    status.value = stored[COMPANION_STATUS_KEY] ?? null
  } catch {
    // ignore: storage unavailable
  }
  browser.storage.onChanged.addListener(onChanged)
  tick = window.setInterval(() => (now.value = Date.now()), 30000)
})

onBeforeUnmount(() => {
  browser.storage.onChanged.removeListener(onChanged)
  clearInterval(tick)
  clearTimeout(checkTimeout)
})

// Live: the sidebar writes its measurement, the card updates right away
function onChanged(rawChanges: unknown, area: string): void {
  if (area !== 'local') return
  const change = (rawChanges as Record<string, { newValue?: unknown } | undefined>)[
    COMPANION_STATUS_KEY
  ]
  if (!change) return
  status.value = (change.newValue as CompanionStatus | undefined) ?? null
  if (checking.value && status.value && status.value.ts >= requestTs) {
    checking.value = false
    noResponse.value = false
    clearTimeout(checkTimeout)
  }
}

// Ask the sidebar of this window to test itself (it flashes for a moment)
async function checkNow(): Promise<void> {
  if (checking.value) return
  requestTs = Date.now()
  checking.value = true
  noResponse.value = false
  try {
    await browser.storage.local.set({ [COMPANION_PROBE_KEY]: { id: requestTs, winId: Windows.id } })
  } catch {
    checking.value = false
    return
  }
  clearTimeout(checkTimeout)
  checkTimeout = window.setTimeout(() => {
    if (!checking.value) return
    checking.value = false
    noResponse.value = true
  }, 5000)
}

const cssState = computed<CompanionCss | 'checking'>(() => {
  if (checking.value) return 'checking'
  return status.value?.css ?? 'unknown'
})
const cssIcon = computed(() => {
  if (cssState.value === 'active') return '✓'
  if (cssState.value === 'inactive') return '!'
  if (cssState.value === 'checking') return '…'
  return '?'
})

function ago(ts: number): string {
  const sec = Math.max(0, Math.round((now.value - ts) / 1000))
  if (sec < 60) return 'just now'
  if (sec < 3600) return Math.round(sec / 60) + ' min ago'
  if (sec < 86400) return Math.round(sec / 3600) + ' h ago'
  return Math.round(sec / 86400) + ' d ago'
}

const cssDetail = computed(() => {
  const s = status.value
  if (cssState.value === 'checking') return 'Testing the sidebar, it may flash for a moment.'
  if (noResponse.value) {
    return 'No answer from the sidebar. Open it in this window and try again.'
  }
  if (s?.css === 'active') {
    return `Working. Verified ${ago(s.ts)} (${s.mode} mode, ${Math.round(s.width)}px wide).`
  }
  if (s?.css === 'inactive') {
    return `Not detected (${ago(s.ts)}). The sidebar is not using the companion styles. Copy the command, run it in Terminal, then restart the browser.`
  }
  return 'Not verified yet. Open the sidebar in Collapsed or Auto mode, or press Check now.'
})

const overall = computed<'ok' | 'warn' | 'unknown'>(() => {
  if (cssState.value === 'active') return 'ok'
  if (cssState.value === 'inactive') return 'warn'
  return 'unknown'
})
const overallLabel = computed(() =>
  overall.value === 'ok'
    ? 'Complete'
    : overall.value === 'warn'
      ? 'Needs attention'
      : 'Not verified'
)

const statusMsg = ref('')
const scriptMsg = ref('')
const uninstallMsg = ref('')
const showUninstall = ref(false)

async function copyUninstallCommand(): Promise<void> {
  const cmd =
    'curl -fsSL https://raw.githubusercontent.com/rockryda/Better-Sidebery/Master/floorp/uninstall.sh | bash'
  try {
    if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(cmd)
  } catch {
    // ignore: clipboard unavailable
  }
  uninstallMsg.value = '✓ Copied uninstall command!'
  setTimeout(() => {
    uninstallMsg.value = ''
  }, 4000)
}

async function copySetupScript(): Promise<void> {
  const cmd =
    'curl -fsSL https://raw.githubusercontent.com/rockryda/Better-Sidebery/Master/floorp/install.sh | bash'
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(cmd)
    }
  } catch {
    // ignore: clipboard/tab API unavailable
  }
  scriptMsg.value = '✓ Copied terminal command!'
  setTimeout(() => {
    scriptMsg.value = ''
  }, 4000)
}

async function openFloorpDesignSettings(): Promise<void> {
  const url = 'about:hub#/features/design'

  // Pre-copy to clipboard in case browser blocks direct about: navigation
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    }
  } catch {
    // ignore: clipboard/tab API unavailable
  }

  let navigated = false

  // 1. Attempt direct navigation via WebExtensions API
  if (typeof browser !== 'undefined' && browser.tabs) {
    try {
      await browser.tabs.create({ url })
      navigated = true
    } catch {
      // Gecko WebExtension schema blocked about: URL with Illegal URL error
      try {
        await browser.tabs.create({})
      } catch {
        // ignore: clipboard/tab API unavailable
      }
    }
  } else {
    try {
      window.open(url, '_blank')
      navigated = true
    } catch {
      // ignore: clipboard/tab API unavailable
    }
  }

  if (navigated) {
    statusMsg.value = '✓ Opened Floorp Design Settings!'
  } else {
    statusMsg.value = '✓ Copied URL! Press Cmd+V & Enter in the new tab'
  }

  setTimeout(() => {
    statusMsg.value = ''
  }, 4000)
}
</script>
