---
description: Research a content niche and generate a fully wired OBS scene collection with scenes, hotkeys, mic/camera/audio setup tailored to top creators in that field, then run the setup.
allowed-tools: WebSearch, Read, Write, Edit, Bash, Glob, Grep
argument-hint: [niche] [platform]
model: sonnet
---

Set up OBS for: $ARGUMENTS

## Phase 0 — Gather Information from User

If $ARGUMENTS is empty or vague, ask these questions one at a time and wait for each answer before continuing. If $ARGUMENTS already clearly specifies niche and platform, confirm them and skip to Phase 1.

**Ask the user:**

1. **"What is your content niche or field?"**
   Examples: tech tutorials, gaming, fitness coaching, cooking, music production, travel vlogging, personal finance
   Wait for answer → $NICHE

2. **"What is your primary streaming/content platform?"**
   Options: YouTube, Twitch, Instagram, TikTok, LinkedIn, multiple
   Wait for answer → $PLATFORM

3. **"What is your channel or brand name? (used for lower thirds and overlays)"**
   Wait for answer → $BRAND (default: "Your Name" if skipped)

4. **"Any specific brand colors? (hex codes or descriptions like 'dark purple and gold', 'minimal white and blue', or 'none / let me decide')"**
   Wait for answer → $COLOR_HINT (can be empty — research will choose)

5. **"Any specific scene types you know you need? (e.g. 'I do Q&As', 'I interview guests', 'I need a countdown timer', or 'no')"**
   Wait for answer → $EXTRA_SCENES (can be empty)

After all answers are collected:
- Derive $SLUG: lowercase $NICHE words joined with hyphens (e.g. "tech tutorial" → "tech-tutorial", "gaming" → "gaming")
- Derive $PREFIX: first 2 uppercase letters of each niche word, capped at 4 chars total (e.g. "gaming" → "GM", "tech tutorial" → "TT", "fitness coaching" → "FC")
- Check if `obs/scenes/$SLUG.js` already exists. If yes, ask: "A profile named `$SLUG` already exists. Overwrite it, or pick a different name?"
- Confirm before proceeding: "I'll create an OBS setup for **$NICHE** on **$PLATFORM** with brand name **$BRAND**. Starting research now..."

## Phase 1 — Research the Niche

Run these 4 web searches in sequence:

1. `top $NICHE streamers creators OBS scene setup $PLATFORM 2024 2025`
2. `$NICHE content creator stream overlay color palette brand design`
3. `$NICHE OBS scenes starting soon BRB ending overlay layout`
4. `$NICHE streaming microphone audio noise gate compressor settings`

From the results, extract and document:

**Color palette** (5–7 colors):
- If $COLOR_HINT was provided, incorporate it as the primary color; derive the rest from research
- Convert each to OBS ABGR format: `0xff` + BB + GG + RR (byte-reverse the RGB bytes)
- Example: CSS `#7B2FBE` → R=7B G=2F B=BE → reversed: BE 2F 7B → `0xffbe2f7b`
- Example: CSS `#89b4fa` (blue) → `0xffab14b8` → wait: R=89 G=b4 B=fa → reversed: fa b4 89 → `0xfffab489`

**Scene types** — what scenes do top creators in this niche actually use?
- Gaming/Twitch: Gameplay Full, Gameplay + Cam PiP, Just Chatting, BRB Overlay, Raid Screen, Ending
- Fitness/coaching: Full Body Cam, Tutorial Screen, Q&A/Chat, BRB, Ending + CTA
- Tech tutorial: Screen Share, Screen + Cam, Demo Close-up, BRB, Ending
- Cooking/lifestyle: Overhead Shot, Face Cam, Step-by-step Split, BRB, Ending
- Add any $EXTRA_SCENES the user requested

**Layout conventions**: PiP placement, screen split ratios, lower-third style, overlay density

**Transition**: Gaming = Fade 150ms (or Cut); Tutorial/Fitness/Cooking = Fade 300ms

**BGM volume**: Gaming = −15dB; Fitness = −18dB; Tutorial = −22dB; Default = −20dB

**Mic gate thresholds**:
- Gaming (mechanical keyboard): open_threshold −30 / close_threshold −38
- Fitness (clean environment): open_threshold −22 / close_threshold −28
- Tutorial/default: open_threshold −26 / close_threshold −32

## Phase 2 — Generate Scene File

Write the file to `/Users/rckstrbhushan/code/dotfiles/obs/scenes/$SLUG.js`.

### Module structure

Every scene file is an ESM module. Start with this exact import block:

