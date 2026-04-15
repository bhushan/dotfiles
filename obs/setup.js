#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { connect, cleanSlate, removeTemp, assetsPath, addMediaSource, addExistingSource, CANVAS_W, CANVAS_H } from './utils.js';
import { setup as setupLiveStream } from './scenes/live-stream.js';
import { setup as setupAlfredScholar } from './scenes/alfred-scholar.js';

const SCENE_COLLECTION_DIR = path.join(
  process.env.HOME,
  'Library/Application Support/obs-studio/basic/scenes'
);
const SCENE_FILE = path.join(SCENE_COLLECTION_DIR, 'Untitled.json');

const PROFILES = {
  'live-stream': setupLiveStream,
  'alfred-scholar': setupAlfredScholar,
};

// ═══════════════════════════════════════════════
// Numpad hotkey mappings
// ═══════════════════════════════════════════════
const SCENE_HOTKEYS = {
  '1 [LS] Starting Soon':              { key: 'OBS_KEY_NUM1' },
  '2 [LS] Main Camera':                { key: 'OBS_KEY_NUM2' },
  '3 [LS] Screen Share':               { key: 'OBS_KEY_NUM3' },
  '4 [LS] Screen + Camera Split':      { key: 'OBS_KEY_NUM4' },
  '5 [LS] BRB':                        { key: 'OBS_KEY_NUM5' },
  '6 [LS] Ending':                     { key: 'OBS_KEY_NUM6' },
  '7 [LS-IG] Camera Vertical':         { key: 'OBS_KEY_NUM7' },
  '8 [LS-IG] Screen Vertical':         { key: 'OBS_KEY_NUM8' },
  '9 [LS-IG] Starting Soon Vertical':  { key: 'OBS_KEY_NUM9' },
  'S1 [AS] Product Demo':              { key: 'OBS_KEY_NUM1', shift: true },
  'S2 [AS] Talking Head':              { key: 'OBS_KEY_NUM2', shift: true },
  'S3 [AS] Feature Highlight':         { key: 'OBS_KEY_NUM3', shift: true },
  'S4 [AS] Split Compare':             { key: 'OBS_KEY_NUM4', shift: true },
  'S5 [AS] Testimonial':               { key: 'OBS_KEY_NUM5', shift: true },
  'S6 [AS] CTA Slide':                 { key: 'OBS_KEY_NUM6', shift: true },
  'S7 [AS-IG] Product Demo Vertical':  { key: 'OBS_KEY_NUM7', shift: true },
  'S8 [AS-IG] Talking Head Vertical':  { key: 'OBS_KEY_NUM8', shift: true },
  'S9 [AS-IG] Feature Vertical':       { key: 'OBS_KEY_NUM9', shift: true },
  'S0 [AS-IG] CTA Vertical':           { key: 'OBS_KEY_NUM0', shift: true },
};

