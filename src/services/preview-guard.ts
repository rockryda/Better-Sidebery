/**
 * Preview mode: the settings page shows the real sidebar inside an <iframe> (`?preview=1`).
 * That second sidebar instance must be read-only, otherwise it would change the user's
 * browser (tabs, storage, window title, sidebar panel...) or answer messages meant for the
 * real sidebar. This module is imported first by the sidebar entry point and, in preview
 * mode, replaces every write-like WebExtension API with a no-op before anything else runs.
 */

function readParams(): URLSearchParams {
  try {
    return new URLSearchParams(location.search)
  } catch {
    return new URLSearchParams()
  }
}

export const IS_PREVIEW = readParams().has('preview')

export function previewMode(): 'auto' | 'full' | 'collapsed' {
  const m = readParams().get('mode')
  return m === 'full' || m === 'collapsed' ? m : 'auto'
}

/** Namespace path -> methods that change something outside of this page */
const BLOCKED: Record<string, string[]> = {
  'storage.local': ['set', 'remove', 'clear'],
  'storage.sync': ['set', 'remove', 'clear'],
  tabs: [
    'update',
    'remove',
    'create',
    'move',
    'duplicate',
    'discard',
    'reload',
    'hide',
    'show',
    'executeScript',
    'insertCSS',
    'removeCSS',
    'warmup',
    'moveInSuccession',
    'setZoom',
    'setZoomSettings',
    'goBack',
    'goForward',
    'toggleReaderMode',
    'saveAsPDF',
    'print',
    'sendMessage',
    'captureTab',
    'captureVisibleTab',
  ],
  windows: ['create', 'update', 'remove'],
  sessions: [
    'setTabValue',
    'removeTabValue',
    'setWindowValue',
    'removeWindowValue',
    'restore',
    'forgetClosedTab',
    'forgetClosedWindow',
  ],
  sidebarAction: ['setPanel', 'setTitle', 'setIcon', 'open', 'close', 'toggle'],
  menus: ['create', 'update', 'remove', 'removeAll', 'overrideContext'],
  contextMenus: ['create', 'update', 'remove', 'removeAll', 'overrideContext'],
  contextualIdentities: ['create', 'update', 'remove'],
  bookmarks: ['create', 'update', 'remove', 'removeTree', 'move'],
  history: ['deleteUrl', 'deleteRange', 'deleteAll', 'addUrl'],
  downloads: ['download', 'removeFile', 'erase', 'cancel', 'pause', 'resume', 'open', 'show'],
  notifications: ['create', 'update', 'clear'],
  commands: ['update', 'reset'],
  browserAction: ['setTitle', 'setIcon', 'setBadgeText', 'setBadgeBackgroundColor'],
  runtime: ['sendMessage', 'reload', 'openOptionsPage'],
}

function noop(): Promise<undefined> {
  return Promise.resolve(undefined)
}

function install(): void {
  const api: any = (globalThis as any).browser
  if (!api) return

  for (const [path, names] of Object.entries(BLOCKED)) {
    let obj: any = api
    for (const key of path.split('.')) obj = obj?.[key]
    if (!obj) continue
    for (const name of names) {
      try {
        if (typeof obj[name] === 'function') {
          Object.defineProperty(obj, name, { value: noop, configurable: true, writable: true })
        }
      } catch {
        // ignore: this API cannot be replaced
      }
    }
  }

  // No connection to the background script: the preview must not register as a sidebar
  try {
    const noEvent = { addListener: () => undefined, removeListener: () => undefined }
    Object.defineProperty(api.runtime, 'connect', {
      value: (info?: { name?: string }) => ({
        name: info?.name ?? '',
        postMessage: () => undefined,
        disconnect: () => undefined,
        onMessage: noEvent,
        onDisconnect: noEvent,
      }),
      configurable: true,
      writable: true,
    })
  } catch {
    // ignore
  }

  // localStorage is shared with the real sidebar (same origin): never write to it
  try {
    Storage.prototype.setItem = (): void => undefined
    Storage.prototype.removeItem = (): void => undefined
    Storage.prototype.clear = (): void => undefined
  } catch {
    // ignore
  }
}

if (IS_PREVIEW) install()