```js
import {
  createScene, addSource, addExistingSource, addColorSource, addTextSource,
  addBrowserSource, addMediaSource, addImageSource, addFilter,
  fillCanvas, pipCorner, centered, lowerThird, splitSide, assetsPath,
  colors, hexColors, CANVAS_W, CANVAS_H,
  getDisplayInfo, getFaceTimeCameraUUID,
  lockItem, lockAllItems, addBorder, flipHorizontal,
} from '../utils.js';
```

Then define the niche palette and source name namespace:

```js
// ── $NICHE palette (ABGR: 0xAABBGGRR) ──────────────────────────
const nichePalette = {
  primary:   0xff______,   // <color from research, name it>
  secondary: 0xff______,
  accent:    0xff______,
  bg:        0xff______,
  bgAlt:     0xff______,
  text:      0xffcdd6f4,   // always readable white-ish text
};

const SRC = {
  camera: '[$PREFIX] Camera',
  screen: '[$PREFIX] Screen Capture',
  mic:    '[$PREFIX] Mic',
};

export async function setup(obs) {
  console.log('\n=== $NICHE — $PLATFORM ===\n');

  const display = getDisplayInfo();
  const displayUUID = display.uuid;
  const cameraUUID = getFaceTimeCameraUUID();

  // IG vertical math (use in all Instagram scenes):
  const igScale = CANVAS_H / 1920;          // 0.5625
  const igW = Math.round(1080 * igScale);   // 607
  const igX = Math.round((CANVAS_W - igW) / 2); // 656

  // ... scenes below ...

  // Lock ALL items in ALL scenes at the end:
  for (const s of [scene1, scene2, /* ... */]) {
    await lockAllItems(obs, s);
  }

  await obs.call('SetCurrentProgramScene', { sceneName: scene2 });
  console.log('\n$NICHE scenes created successfully!');
}
```

### Atomic patterns to compose scenes from

Use these exact patterns — copy and adapt them for each scene:

**1. Full-canvas background video:**
```js
await addMediaSource(obs, sceneName, '[$PREFIX] BG - Name',
  assetsPath('assets/bg-dark.mp4'), true, fillCanvas());
```
Available asset files: `assets/bg-dark.mp4`, `assets/bg-green.mp4`, `assets/bg-red.mp4`, `assets/bg-warm.mp4`

**2. Full-canvas color background:**
```js
await addColorSource(obs, sceneName, '[$PREFIX] BG Color',
  nichePalette.bg, CANVAS_W, CANVAS_H, fillCanvas());
```

**3. Camera source (create once in first scene that uses it):**
```js
const cam = await addSource(obs, sceneName, SRC.camera, 'macos-avcapture', {
  device: cameraUUID,
  device_name: 'FaceTime HD Camera',
}, fillCanvas());
await flipHorizontal(obs, sceneName, cam.sceneItemId);
```
After creation, reuse with: `const camId = await addExistingSource(obs, sceneName, SRC.camera, transform);`

**4. Screen capture (create once):**
```js
await addSource(obs, sceneName, SRC.screen, 'screen_capture', {
  show_cursor: true, type: 0, hide_obs: true,
  display_uuid: displayUUID,
}, { ...fillCanvas(), cropTop: display.menuBar });
```

**5. Mic source + filters (create once, always in second scene):**
```js
await addSource(obs, sceneName, SRC.mic, 'coreaudio_input_capture', {
  device_id: 'BuiltInMicrophoneDevice',
}, {});
await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', {
  method: 'denoiser',
});
await addFilter(obs, SRC.mic, 'Noise Gate', 'noise_gate_filter', {
  open_threshold: -26,    // use researched values
  close_threshold: -32,
});
// Chroma key on camera (disabled, user can enable for green screen):
await addFilter(obs, SRC.camera, 'Chroma Key', 'chroma_key_filter_v2', {
  similarity: 400, smoothness: 75, spill: 100, key_color_type: 'green',
}, false);
```

**6. Lower third bar (bottom of screen):**
```js
await addColorSource(obs, sceneName, '[$PREFIX] Lower Third BG',
  nichePalette.secondary, CANVAS_W, 80, {
    positionX: 0, positionY: CANVAS_H - 80,
    boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: CANVAS_W, boundsHeight: 80,
  });
await addColorSource(obs, sceneName, '[$PREFIX] Lower Third Accent',
  nichePalette.primary, 6, 80, { positionX: 30, positionY: CANVAS_H - 80 });
await addTextSource(obs, sceneName, '[$PREFIX] Text - Name',
  '$BRAND', 36, nichePalette.text, { positionX: 50, positionY: CANVAS_H - 68 });
await addTextSource(obs, sceneName, '[$PREFIX] Text - Topic',
  '$NICHE on $PLATFORM', 24, nichePalette.accent, { positionX: 50, positionY: CANVAS_H - 35 });
```

