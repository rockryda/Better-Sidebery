#!/usr/bin/env bash
# ==============================================================================
# Better-Sidebery Floorp Companion Installer
# Automatically locates your Floorp profile and installs userChrome.css
# ==============================================================================

set -e

echo "🔍 Detecting Floorp profile directory..."

# Determine OS and Floorp application data directory
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
  echo "Please ensure Floorp has been launched at least once."
  exit 1
fi

PROFILES_INI="$FLOORP_DIR/profiles.ini"
if [ ! -f "$PROFILES_INI" ]; then
  echo "❌ profiles.ini not found in $FLOORP_DIR"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_CSS="$SCRIPT_DIR/userChrome.css"

if [ ! -f "$SOURCE_CSS" ]; then
  echo "❌ Source userChrome.css not found at: $SOURCE_CSS"
  exit 1
fi

# Install to ALL profiles in Floorp Profiles directory to ensure active profile is updated
echo "📁 Installing userChrome.css to all Floorp profiles..."
for P_DIR in "$FLOORP_DIR"/Profiles/*; do
  if [ -d "$P_DIR" ]; then
    CHROME_DIR="$P_DIR/chrome"
    mkdir -p "$CHROME_DIR"
    if [ -f "$CHROME_DIR/userChrome.css" ]; then
      cp "$CHROME_DIR/userChrome.css" "$CHROME_DIR/userChrome.css.bak"
    fi
    cp "$SOURCE_CSS" "$CHROME_DIR/userChrome.css"
    echo "  ✅ Installed to: $CHROME_DIR/userChrome.css"
  fi
done

echo "🎉 Installation complete!"
echo "🔄 Please completely quit Floorp (Cmd + Q) and restart it to apply the changes."

