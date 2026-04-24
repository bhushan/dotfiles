#!/usr/bin/env bash
# Creates a Multi-Output Device that sends audio to both speakers and BlackHole.
# This lets OBS capture system audio via BlackHole while you still hear it through speakers.
#
# Run once after installing BlackHole and rebooting:
#   bash obs/setup-multi-output.sh
#
# Then set "Multi-Output Device" as your system output in System Settings > Sound.

set -euo pipefail

# Check BlackHole is available
if ! system_profiler SPAudioDataType 2>/dev/null | grep -q "BlackHole"; then
  echo "ERROR: BlackHole not detected. Reboot first, then try again."
  echo "Install: brew install --cask blackhole-2ch"
  exit 1
fi

echo "Creating Multi-Output Device (Speakers + BlackHole 2ch)..."
echo ""
echo "Opening Audio MIDI Setup — please do the following:"
echo ""
echo "  1. Click the '+' button at bottom-left → Create Multi-Output Device"
echo "  2. Check both:"
echo "     ✓ MacBook Pro Speakers (or your external speakers)"
echo "     ✓ BlackHole 2ch"
echo "  3. Make sure 'MacBook Pro Speakers' is the MASTER device (top of list)"
echo "  4. Close Audio MIDI Setup"
echo ""
echo "  5. Go to System Settings → Sound → Output"
echo "     Select 'Multi-Output Device' as your output"
echo ""

open "/System/Applications/Utilities/Audio MIDI Setup.app"

echo "After setting this up, run the OBS setup to wire everything:"
echo "  cd obs && node setup.js --profile technical-tutorials"
