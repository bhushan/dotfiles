import {
  createScene, addSource, addFilter, getFaceTimeCameraUUID, getDefaultMicDevice,
} from '../utils.js';

export const SIMPLE_CAMERA_CANVAS = {
  width: 3840,
  height: 2160,
  fpsNumerator: 60,
  fpsDenominator: 1,
};

export const CAMERA_SCENE_NAME = '1 [YS] Camera Only';

const SRC = {
  camera: '[YS] Camera',
  mic: '[YS] Mic',
};

export function getCameraTransform() {
  return {
    positionX: 0,
    positionY: 0,
    boundsType: 'OBS_BOUNDS_SCALE_INNER',
    boundsWidth: SIMPLE_CAMERA_CANVAS.width,
    boundsHeight: SIMPLE_CAMERA_CANVAS.height,
  };
}

export async function setup(obs) {
  console.log('\n=== Simple Camera Recording Setup ===\n');

  const cameraUUID = getFaceTimeCameraUUID();
  const mic = getDefaultMicDevice();
  const { width: W, height: H, fpsNumerator, fpsDenominator } = SIMPLE_CAMERA_CANVAS;

  await obs.call('SetVideoSettings', {
    baseWidth: W,
    baseHeight: H,
    outputWidth: W,
    outputHeight: H,
    fpsNumerator,
    fpsDenominator,
  });
  console.log(`  Canvas: ${W}x${H} @ ${fpsNumerator / fpsDenominator}fps\n`);

  await createScene(obs, CAMERA_SCENE_NAME);

  await addSource(obs, CAMERA_SCENE_NAME, SRC.camera, 'av_capture_input_v2', {
    device: cameraUUID,
  }, getCameraTransform());

  await addFilter(obs, SRC.camera, 'Chroma Key', 'chroma_key_filter_v2', {
    similarity: 400,
    smoothness: 75,
    spill: 100,
    key_color_type: 'green',
  }, false);
  console.log('    Chroma key: available on camera, disabled for raw DaVinci keying');

  await addSource(obs, CAMERA_SCENE_NAME, SRC.mic, 'coreaudio_input_capture', {
    device_id: mic.uid,
  }, {});

  await addFilter(obs, SRC.mic, 'Noise Suppression', 'noise_suppress_filter_v2', {
    method: 'denoiser',
  });
  await addFilter(obs, SRC.mic, 'Compressor', 'compressor_filter', {
    ratio: 3.0,
    threshold: -18.0,
    attack_time: 3,
    release_time: 80,
    output_gain: 6.0,
  });
  await addFilter(obs, SRC.mic, 'Limiter', 'limiter_filter', {
    threshold: -1.0,
    release_time: 60,
  });

  await obs.call('SetInputAudioTracks', {
    inputName: SRC.mic,
    inputAudioTracks: { '1': true, '2': true, '3': false, '4': false, '5': false, '6': false },
  });
  console.log('    Audio: Mic on Track 1 and Track 2');

  await obs.call('SetCurrentProgramScene', { sceneName: CAMERA_SCENE_NAME });
  console.log('\n  Ready: one clean camera scene for DaVinci');
}
