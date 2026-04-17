import {
  createScene, addSource, addExistingSource, addColorSource, addTextSource,
  addBrowserSource, addMediaSource, addImageSource, addFilter,
  fillCanvas, pipCorner, centered, lowerThird, splitSide, assetsPath,
  colors, hexColors, CANVAS_W, CANVAS_H,
  getDisplayInfo, getFaceTimeCameraUUID,
  lockItem, lockAllItems, addBorder, flipHorizontal,
} from '../utils.js';

// ── Technical Tutorials palette (Catppuccin Mocha) ──────────────────────────
const nichePalette = {
  primary:   colors.blue,
  secondary: colors.surface0,
  accent:    colors.mauve,
  bg:        colors.base,
  bgAlt:     colors.surface1,
  text:      colors.text,
};

const SRC = {
  camera: '[TT] Camera',
  screen: '[TT] Screen Capture',
  mic:    '[TT] Mic',
};

// Helper: file:// URL for a scene HTML asset
function sceneURL(filename) {
  return `file://${assetsPath(`assets/scenes/${filename}`)}`;
}

export async function setup(obs) {
  console.log('\n=== Technical Tutorials — YouTube + Instagram ===\n');

  const display = getDisplayInfo();
  const displayUUID = display.uuid;
  const cameraUUID = getFaceTimeCameraUUID();

  // IG vertical math
  const igScale = CANVAS_H / 1920;
  const igW = Math.round(1080 * igScale);
  const igX = Math.round((CANVAS_W - igW) / 2);

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 1: Starting Soon
  // Full-canvas HTML background — no camera
  // ─────────────────────────────────────────────────────────────────────────
  const s1 = '1 [TT] Starting Soon';
  await createScene(obs, s1);

  await addBrowserSource(obs, s1, '[TT] Starting Soon BG',
    sceneURL('starting-soon.html'),
    CANVAS_W, CANVAS_H, '', fillCanvas());

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 2: Intro  ← CREATE all primary sources here (cam, screen, mic)
  // Full camera + transparent HTML overlay (lower third)
  // ─────────────────────────────────────────────────────────────────────────
  const s2 = '2 [TT] Intro';
  await createScene(obs, s2);

  // Screen capture (created here for reuse; sits behind camera in this scene)
  await addSource(obs, s2, SRC.screen, 'screen_capture', {
    show_cursor: true, type: 0, hide_obs: true,
    display_uuid: displayUUID,
    show_empty_names: false,
    show_hidden_windows: false,
  }, { ...fillCanvas(), cropTop: display.menuBar });

  // Camera — full canvas, request highest resolution
  const camIntro = await addSource(obs, s2, SRC.camera, 'macos-avcapture', {
    device: cameraUUID,
    device_name: 'FaceTime HD Camera',
    use_preset: false,
    width: 1920,
    height: 1080,
  }, fillCanvas());
  await flipHorizontal(obs, s2, camIntro.sceneItemId);

  // Chroma key (disabled — enable for green screen)
  await addFilter(obs, SRC.camera, 'Chroma Key', 'chroma_key_filter_v2', {
    similarity: 400, smoothness: 75, spill: 100, key_color_type: 'green',
  }, false);

  // Mic + audio filters
  await addSource(obs, s2, SRC.mic, 'coreaudio_input_capture', {
    device_id: 'BuiltInMicrophoneDevice',
  }, {});
  await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', { method: 'denoiser' });
  await addFilter(obs, SRC.mic, 'Noise Gate', 'noise_gate_filter', {
    open_threshold: -26, close_threshold: -32,
    attack_time: 25, hold_time: 200, release_time: 150,
  });
  await addFilter(obs, SRC.mic, 'Compressor', 'compressor_filter', {
    ratio: 6.0, threshold: -18.0, attack_time: 6, release_time: 50, output_gain: 4.0,
  });

  // HTML overlay — transparent, slides-up lower third with name/tags
  await addBrowserSource(obs, s2, '[TT] Intro Overlay',
    sceneURL('intro-overlay.html'),
    CANVAS_W, CANVAS_H, '', fillCanvas());

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 3: Screen Share
  // Full screen + PiP camera (top-right) + transparent ticker overlay
  // ─────────────────────────────────────────────────────────────────────────
  const s3 = '3 [TT] Screen Share';
  await createScene(obs, s3);

  await addExistingSource(obs, s3, SRC.screen,
    { ...fillCanvas(), cropTop: display.menuBar });

  // PiP camera — top-right to avoid overlapping ticker at bottom
  const pipTx = pipCorner('top-right', 0.22);
  await addBorder(obs, s3, '[TT] PiP Border', pipTx, 2, nichePalette.primary);
  const camPip = await addExistingSource(obs, s3, SRC.camera, pipTx);
  await flipHorizontal(obs, s3, camPip);

  await addExistingSource(obs, s3, SRC.mic, {});

  // HTML overlay — ticker + watermark
  await addBrowserSource(obs, s3, '[TT] Screen Overlay',
    sceneURL('screen-share-overlay.html'),
    CANVAS_W, CANVAS_H, '', fillCanvas());

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 4: Full Camera
  // Full camera + transparent HTML overlay (border frame + lower third)
  // ─────────────────────────────────────────────────────────────────────────
  const s4 = '4 [TT] Full Camera';
  await createScene(obs, s4);

  const camFull = await addExistingSource(obs, s4, SRC.camera, fillCanvas());
  await flipHorizontal(obs, s4, camFull);

  await addExistingSource(obs, s4, SRC.mic, {});

  // HTML overlay — animated border + vignette + lower third
  await addBrowserSource(obs, s4, '[TT] Camera Overlay',
    sceneURL('full-camera-overlay.html'),
    CANVAS_W, CANVAS_H, '', fillCanvas());

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 5: BRB / Pause
  // Full-canvas HTML background — no camera
  // ─────────────────────────────────────────────────────────────────────────
  const s5 = '5 [TT] BRB/Pause';
  await createScene(obs, s5);

  await addBrowserSource(obs, s5, '[TT] BRB BG',
    sceneURL('brb.html'),
    CANVAS_W, CANVAS_H, '', fillCanvas());

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 6: Outro
  // Camera right 45% + HTML overlay (left CTA panel transparent right)
  // ─────────────────────────────────────────────────────────────────────────
  const s6 = '6 [TT] Outro';
  await createScene(obs, s6);

  // Camera on right 45%
  const camOutro = await addExistingSource(obs, s6, SRC.camera, {
    positionX: Math.round(CANVAS_W * 0.55),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: Math.round(CANVAS_W * 0.45),
    boundsHeight: CANVAS_H,
  });
  await flipHorizontal(obs, s6, camOutro);

  await addExistingSource(obs, s6, SRC.mic, {});

  // HTML overlay — CTA on left 55%, transparent on right (camera shows through)
  await addBrowserSource(obs, s6, '[TT] Outro Overlay',
    sceneURL('outro.html'),
    CANVAS_W, CANVAS_H, '', fillCanvas());

  // ─────────────────────────────────────────────────────────────────────────
  // Instagram Scene S1: Camera Vertical
  // ─────────────────────────────────────────────────────────────────────────
  const ig1 = 'S1 [TT-IG] Camera Vertical';
  await createScene(obs, ig1);

  await addColorSource(obs, ig1, '[TT-IG] BG',
    nichePalette.bg, CANVAS_W, CANVAS_H, fillCanvas());

  await addColorSource(obs, ig1, '[TT-IG] Frame',
    nichePalette.bgAlt, igW, CANVAS_H, { positionX: igX, positionY: 0 });

  const camIg1 = await addExistingSource(obs, ig1, SRC.camera, {
    positionX: igX, positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER', boundsWidth: igW, boundsHeight: CANVAS_H,
    cropLeft: 200, cropRight: 200,
  });
  await flipHorizontal(obs, ig1, camIg1);

  await addExistingSource(obs, ig1, SRC.mic, {});

  // IG name tag
  await addColorSource(obs, ig1, '[TT-IG] S1 Name BG', nichePalette.secondary,
    igW, 50, { positionX: igX, positionY: CANVAS_H - 50 });
  await addColorSource(obs, ig1, '[TT-IG] S1 Name Accent', nichePalette.primary,
    4, 50, { positionX: igX + 16, positionY: CANVAS_H - 50 });
  await addTextSource(obs, ig1, '[TT-IG] S1 Name', 'rckstrbhushan',
    24, nichePalette.text, { positionX: igX + 30, positionY: CANVAS_H - 42 });

  // ─────────────────────────────────────────────────────────────────────────
  // Instagram Scene S2: Screen Vertical (screen top 65%, cam bottom 35%)
  // ─────────────────────────────────────────────────────────────────────────
  const ig2 = 'S2 [TT-IG] Screen Vertical';
  await createScene(obs, ig2);

  await addColorSource(obs, ig2, '[TT-IG] S2 BG',
    nichePalette.bg, CANVAS_W, CANVAS_H, fillCanvas());

  await addExistingSource(obs, ig2, SRC.screen, {
    positionX: igX,
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: igW,
    boundsHeight: Math.round(CANVAS_H * 0.65),
    cropTop: display.menuBar,
  });

  await addColorSource(obs, ig2, '[TT-IG] S2 Divider', nichePalette.primary,
    igW, 3, { positionX: igX, positionY: Math.round(CANVAS_H * 0.65) });

  const camIg2 = await addExistingSource(obs, ig2, SRC.camera, {
    positionX: igX,
    positionY: Math.round(CANVAS_H * 0.65) + 3,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: igW,
    boundsHeight: Math.round(CANVAS_H * 0.35) - 3,
    cropLeft: 200, cropRight: 200,
  });
  await flipHorizontal(obs, ig2, camIg2);

  await addExistingSource(obs, ig2, SRC.mic, {});

  // ─────────────────────────────────────────────────────────────────────────
  // Instagram Scene S3: Starting Vertical
  // ─────────────────────────────────────────────────────────────────────────
  const ig3 = 'S3 [TT-IG] Starting Vertical';
  await createScene(obs, ig3);

  await addColorSource(obs, ig3, '[TT-IG] S3 BG',
    nichePalette.bg, CANVAS_W, CANVAS_H, fillCanvas());

  await addColorSource(obs, ig3, '[TT-IG] S3 Frame',
    nichePalette.bgAlt, igW, CANVAS_H, { positionX: igX, positionY: 0 });

  await addColorSource(obs, ig3, '[TT-IG] S3 Center Bar', nichePalette.secondary,
    igW, 200, {
      positionX: igX, positionY: CANVAS_H / 2 - 100,
      boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: igW, boundsHeight: 200,
    });

  await addColorSource(obs, ig3, '[TT-IG] S3 Accent Top', nichePalette.primary,
    igW, 3, { positionX: igX, positionY: CANVAS_H / 2 - 100 });

  await addColorSource(obs, ig3, '[TT-IG] S3 Accent Bot', nichePalette.primary,
    igW, 3, { positionX: igX, positionY: CANVAS_H / 2 + 97 });

  await addTextSource(obs, ig3, '[TT-IG] S3 Title', 'Starting Soon',
    40, nichePalette.text, {
      positionX: igX + 10, positionY: CANVAS_H / 2 - 90,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: igW - 20, boundsHeight: 60,
    });

  await addTextSource(obs, ig3, '[TT-IG] S3 Brand', 'rckstrbhushan',
    26, nichePalette.accent, {
      positionX: igX + 10, positionY: CANVAS_H / 2 - 20,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: igW - 20, boundsHeight: 40,
    });

  await addBrowserSource(obs, ig3, '[TT-IG] Countdown',
    `data:text/html,${encodeURIComponent(countdownHTML(hexColors.text, hexColors.blue))}`,
    400, 160, '', {
      positionX: igX + (igW - 400) / 2,
      positionY: CANVAS_H / 2 + 30,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: 400, boundsHeight: 160,
    });

  // ─────────────────────────────────────────────────────────────────────────
  // Lock all items
  // ─────────────────────────────────────────────────────────────────────────
  for (const scene of [s1, s2, s3, s4, s5, s6, ig1, ig2, ig3]) {
    await lockAllItems(obs, scene);
  }

  // Scene transitions are applied in Phase 2 (JSON patching) via setup.js
  // so that the Stinger transition can be injected into the OBS config file.

  await obs.call('SetCurrentProgramScene', { sceneName: s2 });
  console.log('\nTechnical Tutorials scenes created successfully!');
}

function countdownHTML(textColor, glowColor) {
  return `<!DOCTYPE html><html><head><style>
    * { margin:0; padding:0; }
    body { background:transparent; display:flex; justify-content:center; align-items:center; height:100vh; font-family:'SF Pro Display',-apple-system,sans-serif; }
    .timer { font-size:80px; font-weight:200; color:${textColor}; letter-spacing:8px; text-shadow:0 0 40px ${glowColor}40; }
  </style></head><body>
  <div class="timer" id="t">00:30</div>
  <script>
    let s=30;
    setInterval(()=>{ if(s<=0)s=30; else s--;
      document.getElementById('t').textContent='00:'+String(s).padStart(2,'0');
    },1000);
  </script></body></html>`;
}
