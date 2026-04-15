import {
  createScene, addSource, addExistingSource, addColorSource, addTextSource,
  addBrowserSource, addMediaSource, addImageSource, addFilter,
  fillCanvas, pipCorner, centered, lowerThird, splitSide, assetsPath,
  colors, hexColors, CANVAS_W, CANVAS_H,
  getDisplayInfo, getFaceTimeCameraUUID,
  lockItem, lockAllItems, addBorder, flipHorizontal,
} from '../utils.js';

const SRC = {
  camera: '[AS] Camera',
  screen: '[AS] Screen Capture',
  mic: '[AS] Mic',
};

export async function setup(obs) {
  console.log('\n=== Alfred Scholar - Product ===\n');

  const display = getDisplayInfo();
  const displayUUID = display.uuid;
  const cameraUUID = getFaceTimeCameraUUID();

  // ───────── 1. S1 [AS] Product Demo ─────────
  const scene1 = 'S1 [AS] Product Demo';
  await createScene(obs, scene1);

  // Background
  await addColorSource(obs, scene1, '[AS] BG Base',
    colors.crust, CANVAS_W, CANVAS_H, fillCanvas());

  // Border behind screen capture
  const screenTransform = {
    positionX: 40,
    positionY: 40,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: CANVAS_W - 80,
    boundsHeight: CANVAS_H - 120,
  };
  await addBorder(obs, scene1, '[AS] Screen Border', screenTransform, 2, colors.blue);

  // Screen capture — external display, crop menu bar
  await addSource(obs, scene1, SRC.screen, 'screen_capture', {
    show_cursor: true,
    type: 0,
    hide_obs: true,
    display_uuid: displayUUID,
  }, {
    ...screenTransform,
    cropTop: display.menuBar,
  });

  // Top accent bar
  await addColorSource(obs, scene1, '[AS] Top Bar',
    colors.blue, CANVAS_W, 4, {
      positionX: 0,
      positionY: 0,
    });

  // Bottom info bar
  await addColorSource(obs, scene1, '[AS] Bottom Bar',
    colors.surface0, CANVAS_W, 60, {
      positionX: 0,
      positionY: CANVAS_H - 60,
      boundsType: 'OBS_BOUNDS_STRETCH',
      boundsWidth: CANVAS_W,
      boundsHeight: 60,
    });

  // Product name in bottom bar
  await addTextSource(obs, scene1, '[AS] Text - Product Name',
    'Alfred Scholar', 28, colors.blue, {
      positionX: 40,
      positionY: CANVAS_H - 48,
    });

  // Feature label in bottom bar
  await addTextSource(obs, scene1, '[AS] Text - Feature Label',
    'Product Demo', 20, colors.text, {
      positionX: CANVAS_W - 250,
      positionY: CANVAS_H - 42,
    });

  // ───────── 2. S2 [AS] Talking Head ─────────
  const scene2 = 'S2 [AS] Talking Head';
  await createScene(obs, scene2);

  // Gradient background video
  await addImageSource(obs, scene2, '[AS] BG - Talking',
    assetsPath('assets/bg-warm.png'), fillCanvas());

  // Camera — FaceTime HD Camera
  const cam = await addSource(obs, scene2, SRC.camera, 'macos-avcapture', {
    device: cameraUUID,
    device_name: 'FaceTime HD Camera',
  }, {
    positionX: CANVAS_W / 2 - 400,
    positionY: 60,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: 800,
    boundsHeight: 800,
  });
  await flipHorizontal(obs, scene2, cam.sceneItemId);

  // Camera mask overlay for rounded/styled webcam
  await addImageSource(obs, scene2, '[AS] Camera Mask',
    assetsPath('assets/camera-mask-circle.png'), {
      positionX: CANVAS_W / 2 - 400,
      positionY: 60,
      boundsType: 'OBS_BOUNDS_SCALE_INNER',
      boundsWidth: 800,
      boundsHeight: 800,
    });

  // Name + title below camera
  await addTextSource(obs, scene2, '[AS] Text - Speaker',
    'Bhushan', 36, colors.text, {
      positionX: CANVAS_W / 2 - 100,
      positionY: CANVAS_H - 120,
    });

  await addTextSource(obs, scene2, '[AS] Text - Title',
    'Alfred Scholar', 24, colors.blue, {
      positionX: CANVAS_W / 2 - 100,
      positionY: CANVAS_H - 75,
    });

  // Chroma key — disabled by default, enable in OBS when using a green screen
  await addFilter(obs, SRC.camera, 'Chroma Key', 'chroma_key_filter_v2', {
    similarity: 400, smoothness: 75, spill: 100, key_color_type: 'green',
  }, false);

  // Mic — MacBook Pro built-in microphone
  await addSource(obs, scene2, SRC.mic, 'coreaudio_input_capture', {
    device_id: 'BuiltInMicrophoneDevice',
  }, {});
  await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', {
    method: 'denoiser',
  });
  await addFilter(obs, SRC.mic, 'Noise Gate', 'noise_gate_filter', {
    open_threshold: -26,
    close_threshold: -32,
  });

  // ───────── 3. S3 [AS] Feature Highlight ─────────
  const scene3 = 'S3 [AS] Feature Highlight';
  await createScene(obs, scene3);

  await addColorSource(obs, scene3, '[AS] BG Feature',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Screen capture zoomed in (reuse existing) — crop title bar
  await addExistingSource(obs, scene3, SRC.screen, {
    positionX: -200,
    positionY: -150,
    scaleX: 1.3,
    scaleY: 1.3,
    cropTop: display.menuBar,
  });

  // Callout annotation box
  await addColorSource(obs, scene3, '[AS] Callout Box',
    colors.mauve, 400, 80, {
      positionX: CANVAS_W - 450,
      positionY: 50,
    });

  await addTextSource(obs, scene3, '[AS] Text - Callout',
    'Key Feature', 28, colors.crust, {
      positionX: CANVAS_W - 430,
      positionY: 72,
    });

  // Small webcam PiP with border
  const asPipTransform = pipCorner('bottom-left', 0.2);
  await addBorder(obs, scene3, '[AS] PiP Border', asPipTransform, 2, colors.blue);
  const cam3 = await addExistingSource(obs, scene3, SRC.camera, asPipTransform);
  await flipHorizontal(obs, scene3, cam3);
  await addExistingSource(obs, scene3, SRC.mic, {});

  // ───────── 4. S4 [AS] Split Compare ─────────
  const scene4 = 'S4 [AS] Split Compare';
  await createScene(obs, scene4);

  await addColorSource(obs, scene4, '[AS] BG Split',
    colors.crust, CANVAS_W, CANVAS_H, fillCanvas());

  // Left side — "Before" or competitor
  await addColorSource(obs, scene4, '[AS] Left Panel',
    colors.surface0, CANVAS_W / 2 - 10, CANVAS_H - 120, {
      positionX: 0,
      positionY: 60,
    });

  await addTextSource(obs, scene4, '[AS] Text - Before',
    'Before', 36, colors.red, {
      positionX: CANVAS_W / 4 - 60,
      positionY: 15,
    });

  // Right side — "After" (Alfred Scholar)
  await addColorSource(obs, scene4, '[AS] Right Panel',
    colors.surface0, CANVAS_W / 2 - 10, CANVAS_H - 120, {
      positionX: CANVAS_W / 2 + 10,
      positionY: 60,
    });

  await addTextSource(obs, scene4, '[AS] Text - After',
    'Alfred Scholar', 36, colors.green, {
      positionX: CANVAS_W * 3 / 4 - 100,
      positionY: 15,
    });

  // Center divider
  await addColorSource(obs, scene4, '[AS] Center Divider',
    colors.blue, 4, CANVAS_H, {
      positionX: CANVAS_W / 2 - 2,
      positionY: 0,
    });

  // ───────── 5. S5 [AS] Testimonial ─────────
  const scene5 = 'S5 [AS] Testimonial';
  await createScene(obs, scene5);

  await addImageSource(obs, scene5, '[AS] BG - Testimonial',
    assetsPath('assets/bg-dark.png'), fillCanvas());

  // Quote marks
  await addTextSource(obs, scene5, '[AS] Text - Quote Mark',
    '"', 200, colors.mauve, {
      positionX: 100,
      positionY: 200,
    });

  // Quote text
  await addTextSource(obs, scene5, '[AS] Text - Quote',
    'Alfred Scholar transformed how I learn.\nThe AI features are incredible.', 36, colors.text, {
      positionX: 200,
      positionY: 400,
    });

  // Attribution
  await addTextSource(obs, scene5, '[AS] Text - Attribution',
    '— Happy Customer, Role', 24, colors.lavender, {
      positionX: 200,
      positionY: 550,
    });

  // Star rating
  await addTextSource(obs, scene5, '[AS] Text - Stars',
    '★ ★ ★ ★ ★', 36, colors.yellow, {
      positionX: 200,
      positionY: 620,
    });

  // ───────── 6. S6 [AS] CTA Slide ─────────
  const scene6 = 'S6 [AS] CTA Slide';
  await createScene(obs, scene6);

  await addImageSource(obs, scene6, '[AS] BG - CTA',
    assetsPath('assets/bg-red.png'), fillCanvas());

  // Product name
  await addTextSource(obs, scene6, '[AS] Text - CTA Title',
    'Alfred Scholar', 96, colors.text, centered(900, 120));

  // Tagline
  await addTextSource(obs, scene6, '[AS] Text - Tagline',
    'Learn Smarter. Achieve More.', 36, colors.lavender, {
      positionX: (CANVAS_W - 600) / 2,
      positionY: (CANVAS_H + 120) / 2 + 20,
    });

  // CTA button-like element
  await addColorSource(obs, scene6, '[AS] CTA Button BG',
    colors.blue, 400, 70, {
      positionX: (CANVAS_W - 400) / 2,
      positionY: (CANVAS_H + 120) / 2 + 100,
    });

  await addTextSource(obs, scene6, '[AS] Text - CTA Button',
    'Try It Free Today', 28, colors.crust, {
      positionX: (CANVAS_W - 300) / 2,
      positionY: (CANVAS_H + 120) / 2 + 118,
    });

  // ─────────────────────────────────────────────────
  // Instagram Vertical Scenes (9:16)
  // ─────────────────────────────────────────────────
  console.log('\n  --- Instagram Vertical Scenes ---');

  const igScale = CANVAS_H / 1920;
  const igW = 1080 * igScale;
  const igX = (CANVAS_W - igW) / 2;

  // ───────── 7. S7 [AS-IG] Product Demo Vertical ─────────
  const scene7 = 'S7 [AS-IG] Product Demo Vertical';
  await createScene(obs, scene7);

  await addColorSource(obs, scene7, '[AS-IG] BG Dark',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Phone-sized screen recording
  await addExistingSource(obs, scene7, SRC.screen, {
    positionX: Math.round(igX) + 20,
    positionY: 80,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: Math.round(igW) - 40,
    boundsHeight: CANVAS_H - 200,
  });

  // Product name at top
  await addTextSource(obs, scene7, '[AS-IG] Text - Product',
    'Alfred Scholar', 24, colors.blue, {
      positionX: Math.round(igX) + 20,
      positionY: 20,
    });

  // Feature label at bottom
  await addTextSource(obs, scene7, '[AS-IG] Text - Feature',
    'See it in action ↓', 20, colors.text, {
      positionX: Math.round(igX) + Math.round(igW) / 2 - 80,
      positionY: CANVAS_H - 50,
    });

  // ───────── 8. S8 [AS-IG] Talking Head Vertical ─────────
  const scene8 = 'S8 [AS-IG] Talking Head Vertical';
  await createScene(obs, scene8);

  await addColorSource(obs, scene8, '[AS-IG] BG Dark 2',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Background video in vertical strip
  await addExistingSource(obs, scene8, '[AS] BG - Talking', {
    positionX: Math.round(igX),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: Math.round(igW),
    boundsHeight: CANVAS_H,
  });

  // Camera vertical — fills most of the vertical strip
  const cam8 = await addExistingSource(obs, scene8, SRC.camera, {
    positionX: Math.round(igX),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: Math.round(igW),
    boundsHeight: CANVAS_H,
    cropLeft: 200,
    cropRight: 200,
  });
  await flipHorizontal(obs, scene8, cam8);
  await addExistingSource(obs, scene8, SRC.mic, {});

  // Branded bottom overlay
  await addColorSource(obs, scene8, '[AS-IG] Bottom Overlay',
    colors.surface0, Math.round(igW), 100, {
      positionX: Math.round(igX),
      positionY: CANVAS_H - 100,
    });

  await addTextSource(obs, scene8, '[AS-IG] Text - Brand',
    'Alfred Scholar', 22, colors.blue, {
      positionX: Math.round(igX) + 20,
      positionY: CANVAS_H - 70,
    });

  await addTextSource(obs, scene8, '[AS-IG] Text - Handle',
    '@alfredscholar', 18, colors.lavender, {
      positionX: Math.round(igX) + 20,
      positionY: CANVAS_H - 40,
    });

  // ───────── 9. S9 [AS-IG] Feature Vertical ─────────
  const scene9 = 'S9 [AS-IG] Feature Vertical';
  await createScene(obs, scene9);

  await addColorSource(obs, scene9, '[AS-IG] BG Dark 3',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Zoomed screen in vertical
  await addExistingSource(obs, scene9, SRC.screen, {
    positionX: Math.round(igX) - 100,
    positionY: 100,
    scaleX: 1.2,
    scaleY: 1.2,
  });

  // Feature label overlay
  await addColorSource(obs, scene9, '[AS-IG] Feature Label BG',
    colors.mauve, Math.round(igW) - 40, 50, {
      positionX: Math.round(igX) + 20,
      positionY: 30,
    });

  await addTextSource(obs, scene9, '[AS-IG] Text - Feature Label',
    'Key Feature', 22, colors.crust, {
      positionX: Math.round(igX) + 40,
      positionY: 42,
    });

  // ───────── 10. S0 [AS-IG] CTA Vertical ─────────
  const scene10 = 'S0 [AS-IG] CTA Vertical';
  await createScene(obs, scene10);

  await addColorSource(obs, scene10, '[AS-IG] BG Dark 4',
    colors.base, CANVAS_W, CANVAS_H, fillCanvas());

  // Background video
  await addExistingSource(obs, scene10, '[AS] BG - CTA', {
    positionX: Math.round(igX),
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_OUTER',
    boundsWidth: Math.round(igW),
    boundsHeight: CANVAS_H,
  });

  // Product name
  await addTextSource(obs, scene10, '[AS-IG] Text - CTA Title',
    'Alfred\nScholar', 64, colors.text, {
      positionX: Math.round(igX) + 50,
      positionY: CANVAS_H / 2 - 100,
    });

  // CTA
  await addColorSource(obs, scene10, '[AS-IG] CTA Button',
    colors.blue, Math.round(igW) - 100, 50, {
      positionX: Math.round(igX) + 50,
      positionY: CANVAS_H / 2 + 80,
    });

  await addTextSource(obs, scene10, '[AS-IG] Text - CTA',
    'Try It Free', 22, colors.crust, {
      positionX: Math.round(igX) + Math.round(igW) / 2 - 50,
      positionY: CANVAS_H / 2 + 92,
    });

  // Lock all items in all scenes
  for (const s of [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10]) {
    await lockAllItems(obs, s);
  }

  // Set first scene as active
  await obs.call('SetCurrentProgramScene', { sceneName: scene1 });

  console.log('\nAlfred Scholar scenes created successfully!');
}
