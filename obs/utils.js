import OBSWebSocket from 'obs-websocket-js';
import { execSync } from 'child_process';
import fs from 'fs';

// Detect external display UUID and resolution at runtime (falls back to main display)
export function getDisplayInfo() {
  try {
    const swiftCode = [
      'import AppKit; import CoreGraphics',
      'for screen in NSScreen.screens {',
      '  let id = screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as! UInt32',
      '  let uuid = CFUUIDCreateString(nil, CGDisplayCreateUUIDFromDisplayID(id).takeRetainedValue()) as String',
      '  let isMain = CGDisplayIsMain(id) != 0',
      '  let w = Int(screen.frame.width)',
      '  let h = Int(screen.frame.height)',
      '  let menuBar = Int(screen.frame.height - screen.visibleFrame.height - screen.visibleFrame.origin.y)',
      '  let label = isMain ? "main" : "external"',
      '  print("\\(label)|\\(uuid)|\\(w)|\\(h)|\\(menuBar)")',
      '}',
    ].join('\n');
    const tmpFile = '/tmp/obs-display-detect.swift';
    fs.writeFileSync(tmpFile, swiftCode);
    const output = execSync(`swift ${tmpFile}`, { timeout: 10000 }).toString().trim();

    const lines = output.split('\n');
    const main = lines.find(l => l.startsWith('main'));
    const picked = main;

    if (picked) {
      const [type, uuid, w, h, menuBar] = picked.split('|');
      console.log(`Detected ${type} display: ${w}x${h}, menuBar=${menuBar}px (${uuid})`);
      return { uuid, width: parseInt(w), height: parseInt(h), menuBar: parseInt(menuBar) };
    }
  } catch {}
  console.log('No display detected, using defaults');
  return { uuid: '', width: 1920, height: 1080, menuBar: 30 };
}

// Backward compat
export function getExternalDisplayUUID() {
  return getDisplayInfo().uuid;
}

// Detect FaceTime HD Camera device UUID
export function getFaceTimeCameraUUID() {
  try {
    const output = execSync(`swift -e '
import AVFoundation
for device in AVCaptureDevice.DiscoverySession(
  deviceTypes: [.builtInWideAngleCamera],
  mediaType: .video,
  position: .unspecified
).devices {
  if device.localizedName.contains("FaceTime") {
    print(device.uniqueID)
  }
}
'`, { timeout: 10000 }).toString().trim();
    if (output) {
      console.log(`Detected FaceTime camera: ${output}`);
      return output;
    }
  } catch {}
  console.log('FaceTime camera not found, using default');
  return '';
}

// Catppuccin Mocha palette (ABGR format for OBS)
// OBS uses ABGR hex: 0xAABBGGRR
export const colors = {
  base: 0xff2e1e1e, // #1e1e2e
  mantle: 0xff2a1b18, // #181825 (actually reversed)
  crust: 0xff241711, // #11111b
  surface0: 0xff3e3331, // #313244
  surface1: 0xff514645, // #45475a
  text: 0xfff4d6cd, // #cdd6f4
  blue: 0xfffab489, // #89b4fa
  green: 0xffa1e3a6, // #a6e3a1
  red: 0xffa88bf3, // #f38ba8
  mauve: 0xfff7a6cb, // #cba6f7
  peach: 0xff80a5fa, // #fab387
  yellow: 0xff97e1f9, // #f9e2af
  lavender: 0xfffdc8b7, // #b4befe
  rosewater: 0xffc9ddf5, // #f5e0dc
};

// Same colors but as hex strings for browser sources CSS
export const hexColors = {
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
  surface0: '#313244',
  surface1: '#45475a',
  text: '#cdd6f4',
  blue: '#89b4fa',
  green: '#a6e3a1',
  red: '#f38ba8',
  mauve: '#cba6f7',
  peach: '#fab387',
  yellow: '#f9e2af',
  lavender: '#b4befe',
  rosewater: '#f5e0dc',
};

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const IG_W = 1080;
const IG_H = 1920;

export { CANVAS_W, CANVAS_H, IG_W, IG_H };

export async function connect() {
  const obs = new OBSWebSocket();
  const url = process.env.OBS_WEBSOCKET_URL || 'ws://localhost:4455';
  const password = process.env.OBS_WEBSOCKET_PASSWORD || undefined;
  await obs.connect(url, password);
  console.log('Connected to OBS WebSocket');
  return obs;
}

