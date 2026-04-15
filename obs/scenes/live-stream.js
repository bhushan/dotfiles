import {
  createScene, addSource, addExistingSource, addColorSource, addTextSource,
  addBrowserSource, addMediaSource, addImageSource, addFilter,
  fillCanvas, pipCorner, centered, lowerThird, splitSide, assetsPath,
  colors, hexColors, CANVAS_W, CANVAS_H,
  getDisplayInfo, getFaceTimeCameraUUID,
  lockItem, lockAllItems, addBorder, flipHorizontal,
} from '../utils.js';

// ─────────────────────────────────────────────────────────────
// Shared source names (created once, reused across scenes)
// ─────────────────────────────────────────────────────────────
const SRC = {
  camera: '[LS] Camera',
  screen: '[LS] Screen Capture',
  mic: '[LS] Mic',
  desktop: '[LS] Desktop Audio',
};

export async function setup(obs) {
  console.log('\n=== Live Stream - Tech ===\n');

  const display = getDisplayInfo();
  const displayUUID = display.uuid;
  const cameraUUID = getFaceTimeCameraUUID();

  // ───────── Create shared sources in a temp scene first ─────────
  // We'll create sources in the first scene that uses them, then reuse

  // All scenes get locked after creation to prevent accidental moves

  // ───────── 1. 1 [LS] Starting Soon ─────────
  const scene1 = '1 [LS] Starting Soon';
  await createScene(obs, scene1);

  // Background video loop
  await addMediaSource(obs, scene1, '[LS] BG - Starting',
    assetsPath('assets/bg-dark.mp4'), true, fillCanvas());

  // "Starting Soon" title text
  await addTextSource(obs, scene1, '[LS] Text - Starting Soon',
    'STARTING SOON', 96, colors.blue, centered(800, 120));

  // Countdown timer (browser source — customize URL later)
  await addBrowserSource(obs, scene1, '[LS] Countdown Timer',
    `data:text/html,${encodeURIComponent(countdownHTML())}`,
    600, 200, '', {
      positionX: (CANVAS_W - 600) / 2,
      positionY: (CANVAS_H - 200) / 2 + 140,
      boundsType: 'OBS_BOUNDS_SCALE_INNER',
      boundsWidth: 600,
      boundsHeight: 200,
    });


  // ───────── 2. 2 [LS] Main Camera ─────────
  const scene2 = '2 [LS] Main Camera';
  await createScene(obs, scene2);

  // Webcam — FaceTime HD Camera (mirrored)
  const cam = await addSource(obs, scene2, SRC.camera, 'macos-avcapture', {
    device: cameraUUID,
    device_name: 'FaceTime HD Camera',
  }, fillCanvas());
  await flipHorizontal(obs, scene2, cam.sceneItemId);

  // Lower third bar background
  await addColorSource(obs, scene2, '[LS] Lower Third BG',
    colors.surface0, CANVAS_W, 80, {
      positionX: 0,
      positionY: CANVAS_H - 80,
      boundsType: 'OBS_BOUNDS_STRETCH',
      boundsWidth: CANVAS_W,
      boundsHeight: 80,
    });

  // Lower third — accent stripe
  await addColorSource(obs, scene2, '[LS] Lower Third Accent',
    colors.blue, 6, 80, {
      positionX: 30,
      positionY: CANVAS_H - 80,
    });

  // Lower third — name text
  await addTextSource(obs, scene2, '[LS] Text - Name',
    'Bhushan', 36, colors.text, {
      positionX: 50,
      positionY: CANVAS_H - 68,
    });

  // Lower third — topic text
  await addTextSource(obs, scene2, '[LS] Text - Topic',
    'Tech Live Stream', 24, colors.lavender, {
      positionX: 50,
      positionY: CANVAS_H - 35,
    });


  // Chroma key — disabled by default, enable in OBS when using a green screen
  await addFilter(obs, SRC.camera, 'Chroma Key', 'chroma_key_filter_v2', {
    similarity: 400, smoothness: 75, spill: 100, key_color_type: 'green',
  }, false);

  // Mic — MacBook Pro built-in microphone
  await addSource(obs, scene2, SRC.mic, 'coreaudio_input_capture', {
    device_id: 'BuiltInMicrophoneDevice',
  }, {});
  // Mic filters
  await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', {
    method: 'denoiser',
  });
  await addFilter(obs, SRC.mic, 'Noise Gate', 'noise_gate_filter', {
    open_threshold: -26,
    close_threshold: -32,
  });

  // Create desktop audio source (shared)
  await addSource(obs, scene2, SRC.desktop, 'coreaudio_output_capture', {}, {});

  // Lock all Main Camera items
  await lockAllItems(obs, scene2);

  // ───────── 3. 3 [LS] Screen Share ─────────
  const scene3 = '3 [LS] Screen Share';
  await createScene(obs, scene3);

  // Screen capture — external display, crop menu bar
  await addSource(obs, scene3, SRC.screen, 'screen_capture', {
    show_cursor: true,
    type: 0,
    hide_obs: true,
    display_uuid: displayUUID,
  }, {
    ...fillCanvas(),
    cropTop: display.menuBar,
  });

  // Webcam PiP — bottom right with border
  const pipTransform = pipCorner('bottom-right', 0.25);
  await addBorder(obs, scene3, '[LS] PiP Border', pipTransform, 2, colors.blue);
  const pipId = await addExistingSource(obs, scene3, SRC.camera, pipTransform);
  await flipHorizontal(obs, scene3, pipId);
  await lockItem(obs, scene3, pipId);
  await addExistingSource(obs, scene3, SRC.mic, {});

  // Lower third bar
  await addExistingSource(obs, scene3, '[LS] Lower Third BG', {
    positionX: 0,
    positionY: CANVAS_H - 60,
    boundsType: 'OBS_BOUNDS_STRETCH',
    boundsWidth: CANVAS_W,
    boundsHeight: 60,
  });

  // ───────── 4. 4 [LS] Screen + Camera Split ─────────
  const scene4 = '4 [LS] Screen + Camera Split';
  await createScene(obs, scene4);

  // Screen on left (60%) — with title bar crop
  const leftSplit = splitSide('left', 0.6);
  await addExistingSource(obs, scene4, SRC.screen, {
    ...leftSplit,
    cropTop: display.menuBar,
  });

  // Divider line
  await addColorSource(obs, scene4, '[LS] Divider',
    colors.blue, 4, CANVAS_H, {
      positionX: CANVAS_W * 0.6 - 2,
      positionY: 0,
    });

  // Camera on right (40%)
  const cam4 = await addExistingSource(obs, scene4, SRC.camera, splitSide('right', 0.6));
  await flipHorizontal(obs, scene4, cam4);
  await addExistingSource(obs, scene4, SRC.mic, {});

  // Lock all items in split view
  await lockAllItems(obs, scene4);

  // ───────── 5. 5 [LS] BRB ─────────
  const scene5 = '5 [LS] BRB';
  await createScene(obs, scene5);

  await addMediaSource(obs, scene5, '[LS] BG - BRB',
    assetsPath('assets/bg-green.mp4'), true, fillCanvas());

  await addTextSource(obs, scene5, '[LS] Text - BRB',
    'BE RIGHT BACK', 96, colors.green, centered(900, 120));

  await addTextSource(obs, scene5, '[LS] Text - BRB Sub',
    'Stream will resume shortly...', 32, colors.text, {
      positionX: (CANVAS_W - 600) / 2,
      positionY: (CANVAS_H + 120) / 2 + 20,
    });

  // ───────── 6. 6 [LS] Ending ─────────
  const scene6 = '6 [LS] Ending';
  await createScene(obs, scene6);

  await addMediaSource(obs, scene6, '[LS] BG - Ending',
    assetsPath('assets/bg-red.mp4'), true, fillCanvas());

  await addTextSource(obs, scene6, '[LS] Text - Thanks',
    'THANKS FOR WATCHING', 72, colors.rosewater, centered(900, 100));

  await addTextSource(obs, scene6, '[LS] Text - Subscribe',
    'Like & Subscribe for more tech content', 32, colors.text, {
      positionX: (CANVAS_W - 700) / 2,
      positionY: (CANVAS_H + 100) / 2 + 30,
    });

  // ─────────────────────────────────────────────────
  // Instagram Vertical Scenes (9:16)
  // These use a 1080x1920 "virtual canvas" within the 1920x1080 canvas
  // by placing sources in a centered vertical strip
  // ─────────────────────────────────────────────────
  console.log('\n  --- Instagram Vertical Scenes ---');

  // The vertical "canvas" is centered at x=420, width=1080, height=1920 scaled to 1080
  // We scale 1920 height into 1080 canvas height, so scale = 1080/1920 = 0.5625
  // Effective area: 1080 * 0.5625 = 607.5 wide, 1080 tall, centered at (656, 0)
  const igScale = CANVAS_H / 1920; // 0.5625
  const igW = 1080 * igScale; // 607.5
  const igX = (CANVAS_W - igW) / 2; // 656.25

  // ───────── 7. 7 [LS-IG] Camera Vertical ─────────
  const scene7 = '7 [LS-IG] Camera Vertical';
  await createScene(obs, scene7);

  // Dark background
  await addColorSource(obs, scene7, '[LS-IG] BG Dark',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Vertical frame indicator
  await addColorSource(obs, scene7, '[LS-IG] Frame',
    colors.surface0, Math.round(igW), CANVAS_H, {
      positionX: Math.round(igX),
      positionY: 0,
    });

  // Camera — cropped and scaled to fill vertical strip
  const cam7 = await addExistingSource(obs, scene7, SRC.camera, {
    positionX: Math.round(igX),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: Math.round(igW),
    boundsHeight: CANVAS_H,
    cropLeft: 200,
    cropRight: 200,
  });
  await flipHorizontal(obs, scene7, cam7);
  await addExistingSource(obs, scene7, SRC.mic, {});

  // Lower third text
  await addTextSource(obs, scene7, '[LS-IG] Text - Name',
    'Bhushan', 28, colors.text, {
      positionX: Math.round(igX) + 20,
      positionY: CANVAS_H - 80,
    });

  // ───────── 8. 8 [LS-IG] Screen Vertical ─────────
  const scene8 = '8 [LS-IG] Screen Vertical';
  await createScene(obs, scene8);

  await addColorSource(obs, scene8, '[LS-IG] BG Dark 2',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Camera on top third of vertical strip
  const cam8 = await addExistingSource(obs, scene8, SRC.camera, {
    positionX: Math.round(igX),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: Math.round(igW),
    boundsHeight: Math.round(CANVAS_H * 0.35),
    cropLeft: 200,
    cropRight: 200,
  });
  await flipHorizontal(obs, scene8, cam8);

  // Screen capture below camera
  await addExistingSource(obs, scene8, SRC.screen, {
    positionX: Math.round(igX),
    positionY: Math.round(CANVAS_H * 0.35),
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: Math.round(igW),
    boundsHeight: Math.round(CANVAS_H * 0.65),
  });
  await addExistingSource(obs, scene8, SRC.mic, {});

  // ───────── 9. 9 [LS-IG] Starting Soon Vertical ─────────
  const scene9 = '9 [LS-IG] Starting Soon Vertical';
  await createScene(obs, scene9);

  await addColorSource(obs, scene9, '[LS-IG] BG Dark 3',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  await addExistingSource(obs, scene9, '[LS] BG - Starting', {
    positionX: Math.round(igX),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: Math.round(igW),
    boundsHeight: CANVAS_H,
  });

  await addTextSource(obs, scene9, '[LS-IG] Text - Starting',
    'STARTING\nSOON', 64, colors.blue, {
      positionX: Math.round(igX) + 50,
      positionY: CANVAS_H / 2 - 80,
    });

  // Lock all items in all scenes
  for (const s of [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9]) {
    await lockAllItems(obs, s);
  }

  // Set first scene as active
  await obs.call('SetCurrentProgramScene', { sceneName: scene2 });

  console.log('\nLive Stream scenes created successfully!');
}

// ─────────────────────────────────────────────────
// Countdown timer HTML for browser source
// ─────────────────────────────────────────────────
function countdownHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; }
  body {
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'SF Pro Display', -apple-system, sans-serif;
  }
  .timer {
    font-size: 80px;
    font-weight: 200;
    color: ${hexColors.text};
    letter-spacing: 8px;
    text-shadow: 0 0 40px ${hexColors.blue}40;
  }
</style>
</head>
<body>
<div class="timer" id="t">05:00</div>
<script>
  let s = 300;
  setInterval(() => {
    if (s <= 0) return;
    s--;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    document.getElementById('t').textContent =
      String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }, 1000);
</script>
</body>
</html>`;
}
