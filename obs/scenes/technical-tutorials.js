import {
  createScene, addSource, addExistingSource, addColorSource, addTextSource,
  addBrowserSource, addMediaSource, addImageSource, addFilter,
  fillCanvas, pipCorner, centered, lowerThird, splitSide, assetsPath,
  colors, hexColors, CANVAS_W, CANVAS_H,
  getDisplayInfo, getFaceTimeCameraUUID,
  lockItem, lockAllItems, addBorder, flipHorizontal,
} from '../utils.js';

// ── Technical Tutorials palette (Catppuccin Mocha — matches dotfiles) ──────
const nichePalette = {
  primary:   colors.blue,     // 0xfffab489 — #89b4fa electric blue
  secondary: colors.surface0, // 0xff3e3331 — #313244 dark surface
  accent:    colors.mauve,    // 0xfff7a6cb — #cba6f7 mauve highlight
  bg:        colors.base,     // 0xff2e1e1e — #1e1e2e deep background
  bgAlt:     colors.surface1, // 0xff514645 — #45475a slightly lighter
  text:      colors.text,     // 0xfff4d6cd — #cdd6f4 readable white
};

const SRC = {
  camera: '[TT] Camera',
  screen: '[TT] Screen Capture',
  mic:    '[TT] Mic',
};