export async function cleanSlate(obs) {
  console.log('Wiping all existing scenes and inputs...');

  // We need at least one scene, so create a temp one first
  try {
    await obs.call('CreateScene', { sceneName: '__temp__' });
  } catch {
    // Already exists from a previous failed run
  }
  await obs.call('SetCurrentProgramScene', { sceneName: '__temp__' });

  // Remove all existing scenes (except temp)
  const { scenes } = await obs.call('GetSceneList');
  for (const scene of scenes) {
    if (scene.sceneName === '__temp__') continue;
    try {
      await obs.call('RemoveScene', { sceneUuid: scene.sceneUuid });
    } catch (e) {
      console.warn(`Could not remove scene "${scene.sceneName}":`, e.message);
    }
  }

  // Remove all inputs — loop until none remain (some may be nested)
  for (let attempt = 0; attempt < 5; attempt++) {
    const { inputs } = await obs.call('GetInputList');
    if (inputs.length === 0) break;
    for (const input of inputs) {
      try {
        await obs.call('RemoveInput', { inputUuid: input.inputUuid });
      } catch {
        // May fail if still referenced, will retry
      }
    }
  }

  console.log('Clean slate ready');
}

export async function createScene(obs, name) {
  const result = await obs.call('CreateScene', { sceneName: name });
  console.log(`  Scene: "${name}"`);
  return result.sceneUuid;
}

export async function addSource(obs, sceneName, inputName, inputKind, inputSettings = {}, sceneItemTransform = {}) {
  const result = await obs.call('CreateInput', {
    sceneName,
    inputName,
    inputKind,
    inputSettings,
    sceneItemEnabled: true,
  });

  if (Object.keys(sceneItemTransform).length > 0) {
    await obs.call('SetSceneItemTransform', {
      sceneName,
      sceneItemId: result.sceneItemId,
      sceneItemTransform,
    });
  }

  console.log(`    Source: "${inputName}" (${inputKind})`);
  return { inputUuid: result.inputUuid, sceneItemId: result.sceneItemId };
}

export async function addExistingSource(obs, sceneName, sourceName, sceneItemTransform = {}) {
  // Get the source's scene item ID by adding it via CreateSceneItem
  const result = await obs.call('CreateSceneItem', {
    sceneName,
    sourceName,
    sceneItemEnabled: true,
  });

  if (Object.keys(sceneItemTransform).length > 0) {
    await obs.call('SetSceneItemTransform', {
      sceneName,
      sceneItemId: result.sceneItemId,
      sceneItemTransform,
    });
  }

  console.log(`    Reused: "${sourceName}"`);
  return result.sceneItemId;
}

export async function setItemTransform(obs, sceneName, sceneItemId, transform) {
  await obs.call('SetSceneItemTransform', {
    sceneName,
    sceneItemId,
    sceneItemTransform: transform,
  });
}

// Flip a scene item horizontally by negating its scaleX
export async function flipHorizontal(obs, sceneName, sceneItemId) {
  const { sceneItemTransform } = await obs.call('GetSceneItemTransform', { sceneName, sceneItemId });
  await obs.call('SetSceneItemTransform', {
    sceneName,
    sceneItemId,
    sceneItemTransform: { scaleX: -Math.abs(sceneItemTransform.scaleX || 1) },
  });
}

export async function lockItem(obs, sceneName, sceneItemId) {
  await obs.call('SetSceneItemLocked', { sceneName, sceneItemId, sceneItemLocked: true });
}

export async function lockAllItems(obs, sceneName) {
  const { sceneItems } = await obs.call('GetSceneItemList', { sceneName });
  for (const item of sceneItems) {
    await obs.call('SetSceneItemLocked', {
      sceneName,
      sceneItemId: item.sceneItemId,
      sceneItemLocked: true,
    });
  }
}

// Adds a thin border (color source) behind a source and locks both
export async function addBorder(obs, sceneName, borderName, transform, borderWidth = 2, borderColor = colors.blue) {
  const bw = borderWidth;
  const border = await addColorSource(obs, sceneName, borderName, borderColor,
    Math.round((transform.boundsWidth || 1920) + bw * 2),
    Math.round((transform.boundsHeight || 1080) + bw * 2),
    {
      positionX: (transform.positionX || 0) - bw,
      positionY: (transform.positionY || 0) - bw,
    });
  return border;
}

