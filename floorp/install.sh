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

# Find default or release profile directory
PROFILE_PATH=$(awk -F= '/^Path=/{print $2}' "$PROFILES_INI" | grep -E "default|release" | head -n 1)

# Fallback: take the first profile found if no default/release string matches
if [ -z "$PROFILE_PATH" ]; then
  PROFILE_PATH=$(awk -F= '/^Path=/{print $2}' "$PROFILES_INI" | head -n 1)
fi

TARGET_DIR="$FLOORP_DIR/$PROFILE_PATH"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ Could not resolve target profile directory: $TARGET_DIR"
  exit 1
fi

echo "📁 Found Floorp profile: $TARGET_DIR"

CHROME_DIR="$TARGET_DIR/chrome"
mkdir -p "$CHROME_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_CSS="$SCRIPT_DIR/userChrome.css"

if [ ! -f "$SOURCE_CSS" ]; then
  echo "❌ Source userChrome.css not found at: $SOURCE_CSS"
  exit 1
fi

# If userChrome.css already exists, create a backup
if [ -f "$CHROME_DIR/userChrome.css" ]; then
  echo "💾 Backing up existing userChrome.css to userChrome.css.bak..."
  cp "$CHROME_DIR/userChrome.css" "$CHROME_DIR/userChrome.css.bak"
fi

cp "$SOURCE_CSS" "$CHROME_DIR/userChrome.css"

echo "✅ Successfully installed userChrome.css to $CHROME_DIR/userChrome.css!"
echo "🔄 Please restart Floorp to apply the changes."