export async function setup(obs) {
  console.log('\n=== Technical Tutorials — YouTube + Instagram ===\n');

  const display = getDisplayInfo();
  const displayUUID = display.uuid;
  const cameraUUID = getFaceTimeCameraUUID();

  // IG vertical math (9:16 letterboxed inside 1920×1080)
  const igScale = CANVAS_H / 1920;           // 0.5625
  const igW = Math.round(1080 * igScale);    // 607px
  const igX = Math.round((CANVAS_W - igW) / 2); // 656px

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 1: Starting Soon
  // ─────────────────────────────────────────────────────────────────────────
  const s1 = '1 [TT] Starting Soon';
  await createScene(obs, s1);

  await addMediaSource(obs, s1, '[TT] BG - Dark', assetsPath('assets/bg-dark.mp4'), true, fillCanvas());

  await addColorSource(obs, s1, '[TT] S1 Bar', nichePalette.secondary,
    CANVAS_W, 160, { positionX: 0, positionY: CANVAS_H / 2 - 80,
      boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: CANVAS_W, boundsHeight: 160 });

  await addColorSource(obs, s1, '[TT] S1 Accent Line Top', nichePalette.primary,
    CANVAS_W, 3, { positionX: 0, positionY: CANVAS_H / 2 - 80 });

  await addColorSource(obs, s1, '[TT] S1 Accent Line Bot', nichePalette.primary,
    CANVAS_W, 3, { positionX: 0, positionY: CANVAS_H / 2 + 77 });

  await addTextSource(obs, s1, '[TT] S1 Title', 'Starting Soon', 64, nichePalette.text,
    { positionX: 0, positionY: CANVAS_H / 2 - 60,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: CANVAS_W, boundsHeight: 80 });

  await addTextSource(obs, s1, '[TT] S1 Brand', 'rckstrbhushan', 32, nichePalette.accent,
    { positionX: 0, positionY: CANVAS_H / 2 + 10,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: CANVAS_W, boundsHeight: 50 });

  await addBrowserSource(obs, s1, '[TT] Countdown',
    `data:text/html,${encodeURIComponent(countdownHTML(hexColors.text, hexColors.blue))}`,
    600, 200, '', {
      positionX: (CANVAS_W - 600) / 2,
      positionY: CANVAS_H / 2 + 80,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: 600, boundsHeight: 200,
    });

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 2: Intro  ← CREATE all primary sources here (cam, screen, mic)
  // ─────────────────────────────────────────────────────────────────────────
  const s2 = '2 [TT] Intro';
  await createScene(obs, s2);

  // Screen capture (created here, reused later — hidden behind full camera)
  await addSource(obs, s2, SRC.screen, 'screen_capture', {
    show_cursor: true, type: 0, hide_obs: true,
    display_uuid: displayUUID,
  }, { ...fillCanvas(), cropTop: display.menuBar });

  // Camera (full canvas — sits on top of screen)
  const camIntro = await addSource(obs, s2, SRC.camera, 'macos-avcapture', {
    device: cameraUUID,
    device_name: 'FaceTime HD Camera',
  }, fillCanvas());
  await flipHorizontal(obs, s2, camIntro.sceneItemId);

  // Chroma key on camera (disabled — user can enable for green screen)
  await addFilter(obs, SRC.camera, 'Chroma Key', 'chroma_key_filter_v2', {
    similarity: 400, smoothness: 75, spill: 100, key_color_type: 'green',
  }, false);

  // Mic source + filters
  await addSource(obs, s2, SRC.mic, 'coreaudio_input_capture', {
    device_id: 'BuiltInMicrophoneDevice',
  }, {});

  await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', {
    method: 'denoiser',
  });

  await addFilter(obs, SRC.mic, 'Noise Gate', 'noise_gate_filter', {
    open_threshold: -26,
    close_threshold: -32,
    attack_time: 25,
    hold_time: 200,
    release_time: 150,
  });

  await addFilter(obs, SRC.mic, 'Compressor', 'compressor_filter', {
    ratio: 6.0,
    threshold: -18.0,
    attack_time: 6,
    release_time: 50,
    output_gain: 4.0,
  });

  // Lower third bar
  await addColorSource(obs, s2, '[TT] Lower BG', nichePalette.secondary,
    CANVAS_W, 80, { positionX: 0, positionY: CANVAS_H - 80,
      boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: CANVAS_W, boundsHeight: 80 });

  await addColorSource(obs, s2, '[TT] Lower Accent', nichePalette.primary,
    6, 80, { positionX: 30, positionY: CANVAS_H - 80 });

  await addTextSource(obs, s2, '[TT] Text - Name', 'rckstrbhushan',
    36, nichePalette.text, { positionX: 50, positionY: CANVAS_H - 68 });

  await addTextSource(obs, s2, '[TT] Text - Topic', 'Technical Tutorials',
    24, nichePalette.accent, { positionX: 50, positionY: CANVAS_H - 35 });

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 3: Screen Share (full screen + PiP camera)
  // ─────────────────────────────────────────────────────────────────────────
  const s3 = '3 [TT] Screen Share';
  await createScene(obs, s3);

  await addExistingSource(obs, s3, SRC.screen,
    { ...fillCanvas(), cropTop: display.menuBar });

  // PiP border then camera
  const pipTx = pipCorner('bottom-right', 0.25);
  await addBorder(obs, s3, '[TT] PiP Border', pipTx, 2, nichePalette.primary);
  const camPip = await addExistingSource(obs, s3, SRC.camera, pipTx);
  await flipHorizontal(obs, s3, camPip);

  await addExistingSource(obs, s3, SRC.mic, {});

  // Subtle lower-left name tag
  await addColorSource(obs, s3, '[TT] S3 Tag BG', nichePalette.secondary,
    340, 40, { positionX: 0, positionY: CANVAS_H - 40 });
  await addTextSource(obs, s3, '[TT] S3 Tag Text', 'rckstrbhushan',
    22, nichePalette.text, { positionX: 10, positionY: CANVAS_H - 36 });

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 4: Full Camera
  // ─────────────────────────────────────────────────────────────────────────
  const s4 = '4 [TT] Full Camera';
  await createScene(obs, s4);

  await addMediaSource(obs, s4, '[TT] BG - Dark 2', assetsPath('assets/bg-dark.mp4'), true, fillCanvas());

  const camFull = await addExistingSource(obs, s4, SRC.camera, fillCanvas());
  await flipHorizontal(obs, s4, camFull);

  await addExistingSource(obs, s4, SRC.mic, {});

  await addColorSource(obs, s4, '[TT] S4 Lower BG', nichePalette.secondary,
    CANVAS_W, 80, { positionX: 0, positionY: CANVAS_H - 80,
      boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: CANVAS_W, boundsHeight: 80 });

  await addColorSource(obs, s4, '[TT] S4 Lower Accent', nichePalette.primary,
    6, 80, { positionX: 30, positionY: CANVAS_H - 80 });

  await addTextSource(obs, s4, '[TT] S4 Text - Name', 'rckstrbhushan',
    36, nichePalette.text, { positionX: 50, positionY: CANVAS_H - 68 });

  await addTextSource(obs, s4, '[TT] S4 Text - Topic', 'Technical Tutorials',
    24, nichePalette.accent, { positionX: 50, positionY: CANVAS_H - 35 });

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 5: BRB / Pause
  // ─────────────────────────────────────────────────────────────────────────
  const s5 = '5 [TT] BRB/Pause';
  await createScene(obs, s5);

  await addMediaSource(obs, s5, '[TT] BG - Warm', assetsPath('assets/bg-warm.mp4'), true, fillCanvas());

  await addColorSource(obs, s5, '[TT] S5 Bar', nichePalette.secondary,
    CANVAS_W, 160, { positionX: 0, positionY: CANVAS_H / 2 - 80,
      boundsType: 'OBS_BOUNDS_STRETCH', boundsWidth: CANVAS_W, boundsHeight: 160 });

  await addColorSource(obs, s5, '[TT] S5 Accent', nichePalette.primary,
    CANVAS_W, 3, { positionX: 0, positionY: CANVAS_H / 2 - 80 });

  await addTextSource(obs, s5, '[TT] S5 Title', 'Be Right Back', 72, nichePalette.text,
    { positionX: 0, positionY: CANVAS_H / 2 - 60,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: CANVAS_W, boundsHeight: 80 });

  await addTextSource(obs, s5, '[TT] S5 Brand', 'rckstrbhushan', 28, nichePalette.accent,
    { positionX: 0, positionY: CANVAS_H / 2 + 20,
      boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: CANVAS_W, boundsHeight: 40 });

  // ─────────────────────────────────────────────────────────────────────────
  // Scene 6: Outro
  // ─────────────────────────────────────────────────────────────────────────
  const s6 = '6 [TT] Outro';
  await createScene(obs, s6);

  await addMediaSource(obs, s6, '[TT] BG - Dark 3', assetsPath('assets/bg-dark.mp4'), true, fillCanvas());

  const camOutro = await addExistingSource(obs, s6, SRC.camera, {
    positionX: CANVAS_W * 0.55,
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: CANVAS_W * 0.45,
    boundsHeight: CANVAS_H,
  });
  await flipHorizontal(obs, s6, camOutro);

  await addExistingSource(obs, s6, SRC.mic, {});

  // CTA panel on the left
  await addColorSource(obs, s6, '[TT] S6 CTA BG', nichePalette.secondary,
    CANVAS_W * 0.5, CANVAS_H * 0.6, {
      positionX: 40,
      positionY: CANVAS_H * 0.2,
      boundsType: 'OBS_BOUNDS_STRETCH',
      boundsWidth: CANVAS_W * 0.5,
      boundsHeight: CANVAS_H * 0.6,
    });

  await addColorSource(obs, s6, '[TT] S6 CTA Accent', nichePalette.primary,
    6, CANVAS_H * 0.6, { positionX: 40, positionY: CANVAS_H * 0.2 });

  await addTextSource(obs, s6, '[TT] S6 Thanks', 'Thanks for watching!',
    48, nichePalette.text, { positionX: 70, positionY: CANVAS_H * 0.25 });

  await addTextSource(obs, s6, '[TT] S6 Subscribe', '↓ Subscribe for more tutorials',
    28, nichePalette.accent, { positionX: 70, positionY: CANVAS_H * 0.38 });

  await addTextSource(obs, s6, '[TT] S6 Handle', '@rckstrbhushan',
    32, nichePalette.primary, { positionX: 70, positionY: CANVAS_H * 0.52 });

  // ─────────────────────────────────────────────────────────────────────────
  // Instagram Scene S1: Camera Vertical
  // ─────────────────────────────────────────────────────────────────────────
  const ig1 = 'S1 [TT-IG] Camera Vertical';
  await createScene(obs, ig1);

  await addColorSource(obs, ig1, '[TT-IG] BG Dark',
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

  // IG name tag at bottom
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

  await addColorSource(obs, ig2, '[TT-IG] S2 BG Dark',
    nichePalette.bg, CANVAS_W, CANVAS_H, fillCanvas());

  await addExistingSource(obs, ig2, SRC.screen, {
    positionX: igX,
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: igW,
    boundsHeight: Math.round(CANVAS_H * 0.65),
    cropTop: display.menuBar,
  });

  // Divider line
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
      positionX: igX,
      positionY: CANVAS_H / 2 - 100,
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
  // Lock all items in all scenes
  // ─────────────────────────────────────────────────────────────────────────
  for (const scene of [s1, s2, s3, s4, s5, s6, ig1, ig2, ig3]) {
    await lockAllItems(obs, scene);
  }

  await obs.call('SetCurrentProgramScene', { sceneName: s2 });
  console.log('\nTechnical Tutorials scenes created successfully!');
}

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