export async function addFilter(obs, sourceName, filterName, filterKind, filterSettings = {}, enabled = true) {
  await obs.call('CreateSourceFilter', {
    sourceName,
    filterName,
    filterKind,
    filterSettings,
  });
  if (!enabled) {
    await obs.call('SetSourceFilterEnabled', {
      sourceName,
      filterName,
      filterEnabled: false,
    });
  }
  console.log(`    Filter: "${filterName}" on "${sourceName}"${enabled ? '' : ' (disabled)'}`);
}

export async function addColorSource(obs, sceneName, name, color, width, height, transform = {}) {
  return addSource(obs, sceneName, name, 'color_source_v3', {
    color,
    width,
    height,
  }, transform);
}

export async function addTextSource(obs, sceneName, name, text, fontSize = 48, color = colors.text, transform = {}) {
  return addSource(obs, sceneName, name, 'text_ft2_source_v2', {
    text,
    font: { face: 'Helvetica Neue', size: fontSize, style: '', flags: 0 },
    color1: color,
    color2: color,
  }, transform);
}

export async function addImageSource(obs, sceneName, name, filePath, transform = {}) {
  return addSource(obs, sceneName, name, 'image_source', {
    file: filePath,
  }, transform);
}

export async function addBrowserSource(obs, sceneName, name, url, width, height, css = '', transform = {}) {
  return addSource(obs, sceneName, name, 'browser_source', {
    url,
    width,
    height,
    css,
    shutdown: false,
    restart_when_active: false,
  }, transform);
}

export async function addMediaSource(obs, sceneName, name, filePath, looping = true, transform = {}) {
  return addSource(obs, sceneName, name, 'ffmpeg_source', {
    local_file: filePath,
    looping,
    restart_on_activate: true,
  }, transform);
}

// Helper to position a source to fill the canvas
export function fillCanvas() {
  return {
    positionX: 0,
    positionY: 0,
    boundsType: 'OBS_BOUNDS_STRETCH',
    boundsWidth: CANVAS_W,
    boundsHeight: CANVAS_H,
  };
}

// Helper to position a webcam PiP in a corner
export function pipCorner(corner = 'bottom-right', scale = 0.25) {
  const w = CANVAS_W * scale;
  const h = CANVAS_H * scale;
  const pad = 20;

  const positions = {
    'bottom-right': { positionX: CANVAS_W - w - pad, positionY: CANVAS_H - h - pad },
    'bottom-left': { positionX: pad, positionY: CANVAS_H - h - pad },
    'top-right': { positionX: CANVAS_W - w - pad, positionY: pad },
    'top-left': { positionX: pad, positionY: pad },
  };

  return {
    ...positions[corner],
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: w,
    boundsHeight: h,
  };
}

// Helper to center a source with given dimensions
export function centered(width, height) {
  return {
    positionX: (CANVAS_W - width) / 2,
    positionY: (CANVAS_H - height) / 2,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: width,
    boundsHeight: height,
  };
}

// Helper to create lower-third positioning
export function lowerThird() {
  return {
    positionX: 40,
    positionY: CANVAS_H - 120,
  };
}

// Helper for side-by-side split (left or right portion)
export function splitSide(side = 'left', ratio = 0.6) {
  const leftW = CANVAS_W * ratio;
  const rightW = CANVAS_W * (1 - ratio);

  if (side === 'left') {
    return {
      positionX: 0,
      positionY: 0,
      boundsType: 'OBS_BOUNDS_SCALE_INNER',
      boundsWidth: leftW,
      boundsHeight: CANVAS_H,
    };
  }
  return {
    positionX: leftW,
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: rightW,
    boundsHeight: CANVAS_H,
  };
}

// Get the dotfiles obs assets path
export function assetsPath(relativePath) {
  const base = new URL('.', import.meta.url).pathname;
  return `${base}${relativePath}`;
}

export async function removeTemp(obs) {
  try {
    await obs.call('RemoveScene', { sceneName: '__temp__' });
  } catch {
    // ignore if already removed
  }
}
