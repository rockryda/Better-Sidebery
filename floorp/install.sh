#!/usr/bin/env bash
# ==============================================================================
# Better-Sidebery Browser Companion Installer
# Supports Floorp, Firefox, LibreWolf, and Waterfox
# Can be run locally or via: curl -fsSL https://.../install.sh | bash
# ==============================================================================

set -e

echo "🔍 Detecting browser profiles (Floorp & Firefox)..."

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

if [ ${#TARGET_DIRS[@]} -eq 0 ]; then
  echo "❌ No Floorp or Firefox profiles found on this system."
  exit 1
fi

# Obtain userChrome.css (from local directory or remote GitHub)
TEMP_CSS=""
SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/userChrome.css" ]; then
  SOURCE_CSS="$SCRIPT_DIR/userChrome.css"
else
  echo "🌐 Fetching latest userChrome.css from GitHub..."
  TEMP_CSS="$(mktemp)"
  REMOTE_URL="https://raw.githubusercontent.com/rockryda/Better-Sidebery/main/floorp/userChrome.css"
  if ! curl -fsSL "$REMOTE_URL" -o "$TEMP_CSS"; then
    # Fallback to Split-view branch if main is not yet merged
    REMOTE_URL="https://raw.githubusercontent.com/rockryda/Better-Sidebery/Split-view/floorp/userChrome.css"
    curl -fsSL "$REMOTE_URL" -o "$TEMP_CSS"
  fi
  SOURCE_CSS="$TEMP_CSS"
fi

# Install to all detected profiles
echo "📁 Installing companion styles to browser profiles..."
for PARENT_DIR in "${TARGET_DIRS[@]}"; do
  for P_DIR in "$PARENT_DIR"/*; do
    if [ -d "$P_DIR" ] && [ ! -L "$P_DIR" ]; then
      CHROME_DIR="$P_DIR/chrome"
      mkdir -p "$CHROME_DIR"

      # Backup existing userChrome.css if present
      if [ -f "$CHROME_DIR/userChrome.css" ] && [ ! -f "$CHROME_DIR/userChrome.css.bak" ]; then
        cp "$CHROME_DIR/userChrome.css" "$CHROME_DIR/userChrome.css.bak"
      fi

      cp "$SOURCE_CSS" "$CHROME_DIR/userChrome.css"

      # Ensure userChrome.css is enabled in Firefox
      USER_JS="$P_DIR/user.js"
      PREF_LINE='user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);'
      if [ -f "$USER_JS" ]; then
        grep -q "toolkit.legacyUserProfileCustomizations.stylesheets" "$USER_JS" || echo "$PREF_LINE" >> "$USER_JS"
      else
        echo "$PREF_LINE" > "$USER_JS"
      fi

      echo "  ✅ Installed to: $P_DIR"
    fi
  done
done

# Cleanup temp file if created
[ -n "$TEMP_CSS" ] && rm -f "$TEMP_CSS"

echo ""
echo "🎉 Installation complete!"
echo "🔄 Please completely quit your browser (Cmd + Q) and restart it to apply changes."
