import * as Utils from 'src/utils'
import { DEFAULT_SETTINGS } from 'src/defaults'
import * as SettingsActions from 'src/services/settings.actions'

export const Settings = {
  state: Utils.cloneObject(DEFAULT_SETTINGS),

  updateWinPrefaceOnPanelSwitch: false,

  ...SettingsActions,

  /**
   * Native (browser) context menus are used when enabled in settings, or when the sidebar
   * is an icon-only rail (<= 68px): custom HTML menus would be clipped by the narrow frame.
   */
  isNativeCtxMenu(): boolean {
    if (this.state.ctxMenuNative) return true
    return typeof document !== 'undefined' && document.documentElement.clientWidth <= 68
  },
}
