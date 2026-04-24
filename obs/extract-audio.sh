#!/usr/bin/env bash
# Processes the latest OBS recording session into a clean folder:
#
#   ~/Downloads/recordings/2026-04-24_15-25-17/
#     ├── combined.mov   ← main recording (ProRes, all sources)
#     ├── screen.mkv     ← screen only (auto from Source Record)
#     ├── camera.mkv     ← camera only (auto from Source Record)
#     ├── mic.wav        ← extracted from main Track 2
#     └── system.wav     ← extracted from main Track 3
#
# Usage:
#   bash extract-audio.sh                    # process latest recording
#   bash extract-audio.sh <recording.mov>    # process specific file
#
# Requires: ffmpeg (brew install ffmpeg)

set -euo pipefail

REC_DIR="$HOME/Downloads/recordings"

if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

# Find the recording file
if [ $# -ge 1 ]; then
  INPUT="$1"
else
  # Find the latest .mov or .mkv main recording (not inside a subfolder)
  INPUT=$(find "$REC_DIR" -maxdepth 1 -type f \( -name "*.mov" -o -name "*.mkv" -o -name "*.mp4" \) -print0 | xargs -0 ls -t 2>/dev/null | head -1)
  if [ -z "$INPUT" ]; then
    echo "ERROR: No recordings found in $REC_DIR"
    exit 1
  fi
fi

if [ ! -f "$INPUT" ]; then
  echo "ERROR: File not found: $INPUT"
  exit 1
fi

BASENAME=$(basename "$INPUT")
echo "Processing: $BASENAME"

# Find the matching ISO folder (timestamp in filename matches folder name but with _ instead of space)
# Main file: "2026-04-24 15-25-17.mov" → ISO folder: "2026-04-24_15-25-17"
TIMESTAMP=$(echo "$BASENAME" | sed 's/\.[^.]*$//' | tr ' ' '_')
ISO_DIR="$REC_DIR/$TIMESTAMP"

if [ ! -d "$ISO_DIR" ]; then
  # Try finding a folder that starts with a close timestamp
  ISO_DIR=$(find "$REC_DIR" -maxdepth 1 -type d -name "${TIMESTAMP%??}*" | sort | tail -1)
fi

if [ -z "$ISO_DIR" ] || [ ! -d "$ISO_DIR" ]; then
  mkdir -p "$REC_DIR/$TIMESTAMP"
  ISO_DIR="$REC_DIR/$TIMESTAMP"
fi

echo "Session folder: $(basename "$ISO_DIR")"
echo ""

# Move main recording into session folder
if [ "$(dirname "$INPUT")" != "$ISO_DIR" ]; then
  EXT="${BASENAME##*.}"
  mv "$INPUT" "$ISO_DIR/combined.$EXT"
  echo "  Moved main → combined.$EXT"
  INPUT="$ISO_DIR/combined.$EXT"
fi

# Count audio tracks
TRACK_COUNT=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$INPUT" 2>/dev/null | wc -l | tr -d ' ')
echo "  Audio tracks found: $TRACK_COUNT"

# Extract Track 2 = Mic (audio stream index 1)
if [ "$TRACK_COUNT" -ge 2 ]; then
  echo "  Extracting mic (Track 2) → mic.wav"
  ffmpeg -y -i "$INPUT" -map 0:a:1 -c:a pcm_s16le "$ISO_DIR/mic.wav" 2>/dev/null
else
  echo "  Skipping mic — only $TRACK_COUNT audio track(s)"
fi

# Extract Track 3 = System Audio (audio stream index 2)
if [ "$TRACK_COUNT" -ge 3 ]; then
  echo "  Extracting system audio (Track 3) → system.wav"
  ffmpeg -y -i "$INPUT" -map 0:a:2 -c:a pcm_s16le "$ISO_DIR/system.wav" 2>/dev/null
else
  echo "  Skipping system audio — only $TRACK_COUNT audio track(s)"
fi

echo ""
echo "Done! Session folder:"
echo ""
for f in "$ISO_DIR"/*; do
  SIZE=$(du -h "$f" | cut -f1 | tr -d ' ')
  echo "  $(basename "$f")  ($SIZE)"
done
echo ""
echo "  $ISO_DIR"
