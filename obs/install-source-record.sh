#!/usr/bin/env bash
# Installs the obs-source-record plugin by exeldro
# This plugin adds a "Source Record" filter that records individual sources separately.
# https://github.com/exeldro/obs-source-record

set -euo pipefail

PLUGIN_NAME="obs-source-record"
PLUGIN_DIR="$HOME/Library/Application Support/obs-studio/plugins"
INSTALL_DIR="$PLUGIN_DIR/$PLUGIN_NAME"

# Get latest release download URL for macOS
RELEASE_URL=$(curl -sL "https://api.github.com/repos/exeldro/$PLUGIN_NAME/releases/latest" \
  | grep "browser_download_url" \
  | grep -i "macos\|osx\|apple\|universal" \
  | grep -v ".sha256" \
  | head -1 \
  | cut -d '"' -f 4)

if [ -z "$RELEASE_URL" ]; then
  # Fallback: try any .pkg or .zip asset
  RELEASE_URL=$(curl -sL "https://api.github.com/repos/exeldro/$PLUGIN_NAME/releases/latest" \
    | grep "browser_download_url" \
    | grep -E "\.(pkg|zip)" \
    | grep -v ".sha256" \
    | head -1 \
    | cut -d '"' -f 4)
fi

if [ -z "$RELEASE_URL" ]; then
  echo "ERROR: Could not find macOS release for $PLUGIN_NAME"
  echo "Visit https://github.com/exeldro/$PLUGIN_NAME/releases and install manually."
  echo "Extract to: $INSTALL_DIR"
  exit 1
fi

echo "Downloading $PLUGIN_NAME from:"
echo "  $RELEASE_URL"

TMPDIR=$(mktemp -d)
FILENAME=$(basename "$RELEASE_URL")
curl -sL -o "$TMPDIR/$FILENAME" "$RELEASE_URL"

mkdir -p "$PLUGIN_DIR"

if [[ "$FILENAME" == *.pkg ]]; then
  echo "Installing via .pkg installer..."
  sudo installer -pkg "$TMPDIR/$FILENAME" -target /
  # pkg may install to /Library — symlink or copy to user plugins dir
  if [ -d "/Library/Application Support/obs-studio/plugins/$PLUGIN_NAME" ] && [ ! -d "$INSTALL_DIR" ]; then
    ln -s "/Library/Application Support/obs-studio/plugins/$PLUGIN_NAME" "$INSTALL_DIR"
  fi
elif [[ "$FILENAME" == *.zip ]]; then
  echo "Extracting .zip..."
  unzip -qo "$TMPDIR/$FILENAME" -d "$TMPDIR/extracted"
  # Look for the plugin .so or .dylib inside the extracted files
  if [ -d "$TMPDIR/extracted/$PLUGIN_NAME" ]; then
    cp -r "$TMPDIR/extracted/$PLUGIN_NAME" "$INSTALL_DIR"
  elif [ -d "$TMPDIR/extracted/obs-plugins" ]; then
    # Some releases use obs-plugins/lib structure
    mkdir -p "$INSTALL_DIR/bin"
    cp -r "$TMPDIR/extracted/obs-plugins/"* "$INSTALL_DIR/bin/"
    [ -d "$TMPDIR/extracted/data" ] && cp -r "$TMPDIR/extracted/data" "$INSTALL_DIR/"
  else
    # Just dump everything into the plugin dir
    mkdir -p "$INSTALL_DIR"
    cp -r "$TMPDIR/extracted/"* "$INSTALL_DIR/"
  fi
else
  echo "Unknown file format: $FILENAME"
  echo "Manual install required — extract to: $INSTALL_DIR"
  rm -rf "$TMPDIR"
  exit 1
fi

rm -rf "$TMPDIR"

echo ""
echo "$PLUGIN_NAME installed successfully!"
echo "Restart OBS to load the plugin."
echo "Plugin location: $INSTALL_DIR"
