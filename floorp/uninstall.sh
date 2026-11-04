#!/usr/bin/env bash
# ==============================================================================
# Better-Sidebery Browser Companion Uninstaller
# Supports Floorp, Firefox, LibreWolf, and Waterfox
# Can be run locally or via: curl -fsSL https://.../uninstall.sh | bash
# ==============================================================================

set -e

echo "🔍 Detecting browser profiles..."

TARGET_DIRS=()

case "$(uname -s)" in
  Darwin*)
    [ -d "$HOME/Library/Application Support/Floorp/Profiles" ] && TARGET_DIRS+=("$HOME/Library/Application Support/Floorp/Profiles")
    [ -d "$HOME/Library/Application Support/Firefox/Profiles" ] && TARGET_DIRS+=("$HOME/Library/Application Support/Firefox/Profiles")
    [ -d "$HOME/Library/Application Support/Waterfox/Profiles" ] && TARGET_DIRS+=("$HOME/Library/Application Support/Waterfox/Profiles")
    ;;
  Linux*)
    [ -d "$HOME/.floorp" ] && TARGET_DIRS+=("$HOME/.floorp")
    [ -d "$HOME/.mozilla/firefox" ] && TARGET_DIRS+=("$HOME/.mozilla/firefox")
    [ -d "$HOME/.waterfox" ] && TARGET_DIRS+=("$HOME/.waterfox")
    ;;
  MINGW*|MSYS*|CYGWIN*)
    [ -d "$APPDATA/Floorp/Profiles" ] && TARGET_DIRS+=("$APPDATA/Floorp/Profiles")
    [ -d "$APPDATA/Mozilla/Firefox/Profiles" ] && TARGET_DIRS+=("$APPDATA/Mozilla/Firefox/Profiles")
    ;;
  *)
    echo "❌ Unsupported operating system: $(uname -s)"
    exit 1
    ;;
esac

echo "📁 Reverting userChrome.css across all detected browser profiles..."
for PARENT_DIR in "${TARGET_DIRS[@]}"; do
  for P_DIR in "$PARENT_DIR"/*; do
    if [ -d "$P_DIR" ]; then
      CHROME_DIR="$P_DIR/chrome"
      if [ -f "$CHROME_DIR/userChrome.css.bak" ]; then
        mv "$CHROME_DIR/userChrome.css.bak" "$CHROME_DIR/userChrome.css"
        echo "  ↩️ Restored original backup in: $P_DIR"
      elif [ -f "$CHROME_DIR/userChrome.css" ]; then
        rm -f "$CHROME_DIR/userChrome.css"
        echo "  🗑️ Removed userChrome.css in: $P_DIR"
      fi
    fi
  done
done

echo ""
echo "🎉 Revert complete!"
echo "🔄 Please completely quit your browser (Cmd + Q) and restart it to apply changes."
