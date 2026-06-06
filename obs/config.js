export const PRORES_422_CODEC_TYPE = 1634755438;

export function buildRecordEncoderSettings() {
  return { codec_type: PRORES_422_CODEC_TYPE };
}

export function buildBasicIni(existingProfile, options) {
  const {
    width,
    height,
    fpsNumerator,
    fpsDenominator,
    recordingPath,
  } = options;

  const fpsCommon = fpsDenominator === 1
    ? String(fpsNumerator)
    : `${fpsNumerator}/${fpsDenominator}`;

  let profile = existingProfile;
  for (const section of ['Output', 'AdvOut', 'Video', 'Audio']) {
    profile = removeIniSection(profile, section);
  }

  profile = profile.trimEnd();
  profile += `

[Output]
Mode=Advanced

[AdvOut]
RecType=Standard
RecEncoder=com.apple.videotoolbox.videoencoder.appleproreshw.422
RecFormat=mov
RecFilePath=${recordingPath}
RecTracks=3
Rescale=false
RecRescaleRes=${width}x${height}
FFOutputToFile=true
Track1Bitrate=320
Track2Bitrate=320
Track3Bitrate=320
Track1Name=Combined
Track2Name=Mic
Track3Name=System

[Audio]
SampleRate=48000
ChannelSetup=Stereo
MonitoringDeviceId=default
MonitoringDeviceName=Default
MeterDecayRate=23.53
PeakMeterType=0

[Video]
BaseCX=${width}
BaseCY=${height}
OutputCX=${width}
OutputCY=${height}
FPSType=0
FPSCommon=${fpsCommon}
ScaleType=lanczos
ColorFormat=NV12
ColorSpace=709
ColorRange=2
FPSInt=${Math.round(fpsNumerator / fpsDenominator)}
FPSNum=${fpsNumerator}
FPSDen=${fpsDenominator}
SdrWhiteLevel=300
HdrNominalPeakLevel=1000
`;

  return `${profile.trim()}\n`;
}

function removeIniSection(profile, sectionName) {
  const sectionPattern = new RegExp(
    `(^|\\n)\\[${escapeRegExp(sectionName)}\\]\\n[\\s\\S]*?(?=\\n\\[[^\\]]+\\]|$)`,
    'g',
  );

  return profile.replace(sectionPattern, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
