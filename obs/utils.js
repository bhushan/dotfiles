import OBSWebSocket from 'obs-websocket-js';
import { execSync } from 'child_process';
import fs from 'fs';

// Detect all displays — returns main (primary) and best (highest res)
export function detectDisplays() {
  try {
    const swiftCode = [
      'import AppKit; import CoreGraphics',
      'for screen in NSScreen.screens {',
      '  let id = screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as! UInt32',
      '  let uuid = CFUUIDCreateString(nil, CGDisplayCreateUUIDFromDisplayID(id).takeRetainedValue()) as String',
      '  let isMain = CGDisplayIsMain(id) != 0',
      '  let scale = Int(screen.backingScaleFactor)',
      '  let w = Int(screen.frame.width) * scale',
      '  let h = Int(screen.frame.height) * scale',
      '  let label = isMain ? "main" : "external"',
      '  print("\\(label)|\\(uuid)|\\(w)|\\(h)|\\(scale)")',
      '}',
    ].join('\n');
    const tmpFile = '/tmp/obs-display-detect.swift';
    fs.writeFileSync(tmpFile, swiftCode);
    const output = execSync(`swift -suppress-warnings ${tmpFile} 2>/dev/null`, { timeout: 10000 }).toString().trim();

    const displays = [];
    for (const line of output.split('\n')) {
      const [type, uuid, w, h, scale] = line.split('|');
      displays.push({ type, uuid, width: parseInt(w), height: parseInt(h), scale: parseInt(scale) });
    }

    for (const d of displays) {
      console.log(`  Display: ${d.type} ${d.width}x${d.height} @${d.scale}x (${d.uuid})`);
    }

    return displays;
  } catch {}
  console.log('No displays detected');
  return [];
}

// Use OBS's current default input device. This keeps the setup simple and avoids
// brittle CoreAudio probing during recording prep.
export function getDefaultMicDevice() {
  return { name: 'Default', uid: 'default' };
}

// Detect the best available camera device UUID.
export function getFaceTimeCameraUUID() {
  return getBestCameraUUID();
}

export function getBestCameraUUID() {
  try {
    const output = execSync(`swift -suppress-warnings -e '
import AVFoundation
for device in AVCaptureDevice.DiscoverySession(
  deviceTypes: [.builtInWideAngleCamera, .externalUnknown],
  mediaType: .video,
  position: .unspecified
).devices {
  print("\\(device.localizedName)|\\(device.uniqueID)")
}
' 2>/dev/null`, { timeout: 10000 }).toString().trim();
    if (output) {
      const devices = parseCameraDevices(output);
      for (const { name, uuid } of devices) {
        console.log(`  Camera: ${name} (${uuid})`);
      }

      const best = chooseBestCameraDevice(devices);
      console.log(`  Camera selected: ${best.name}`);
      return best.uuid;
    }
  } catch {}
  console.log('  No camera detected');
  return '';
}

export function chooseBestCameraDevice(devices) {
  return devices.find(device => /iphone|continuity/i.test(device.name))
    || devices.find(device => !/facetime|built.?in/i.test(device.name))
    || devices[0]
    || { name: '', uuid: '' };
}

function parseCameraDevices(output) {
  return output
    .split('\n')
    .map(line => {
      const [name, uuid] = line.split('|');
      return { name, uuid };
    })
    .filter(device => device.name && device.uuid);
}

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

  try {
    await obs.call('CreateScene', { sceneName: '__temp__' });
  } catch {}
  await obs.call('SetCurrentProgramScene', { sceneName: '__temp__' });

  const { scenes } = await obs.call('GetSceneList');
  for (const scene of scenes) {
    if (scene.sceneName === '__temp__') continue;
    try {
      await obs.call('RemoveScene', { sceneUuid: scene.sceneUuid });
    } catch (e) {
      console.warn(`Could not remove scene "${scene.sceneName}":`, e.message);
    }
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const { inputs } = await obs.call('GetInputList');
    if (inputs.length === 0) break;
    for (const input of inputs) {
      try {
        await obs.call('RemoveInput', { inputUuid: input.inputUuid });
      } catch {}
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

// Add a Source Record filter (requires obs-source-record plugin by exeldro).
export async function addSourceRecordFilter(obs, sourceName, filterName, outputPath, options = {}) {
  const {
    filenameFormat,
    format = 'mkv',
    encoder = 'com.apple.videotoolbox.videoencoder.ave.avc',  // H.264 hardware
    bitrate = 10000,
    resolution = '1920x1080',
  } = options;

  const settings = {
    path: outputPath,
    filename_formatting: filenameFormat,
    rec_format: format,
    record_mode: 3,  // 3 = Recording — auto-start with main OBS recording
    encoder,
    bitrate,
    rate_control: 'CBR',
    profile: 'high',
    resolution,
  };

  try {
    await addFilter(obs, sourceName, filterName, 'source_record_filter', settings);
    console.log(`    Source Record: "${sourceName}" → ${outputPath} (${format}, ${resolution}, ${bitrate}kbps)`);
  } catch (e) {
    console.warn(`    Source Record skipped for "${sourceName}": ${e.message}`);
  }
}

export async function addColorSource(obs, sceneName, name, color, width, height, transform = {}) {
  return addSource(obs, sceneName, name, 'color_source_v3', {
    color,
    width,
    height,
  }, transform);
}

export function assetsPath(relativePath) {
  const base = new URL('.', import.meta.url).pathname;
  return `${base}${relativePath}`;
}

export async function removeTemp(obs) {
  try {
    await obs.call('RemoveScene', { sceneName: '__temp__' });
  } catch {}
}
