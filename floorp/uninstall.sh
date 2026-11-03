#!/usr/bin/env bash
# ==============================================================================
# Better-Sidebery Floorp Companion Uninstaller
# Reverts userChrome.css across Floorp profiles
# ==============================================================================

set -e

echo "🔍 Detecting Floorp profile directory..."

FLOORP_DIR=""
case "$(uname -s)" in
  Darwin*)
    FLOORP_DIR="$HOME/Library/Application Support/Floorp"
    ;;
  Linux*)
    FLOORP_DIR="$HOME/.floorp"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    FLOORP_DIR="$APPDATA/Floorp"
    ;;
  *)
    echo "❌ Unsupported operating system: $(uname -s)"
    exit 1
    ;;
esac

if [ ! -d "$FLOORP_DIR" ]; then
  echo "❌ Floorp data directory not found at: $FLOORP_DIR"
  exit 1
fi

echo "📁 Reverting userChrome.css across all Floorp profiles..."
for P_DIR in "$FLOORP_DIR"/Profiles/*; do
  if [ -d "$P_DIR" ]; then
    CHROME_DIR="$P_DIR/chrome"
    if [ -f "$CHROME_DIR/userChrome.css.bak" ]; then
      mv "$CHROME_DIR/userChrome.css.bak" "$CHROME_DIR/userChrome.css"
      echo "  ↩️ Restored original backup in: $CHROME_DIR"
    elif [ -f "$CHROME_DIR/userChrome.css" ]; then
      rm -f "$CHROME_DIR/userChrome.css"
      echo "  🗑️ Removed userChrome.css in: $CHROME_DIR"
    fi
  fi
done

echo "🎉 Revert complete!"
echo "🔄 Please completely quit Floorp (Cmd + Q) and restart it to apply the changes."

