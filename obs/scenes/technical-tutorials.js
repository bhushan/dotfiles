import {
  createScene, addSource, addExistingSource, addFilter,
  addSourceRecordFilter, detectDisplays, getFaceTimeCameraUUID, getDefaultMicDevice,
} from '../utils.js';

const SRC = {
  camera: '[TT] Camera',
  screen: '[TT] Screen Capture',
  mic:    '[TT] Mic',
  system: '[TT] System Audio',
};

export async function setup(obs) {
  console.log('\n=== Technical Tutorials — Recording Setup ===\n');

  const displays = detectDisplays();
  const cameraUUID = getFaceTimeCameraUUID();
  const mic = getDefaultMicDevice();

  const display = displays.find(d => d.type === 'main') || displays[0];
  const W = display ? display.width : 1920;
  const H = display ? display.height : 1080;

  await obs.call('SetVideoSettings', {
    baseWidth: W, baseHeight: H,
    outputWidth: W, outputHeight: H,
    fpsNumerator: 30, fpsDenominator: 1,
  });
  console.log(`  Canvas: ${W}x${H} @ 30fps\n`);

  const stretch = {
    positionX: 0, positionY: 0,
    boundsType: 'OBS_BOUNDS_STRETCH',
    boundsWidth: W, boundsHeight: H,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Recording scene — screen + camera PiP (chroma keyed) + mic + system audio
  // ─────────────────────────────────────────────────────────────────────────
  const scene = '1 [TT] Recording';
  await createScene(obs, scene);

  // Screen capture — main display
  await addSource(obs, scene, SRC.screen, 'screen_capture', {
    show_cursor: true,
    type: 0,
    hide_obs: true,
    display_uuid: display.uuid,
    show_empty_names: false,
    show_hidden_windows: false,
  }, stretch);

  // Mute + remove screen capture audio from mixer
  await obs.call('SetInputMute', { inputName: SRC.screen, inputMuted: true });
  await obs.call('SetInputAudioTracks', {
    inputName: SRC.screen,
    inputAudioTracks: { '1': false, '2': false, '3': false, '4': false, '5': false, '6': false },
  });
  console.log('    Screen capture audio: removed from mixer');

  // ── Camera setup ──────────────────────────────────────────────────────
  // Raw camera source (no chroma key) — used by ISO for raw green screen footage
  // Keyed scene wraps camera + chroma key — used in recording scene PiP
  //
  // Result:
  //   Combined recording → camera with green screen removed (chroma keyed)
  //   camera.mkv ISO     → raw green screen footage for DaVinci re-keying

  // Create raw camera in a hidden ISO scene first
  const camIsoScene = '[TT] Camera ISO';
  await createScene(obs, camIsoScene);
  await addSource(obs, camIsoScene, SRC.camera, 'av_capture_input_v2', {
    device: cameraUUID,
  }, stretch);

  // Create keyed scene: camera + chroma key (enabled by default)
  const keyedScene = '[TT] Camera Keyed';
  await createScene(obs, keyedScene);
  await addExistingSource(obs, keyedScene, SRC.camera, stretch);
  await addFilter(obs, keyedScene, 'Chroma Key', 'chroma_key_filter_v2', {
    similarity: 400,
    smoothness: 75,
    spill: 100,
    key_color_type: 'green',
  });
  console.log('    Chroma key: enabled on camera PiP');

  // Add keyed camera to recording scene as PiP (bottom-right, 20%)
  const pipW = Math.round(W * 0.20);
  const pipH = Math.round(H * 0.20);
  const pipPad = Math.round(W * 0.01);
  await addExistingSource(obs, scene, keyedScene, {
    positionX: W - pipW - pipPad,
    positionY: H - pipH - pipPad,
    boundsType: 'OBS_BOUNDS_STRETCH',
    boundsWidth: pipW,
    boundsHeight: pipH,
  });

  // Mic — auto-detected default input device
  // Filter chain order matters: Suppression → Expander → Compressor → Limiter
  await addSource(obs, scene, SRC.mic, 'coreaudio_input_capture', {
    device_id: mic.uid,
  }, {});

  // 1. Noise Suppression — RNNoise (ML-based, removes fans/AC/keyboard without degrading voice)
  await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', {
    method: 'denoiser',
  });

  // 2. Expander — smoother than a noise gate, tapers quiet audio instead of hard-cutting
  //    Reduces background noise between phrases without the unnatural on/off effect
  await addFilter(obs, SRC.mic, 'Expander', 'expander_filter', {
    ratio: 4.0,
    threshold: -35.0,
    attack_time: 1,
    release_time: 100,
    output_gain: 0.0,
    detector: 'RMS',
  });

  // 3. Compressor — evens out loud/soft speech (broadcast standard 4:1)
  //    9dB output gain compensates for compression volume reduction
  await addFilter(obs, SRC.mic, 'Compressor', 'compressor_filter', {
    ratio: 4.0,
    threshold: -18.0,
    attack_time: 1,
    release_time: 60,
    output_gain: 9.0,
  });

  // 4. Limiter — safety net, hard-caps peaks so nothing ever clips
  await addFilter(obs, SRC.mic, 'Limiter', 'limiter_filter', {
    threshold: -1.0,
    release_time: 60,
  });

  // System audio (BlackHole) + sidechain ducking
  await addSource(obs, scene, SRC.system, 'coreaudio_input_capture', {
    device_id: 'BlackHole2ch_UID',
  }, {});
  await addFilter(obs, SRC.system, 'Ducking', 'compressor_filter', {
    ratio: 6.0,
    threshold: -36.0,
    attack_time: 10,
    release_time: 300,
    output_gain: 0.0,
    sidechain_source: SRC.mic,
  });
  console.log('    Sidechain: System audio ducks when mic is active');

  // ── Source Record ISOs ──────────────────────────────────────────────────
  const isoBase = `${process.env.HOME}/Downloads/recordings`;
  const isoDir = '%CCYY-%MM-%DD_%hh-%mm-%ss';

  // Screen ISO
  await addSourceRecordFilter(obs, SRC.screen, 'ISO Record Screen', isoBase, {
    filenameFormat: `${isoDir}/screen`,
    bitrate: 30000,
    resolution: `${W}x${H}`,
  });

  // Camera ISO — raw green screen footage (no chroma key) for DaVinci
  await addSourceRecordFilter(obs, camIsoScene, 'ISO Record Camera', isoBase, {
    filenameFormat: `${isoDir}/camera`,
    bitrate: 15000,
    resolution: `${W}x${H}`,
  });
  console.log('    Camera ISO: raw green screen footage for DaVinci re-keying');

  // ── Multi-track audio routing ──────────────────────────────────────────
  await obs.call('SetInputAudioTracks', {
    inputName: SRC.mic,
    inputAudioTracks: { '1': true, '2': true, '3': false, '4': false, '5': false, '6': false },
  });
  console.log('    Audio: Mic → Track 1 + Track 2');

  await obs.call('SetInputAudioTracks', {
    inputName: SRC.system,
    inputAudioTracks: { '1': true, '2': false, '3': true, '4': false, '5': false, '6': false },
  });
  console.log('    Audio: System → Track 1 + Track 3');

  await obs.call('SetCurrentProgramScene', { sceneName: scene });
  console.log('\n  Recording scene: Screen + Camera PiP (chroma keyed)');
  console.log('  camera.mkv: Raw green screen (no chroma key) for DaVinci');
  console.log('  System audio auto-ducks when you speak.');
}
