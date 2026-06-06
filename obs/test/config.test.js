import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildBasicIni, buildRecordEncoderSettings } from '../config.js';

describe('OBS profile config generation', () => {
  it('writes a single clean 4K 60 fps recording profile', () => {
    const existing = `[General]
Name=Untitled

[Audio]
SampleRate=44100

[Output]
Mode=Simple

[Audio]
SampleRate=44100

[Video]
BaseCX=1920
BaseCY=1080
`;

    const profile = buildBasicIni(existing, {
      width: 2160,
      height: 3840,
      fpsNumerator: 60,
      fpsDenominator: 1,
      recordingPath: '/tmp/recordings',
    });

    assert.equal(profile.match(/^\[Audio\]$/gm).length, 1);
    assert.equal(profile.match(/^\[Output\]$/gm).length, 1);
    assert.equal(profile.match(/^\[AdvOut\]$/gm).length, 1);
    assert.equal(profile.match(/^\[Video\]$/gm).length, 1);

    assert.match(profile, /BaseCX=2160/);
    assert.match(profile, /BaseCY=3840/);
    assert.match(profile, /OutputCX=2160/);
    assert.match(profile, /OutputCY=3840/);
    assert.match(profile, /FPSCommon=60/);
    assert.match(profile, /FPSNum=60/);
    assert.match(profile, /FPSDen=1/);
    assert.match(profile, /RecEncoder=com\.apple\.videotoolbox\.videoencoder\.appleproreshw\.422/);
    assert.match(profile, /RecFormat=mov/);
    assert.match(profile, /RecTracks=3/);
    assert.match(profile, /Track1Name=Combined/);
    assert.match(profile, /Track2Name=Mic/);
    assert.match(profile, /Track3Name=System/);
  });

  it('keeps non-output profile sections intact', () => {
    const existing = `[General]
Name=Untitled

[Panels]
CookieId=local-ui-state
`;

    const profile = buildBasicIni(existing, {
      width: 2160,
      height: 3840,
      fpsNumerator: 60,
      fpsDenominator: 1,
      recordingPath: '/tmp/recordings',
    });

    assert.match(profile, /\[General\]\nName=Untitled/);
    assert.match(profile, /\[Panels\]\nCookieId=local-ui-state/);
  });

  it('uses ProRes 422 hardware encoder settings', () => {
    assert.deepEqual(buildRecordEncoderSettings(), { codec_type: 1634755438 });
  });

});