**7. PiP (picture-in-picture) camera — bottom-right corner:**
```js
const pipTransform = pipCorner('bottom-right', 0.25);
await addBorder(obs, sceneName, '[$PREFIX] PiP Border', pipTransform, 2, nichePalette.primary);
const pipId = await addExistingSource(obs, sceneName, SRC.camera, pipTransform);
await flipHorizontal(obs, sceneName, pipId);
```

**8. Side-by-side split (screen left 60%, camera right 40%):**
```js
await addExistingSource(obs, sceneName, SRC.screen, { ...splitSide('left', 0.6), cropTop: display.menuBar });
await addColorSource(obs, sceneName, '[$PREFIX] Divider', nichePalette.primary, 4, CANVAS_H, {
  positionX: CANVAS_W * 0.6 - 2, positionY: 0,
});
const camId = await addExistingSource(obs, sceneName, SRC.camera, splitSide('right', 0.6));
await flipHorizontal(obs, sceneName, camId);
```

**9. Countdown timer browser source (for Starting Soon):**
```js
await addBrowserSource(obs, sceneName, '[$PREFIX] Countdown Timer',
  `data:text/html,${encodeURIComponent(countdownHTML(hexColors.text, hexColors.blue))}`,
  600, 200, '', {
    positionX: (CANVAS_W - 600) / 2,
    positionY: (CANVAS_H - 200) / 2 + 140,
    boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: 600, boundsHeight: 200,
  });
```
Add this function at the bottom of the file:
```js
function countdownHTML(textColor, glowColor) {
  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; }
    body { background:transparent; display:flex; justify-content:center; align-items:center; height:100vh; font-family:'SF Pro Display',-apple-system,sans-serif; }
    .timer { font-size:80px; font-weight:200; color:${textColor}; letter-spacing:8px; text-shadow:0 0 40px ${glowColor}40; }
  </style></head><body>
  <div class="timer" id="t">05:00</div>
  <script>
    let s=300;
    setInterval(()=>{ if(s<=0)return; s--;
      document.getElementById('t').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
    },1000);
  </script></body></html>`;
}
```

**10. Instagram vertical camera scene:**
```js
await addColorSource(obs, sceneName, '[$PREFIX-IG] BG Dark',
  nichePalette.bg, CANVAS_W, CANVAS_H, fillCanvas());
await addColorSource(obs, sceneName, '[$PREFIX-IG] Frame',
  nichePalette.bgAlt, igW, CANVAS_H, { positionX: igX, positionY: 0 });
const camIg = await addExistingSource(obs, sceneName, SRC.camera, {
  positionX: igX, positionY: 0,
  boundsType: 'OBS_BOUNDS_SCALE_OUTER', boundsWidth: igW, boundsHeight: CANVAS_H,
  cropLeft: 200, cropRight: 200,
});
await flipHorizontal(obs, sceneName, camIg);
await addExistingSource(obs, sceneName, SRC.mic, {});
await addTextSource(obs, sceneName, '[$PREFIX-IG] Text - Name',
  '$BRAND', 28, nichePalette.text, { positionX: igX + 20, positionY: CANVAS_H - 80 });
```

**11. Instagram vertical screen split (cam top 35%, screen bottom 65%):**
```js
const cam8 = await addExistingSource(obs, sceneName, SRC.camera, {
  positionX: igX, positionY: 0,
  boundsType: 'OBS_BOUNDS_SCALE_OUTER', boundsWidth: igW, boundsHeight: Math.round(CANVAS_H * 0.35),
  cropLeft: 200, cropRight: 200,
});
await flipHorizontal(obs, sceneName, cam8);
await addExistingSource(obs, sceneName, SRC.screen, {
  positionX: igX, positionY: Math.round(CANVAS_H * 0.35),
  boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: igW, boundsHeight: Math.round(CANVAS_H * 0.65),
});
```

### Scene count requirements

- **Minimum 6 YouTube/landscape scenes**: Starting Soon, Main, Content, Variation, BRB, Ending. Add niche-specific extras from research.
- **Minimum 3 Instagram vertical scenes**: Camera Vertical, Content Vertical, Starting Vertical. Add CTA vertical if product-oriented.
- **Scene naming**: `'N [$PREFIX] Description'` for YouTube (N=1,2,3…), `'SN [$PREFIX-IG] Description'` for Instagram (N=1,2,3…)
- **Source creation order**: Create SRC.camera, SRC.mic (with filters) and SRC.screen in scene2 (main scene). Reuse with `addExistingSource()` everywhere else.
- **Always** call `await lockAllItems(obs, sceneName)` for every scene at the end (in the for-loop).

### Colors from utils.js (available via `colors.*` and `hexColors.*`)

`colors` object has: `base, mantle, crust, surface0, surface1, surface2, text, subtext0, subtext1, rosewater, flamingo, pink, mauve, red, maroon, peach, yellow, green, teal, sky, sapphire, blue, lavender`

Use `nichePalette` for niche-specific colors, fall back to `colors.*` for standard elements.

## Phase 3 — Wire Dynamic Loading in setup.js

Check if dynamic loading is already installed:

```bash
grep -c "await import(" /Users/rckstrbhushan/code/dotfiles/obs/setup.js
```

If output is `0`, apply this edit to `obs/setup.js`. Find this block:

```js
      const setupFn = PROFILES[profileName];
      if (!setupFn) {
        console.error(`Unknown profile: ${profileName}`);
        console.error(`Available: ${Object.keys(PROFILES).join(', ')}`);
        process.exit(1);
      }