async function main() {
  const args = process.argv.slice(2);
  const profileFlag = args.indexOf('--profile');
  const profileName = profileFlag !== -1 ? args[profileFlag + 1] : null;

  console.log('╔══════════════════════════════════════════╗');
  console.log('║     OBS Studio Setup Script              ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ═══════════════════════════════════════════════
  // Phase 1: WebSocket — create scenes & sources
  // ═══════════════════════════════════════════════
  let obs;
  try {
    obs = await connect();
  } catch {
    console.error('Cannot connect to OBS WebSocket.');
    console.error('Make sure OBS is running with WebSocket enabled (Tools > WebSocket Server Settings, port 4455).');
    process.exit(1);
  }

  try {
    await obs.call('SetVideoSettings', {
      baseWidth: CANVAS_W,
      baseHeight: CANVAS_H,
      outputWidth: CANVAS_W,
      outputHeight: CANVAS_H,
      fpsNumerator: 30,
      fpsDenominator: 1,
    });
    console.log(`Canvas: ${CANVAS_W}x${CANVAS_H} @ 30fps\n`);

    await cleanSlate(obs);

    if (profileName) {
      const setupFn = PROFILES[profileName];
      if (!setupFn) {
        console.error(`Unknown profile: ${profileName}`);
        console.error(`Available: ${Object.keys(PROFILES).join(', ')}`);
        process.exit(1);
      }
      await setupFn(obs);
    } else {
      await setupLiveStream(obs);
      await setupAlfredScholar(obs);
    }

    // ── Background Music (loops across ALL scenes) ──
    console.log('\n  Adding background music to all scenes...');
    const { scenes: allScenes } = await obs.call('GetSceneList');
    // Filter out __temp__ scene
    const realScenes = allScenes.filter(s => s.sceneName !== '__temp__');
    // Create BGM source in the first scene (OBS returns reverse order)
    const firstScene = realScenes[realScenes.length - 1].sceneName;
    await addMediaSource(obs, firstScene, 'BGM', assetsPath('assets/bgm-placeholder.wav'), true, {});
    // Add to all other scenes
    for (const s of realScenes) {
      if (s.sceneName === firstScene) continue;
      try {
        await addExistingSource(obs, s.sceneName, 'BGM', {});
      } catch { /* already added */ }
    }
    // Set BGM volume low (-20dB) so it's subtle background
    await obs.call('SetInputVolume', { inputName: 'BGM', inputVolumeDb: -20 });
    console.log('  BGM added to all scenes at -20dB\n');

    await removeTemp(obs);

    await obs.call('SetCurrentSceneTransition', { transitionName: 'Fade' });
    await obs.call('SetCurrentSceneTransitionDuration', { transitionDuration: 300 });

    try {
      await obs.call('SetCurrentProgramScene', { sceneName: '2 [LS] Main Camera' });
    } catch { /* single profile mode */ }

    // Save the scene collection so it's written to disk
    await obs.call('SaveReplayBuffer').catch(() => {});

    await obs.disconnect();
    console.log('\nPhase 1 complete: scenes created via WebSocket\n');
  } catch (err) {
    console.error('Phase 1 failed:', err.message);
    await obs.disconnect().catch(() => {});
    process.exit(1);
  }

  // ═══════════════════════════════════════════════
  // Phase 2: Quit OBS, patch JSON, restart OBS
  // ═══════════════════════════════════════════════
  console.log('Phase 2: Patching config for transitions + hotkeys...\n');

  // Quit OBS gracefully via SIGTERM (allows it to save config)
  console.log('  Quitting OBS...');
  execSync('pkill -TERM -x OBS || true');

  // Wait until OBS is fully dead
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    try { execSync('pgrep -x OBS', { stdio: 'ignore' }); } catch { break; }
    if (i === 10) execSync('pkill -9 -x OBS 2>/dev/null || true');
  }
  console.log('  OBS stopped');

  // Verify scene file exists
  if (!fs.existsSync(SCENE_FILE)) {
    console.error(`Scene file not found: ${SCENE_FILE}`);
    console.error('OBS may not have saved the config. Try running setup again.');
    process.exit(1);
  }

  // Backup
  const backup = SCENE_FILE + '.pre-patch.bak';
  fs.copyFileSync(SCENE_FILE, backup);

  const data = JSON.parse(fs.readFileSync(SCENE_FILE, 'utf8'));
  let patchCount = 0;

  // ── Fade transition (default) ──
  data.current_transition = 'Fade';
  data.transition_duration = 300;
  console.log('  Transition: Fade (300ms)');
  patchCount++;

  // ── Numpad hotkeys ──
  for (const source of data.sources) {
    if (source.id !== 'scene') continue;
    const hotkey = SCENE_HOTKEYS[source.name];
    if (hotkey) {
      source.hotkeys['OBSBasic.SelectScene'] = [{
        key: hotkey.key,
        shift: hotkey.shift || false,
        control: false,
        alt: false,
        command: false,
      }];
      const label = (hotkey.shift ? 'Shift+' : '') + hotkey.key.replace('OBS_KEY_', '');
      console.log(`  Hotkey: ${label} → "${source.name}"`);
      patchCount++;
    }
  }

  // Write patched config
  fs.writeFileSync(SCENE_FILE, JSON.stringify(data, null, 2));
  console.log(`\n  ${patchCount} patches applied`);

  // ── Set global audio devices in profile ──
  const profileDir = path.join(process.env.HOME, 'Library/Application Support/obs-studio/basic/profiles/Untitled');
  const profileFile = path.join(profileDir, 'basic.ini');
  if (fs.existsSync(profileFile)) {
    let profile = fs.readFileSync(profileFile, 'utf8');
    // Add global audio devices if not present
    if (!profile.includes('AuxAudioDevice1')) {
      // Add after [Audio] section
      profile = profile.replace(
        '[Audio]\n',
        '[Audio]\nAuxAudioDevice1=BuiltInMicrophoneDevice\nDesktopAudioDevice1=default\n'
      );
      fs.writeFileSync(profileFile, profile);
      console.log('  Global audio: Mic + Desktop Audio set in profile');
      patchCount++;
    }
  }

  // ── Ensure WebSocket stays enabled after restart ──
  const wsConfigDir = path.join(process.env.HOME, 'Library/Application Support/obs-studio/plugin_config/obs-websocket');
  const wsConfigFile = path.join(wsConfigDir, 'config.json');
  fs.mkdirSync(wsConfigDir, { recursive: true });
  fs.writeFileSync(wsConfigFile, JSON.stringify({
    server_enabled: true,
    server_port: 4455,
    auth_required: false,
    alerts_enabled: true,
    first_load: false,
  }, null, 2));
  console.log('  WebSocket config preserved (port 4455, no auth)');

  // ── Verify patch before restart ──
  const verify = JSON.parse(fs.readFileSync(SCENE_FILE, 'utf8'));
  const hotkeyCount = verify.sources.filter(s => s.id === 'scene' && s.hotkeys?.['OBSBasic.SelectScene']?.length > 0).length;
  console.log(`  Verified: ${hotkeyCount} hotkeys, transition="${verify.current_transition}"`);
  if (hotkeyCount === 0) {
    console.error('  ERROR: Patches did not persist! Check if OBS is fully stopped.');
    process.exit(1);
  }

  // ── Restart OBS ──
  console.log('\n  Restarting OBS...');
  execSync('open -a OBS');
  await sleep(5000);

  // ── Verify OBS loaded our config ──
  const final = JSON.parse(fs.readFileSync(SCENE_FILE, 'utf8'));
  const finalHotkeys = final.sources.filter(s => s.id === 'scene' && s.hotkeys?.['OBSBasic.SelectScene']?.length > 0).length;
  if (finalHotkeys > 0) {
    console.log('  OBS loaded patched config successfully');
  } else {
    console.error('  WARNING: OBS may have overwritten patches. Check hotkeys.');
  }

  // ═══════════════════════════════════════════════
  // Done
  // ═══════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════');
  console.log(' Setup complete!');
  console.log('');
  console.log(' Hotkeys:');
  console.log(' ┌─────────────────────────────────────────────┐');
  console.log(' │ NUMPAD        Live Stream    Alfred Scholar  │');
  console.log(' │ ─────────     ───────────    ──────────────  │');
  console.log(' │ Num 1         Starting Soon  Shift: Demo     │');
  console.log(' │ Num 2         Main Camera    Shift: Talking  │');
  console.log(' │ Num 3         Screen Share   Shift: Feature  │');
  console.log(' │ Num 4         Split View     Shift: Compare  │');
  console.log(' │ Num 5         BRB            Shift: Review   │');
  console.log(' │ Num 6         Ending         Shift: CTA      │');
  console.log(' │ Num 7         IG Camera      Shift: IG Demo  │');
  console.log(' │ Num 8         IG Screen      Shift: IG Talk  │');
  console.log(' │ Num 9         IG Starting    Shift: IG Feat  │');
  console.log(' │ Num 0         —              Shift: IG CTA   │');
  console.log(' └─────────────────────────────────────────────┘');
  console.log('');
  console.log(' Transition: Fade (300ms)');
  console.log('');
  console.log(' Scene prefixes:');
  console.log('   [LS] / [LS-IG] = Live Stream (YT / IG)');
  console.log('   [AS] / [AS-IG] = Alfred Scholar (YT / IG)');
  console.log('══════════════════════════════════════════');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
