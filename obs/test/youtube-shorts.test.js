import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chooseBestCameraDevice } from '../utils.js';
import { CAMERA_SCENE_NAME, SIMPLE_CAMERA_CANVAS, getCameraTransform } from '../scenes/youtube-shorts.js';

describe('simple OBS camera profile', () => {
  it('uses rectangular 4K at 60 fps', () => {
    assert.deepEqual(SIMPLE_CAMERA_CANVAS, {
      width: 3840,
      height: 2160,
      fpsNumerator: 60,
      fpsDenominator: 1,
    });
  });

  it('keeps one camera scene with a full-canvas camera transform', () => {
    const transform = getCameraTransform();

    assert.equal(CAMERA_SCENE_NAME, '1 [YS] Camera Only');
    assert.deepEqual(transform, {
      positionX: 0,
      positionY: 0,
      boundsType: 'OBS_BOUNDS_SCALE_INNER',
      boundsWidth: 3840,
      boundsHeight: 2160,
    });
  });

  it('prefers an iPhone continuity camera over the built-in camera', () => {
    const camera = chooseBestCameraDevice([
      { name: 'FaceTime HD Camera', uuid: 'facetime' },
      { name: 'Bhushan iPhone Camera', uuid: 'iphone' },
    ]);

    assert.deepEqual(camera, { name: 'Bhushan iPhone Camera', uuid: 'iphone' });
  });
});