```

Replace with:

```js
      let setupFn = PROFILES[profileName];
      if (!setupFn) {
        try {
          const profilePath = new URL(`./scenes/${profileName}.js`, import.meta.url).href;
          const mod = await import(profilePath);
          if (typeof mod.setup !== 'function') throw new Error(`scenes/${profileName}.js has no setup() export`);
          setupFn = mod.setup;
          console.log(`Loaded generated profile: "${profileName}"`);
        } catch (e) {
          console.error(`Unknown profile: "${profileName}"`);
          console.error(`Built-in: ${Object.keys(PROFILES).join(', ')}`);
          console.error(`Tried: ./scenes/${profileName}.js — ${e.message}`);
          process.exit(1);
        }
      }
```

If output was > 0, skip this edit — dynamic loading is already wired.

## Phase 4 — Add Hotkeys to SCENE_HOTKEYS

Read `obs/setup.js` and find the `SCENE_HOTKEYS` object. Count existing entries to determine which modifier tier to use:
- 0 existing entries → use no modifier (NUM1–9)
- 1 profile already → use Shift+NUM (shift: true)
- 2+ profiles → use Ctrl+NUM (ctrl: true), then Ctrl+Shift+NUM for IG scenes

Append entries matching your scene names:
```js
'1 [$PREFIX] Starting Soon':            { key: 'OBS_KEY_NUM1', ctrl: true },
'2 [$PREFIX] <Main Scene Name>':        { key: 'OBS_KEY_NUM2', ctrl: true },
// ... one entry per YouTube scene
'S1 [$PREFIX-IG] Camera Vertical':      { key: 'OBS_KEY_NUM1', ctrl: true, shift: true },
'S2 [$PREFIX-IG] Content Vertical':     { key: 'OBS_KEY_NUM2', ctrl: true, shift: true },
'S3 [$PREFIX-IG] Starting Vertical':    { key: 'OBS_KEY_NUM3', ctrl: true, shift: true },
```

Tell the user the assigned hotkeys after setup completes.

## Phase 5 — Run the Setup

Ensure OBS is running:
```bash
pgrep -x OBS > /dev/null 2>&1 || (open -a OBS && sleep 6)
```

Run setup:
```bash
cd /Users/rckstrbhushan/code/dotfiles/obs && node setup.js --profile $SLUG
```

If it exits non-zero, show the full stderr output and stop.

## Phase 6 — Verify & Print Summary

Print:
```
╔══════════════════════════════════════════════╗
║   /obs-setup complete!                       ║
╠══════════════════════════════════════════════╣
║  Niche:    <$NICHE>                          ║
║  Platform: <$PLATFORM>                       ║
║  Brand:    <$BRAND>                          ║
║  Profile:  <$SLUG>                           ║
║  File:     obs/scenes/<$SLUG>.js             ║
╚══════════════════════════════════════════════╝
```

Then list each scene with its hotkey assignment, and the re-run command:
```
  cd obs && node setup.js --profile $SLUG
```

## Error Handling

| Scenario | Action |
|----------|--------|
| WebSocket refused | Print: "Enable OBS WebSocket: Tools → WebSocket Server Settings → port 4455, no auth required" |
| Scene file write fails | Surface path + error, do not proceed to Phase 5 |
| `node setup.js` exits non-zero | Show full stderr; note OBS may need manual restart |
| Slug collides with existing file | Ask: overwrite or use a different name? |
| WebSearch returns no useful results | Fall back to Catppuccin Mocha palette + 6 generic scenes, warn user |
