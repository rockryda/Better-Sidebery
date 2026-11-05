import { IS_PREVIEW } from 'src/services/preview-guard'
import * as Utils from 'src/utils'
import { createApp, reactive, shallowReactive } from 'vue'
import { InstanceType, SettingsState } from 'src/types'
import * as IPC from 'src/services/ipc'
import * as Logs from 'src/services/logs'
import * as Popups from 'src/services/popups'
import * as Favicons from 'src/services/favicons.fg'
import * as Preview from 'src/services/tabs.preview'
import { Settings } from 'src/services/settings'
import { Sidebar } from 'src/services/sidebar'
import { Windows } from 'src/services/windows'
import { Containers } from 'src/services/containers'
import { Keybindings } from 'src/services/keybindings'
import { Styles } from 'src/services/styles'
import { Bookmarks } from 'src/services/bookmarks'
import { Menu } from 'src/services/menu'
import { Tabs } from 'src/services/tabs.fg'
import { Store } from 'src/services/storage'
import { DnD } from 'src/services/drag-and-drop'
import { Permissions } from 'src/services/permissions'
import { Notifications } from 'src/services/notifications'
import { History } from 'src/services/history'
import { Search } from 'src/services/search'
import { Info } from 'src/services/info'
import SidebarRoot from './sidebar.vue'
import { Snapshots } from 'src/services/snapshots'
import { CollapseModeService } from 'src/services/collapse-mode'
import { initSidebarResize } from 'src/services/sidebar-resize'
import { initCompanionCheck } from 'src/services/companion-check'
import { updateWebReqHandlers } from 'src/services/web-req.fg'
import { initUpgrading, showUpgradingScreen } from 'src/services/upgrading'

// Settings page preview: draft settings arrive here instead of from storage
let previewReady = false
let pendingPreviewSettings: SettingsState | null = null
if (IS_PREVIEW) {
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.data?.type !== 'bs-preview-settings') return
    const settings = e.data.settings as SettingsState | undefined
    if (!settings) return
    if (previewReady) Settings.updateSettingsFg(settings)
    else pendingPreviewSettings = settings
  })
}

async function main(): Promise<void> {
  Info.setInstanceType(InstanceType.sidebar)
  IPC.setInstanceType(InstanceType.sidebar)
  // Preview inside the settings page: read-only, no connection to other instances
  if (IS_PREVIEW) IPC.setPassive(true)
  Logs.setInstanceType(InstanceType.sidebar)
  CollapseModeService.init()

  const ts = performance.now()
  Logs.info('Init start')

  IPC.registerActions({
    reloadTab: Tabs.reloadTab,
    queryTab: Tabs.queryTab,
    getTabs: Tabs.getTabs,
    detachTabs: Tabs.detachTabs,
    getTabsTreeData: Tabs.getTabsTreeData,
    moveTabsToThisWin: Tabs.moveToThisWin,
    openTabs: Tabs.open,
    handleReopening: Tabs.handleReopening,
    getActivePanelConfig: Sidebar.getActivePanelConfig,
    stopDrag: DnD.reset,
    getGroupInfo: Tabs.getGroupInfo,
    loadFavicons: Favicons.loadFavicons,
    setFavicon: Favicons.set,
    onOutsideSearchInput: Search.onOutsideSearchInput,
    onOutsideSearchNext: Search.next,
    onOutsideSearchPrev: Search.prev,
    onOutsideSearchEnter: Search.enter,
    onOutsideSearchSelectAll: Search.selectAll,
    onOutsideSearchMenu: Search.menu,
    onOutsideSearchExit: Search.onOutsideSearchExit,
    onOutsideSearchBookmarks: Search.bookmarks,
    onOutsideSearchHistory: Search.history,
    notifyAboutNewSnapshot: Snapshots.notifyAboutNewSnapshot,
    notifyAboutWrongProxyAuthData: Notifications.notifyAboutWrongProxyAuthData,
    notify: Notifications.notify,
    isDropEventConsumed: DnD.isDropEventConsumed,
    storageChanged: Store.storageChangeListener,
    connectTo: IPC.connectTo,
    getSearchQuery: Search.getSearchQuery,
    updWindowPreface: Windows.updWindowPreface,
  })

  await Promise.all([
    Windows.loadWindowInfo(),
    Settings.loadSettings(),
    Containers.load(),
    Permissions.loadPermissions(),
    Info.loadVersionInfo(),
  ])

  IPC.setWinId(Windows.id)
  Logs.setWinId(Windows.id)

  IPC.setupGlobalMessageListener()
  IPC.setupConnectionListener()

  // Reactivate data for vue
  Containers.reactive = shallowReactive(Containers.reactive)
  Sidebar.initSidebar(reactive)
  Popups.initPopups(reactive)
  Windows.reactive = reactive(Windows.reactive)
  Favicons.initFavicons(reactive)
  Bookmarks.reactive = reactive(Bookmarks.reactive)
  Tabs.initTabs(reactive)
  DnD.reactive = reactive(DnD.reactive)
  Permissions.reactive = reactive(Permissions.reactive)
  Notifications.reactive = reactive(Notifications.reactive)
  History.initHistory(reactive)
  Search.reactive = reactive(Search.reactive)
  Styles.reactive = reactive(Styles.reactive)
  initUpgrading(reactive)

  Sidebar.updateFontSize()

  const app = createApp(SidebarRoot)
  app.mount('#root_container')

  if (Info.isMajorUpgrade()) {
    return showUpgradingScreen()
  }

  Settings.setupSettingsChangeListener()
  Permissions.setupListeners()
  Windows.setupWindowsListeners()
  Containers.setupContainersListeners()
  Sidebar.setupListeners()

  if (Settings.state.sidebarCSS) Styles.loadCustomSidebarCSS()
  Styles.initColorScheme()

  await Sidebar.loadPanels()

  const actPanel = Sidebar.panelsById[Sidebar.activePanelId]
  const initBookmarks = !Settings.state.loadBookmarksOnDemand || Utils.isBookmarksPanel(actPanel)
  const initHistory = !Settings.state.loadHistoryOnDemand || Utils.isHistoryPanel(actPanel)

  IPC.connectTo(InstanceType.bg)

  if (Sidebar.hasTabs) await Tabs.load()
  else await Tabs.loadInShadowMode()
  if (Sidebar.hasBookmarks && initBookmarks) Bookmarks.load()
  if (Sidebar.hasHistory && initHistory) History.load()

  if (!IS_PREVIEW) updateWebReqHandlers()

  Menu.loadCtxMenu()
  if (!IS_PREVIEW) Menu.setupListeners()

  Styles.setupListeners()

  Favicons.loadFavicons()

  Keybindings.loadKeybindings()
  if (!IS_PREVIEW) Keybindings.setupListeners()

  Search.init()
  if (!IS_PREVIEW) {
    Windows.updWindowPreface()
    initSidebarResize()
    initCompanionCheck()
  }

  if (Settings.state.updateSidebarTitle) Sidebar.updateSidebarTitle(0)

  window.getSideberyState = () => {
    // prettier-ignore
    return {
      IPC, Info, Settings, Containers, Sidebar, Windows, Favicons,
      Bookmarks, Tabs, DnD, Permissions, Notifications, History,
      Search, Styles, Menu, Snapshots,
    }
  }

  if (Settings.state.previewTabs) Preview.resetMode()

  Logs.info(`Init end: ${performance.now() - ts}ms`)

  if (IS_PREVIEW) {
    previewReady = true
    if (pendingPreviewSettings) Settings.updateSettingsFg(pendingPreviewSettings)
  }
}
main()
