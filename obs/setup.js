#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  connect,
  cleanSlate,
  removeTemp,
  assetsPath,
  addMediaSource,
  addExistingSource,
  CANVAS_W,
  CANVAS_H,
} from "./utils.js";
const SCENE_COLLECTION_DIR = path.join(
  process.env.HOME,
  "Library/Application Support/obs-studio/basic/scenes",
);
const SCENE_FILE = path.join(SCENE_COLLECTION_DIR, "Untitled.json");

// Built-in profiles (empty — all profiles loaded dynamically via /obs-setup skill)
const PROFILES = {};

// ═══════════════════════════════════════════════
// Numpad hotkey mappings
// Populated by /obs-setup skill when generating a new profile.
// Modifier tiers: no modifier → Shift → Ctrl → Ctrl+Shift
// ═══════════════════════════════════════════════
const SCENE_HOTKEYS = {
  // ── technical-tutorials [TT] ──────────────────────────────────────────
  '1 [TT] Starting Soon':        { key: 'OBS_KEY_NUM1' },
  '2 [TT] Intro':                { key: 'OBS_KEY_NUM2' },
  '3 [TT] Screen Share':         { key: 'OBS_KEY_NUM3' },
  '4 [TT] Full Camera':          { key: 'OBS_KEY_NUM4' },
  '5 [TT] BRB/Pause':            { key: 'OBS_KEY_NUM5' },
  '6 [TT] Outro':                { key: 'OBS_KEY_NUM6' },
  'S1 [TT-IG] Camera Vertical':  { key: 'OBS_KEY_NUM1', shift: true },
  'S2 [TT-IG] Screen Vertical':  { key: 'OBS_KEY_NUM2', shift: true },
  'S3 [TT-IG] Starting Vertical':{ key: 'OBS_KEY_NUM3', shift: true },
};

async function main() {
  const args = process.argv.slice(2);
  const profileFlag = args.indexOf("--profile");
  const profileName = profileFlag !== -1 ? args[profileFlag + 1] : null;

  console.log("╔══════════════════════════════════════════╗");
  console.log("║     OBS Studio Setup Script              ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // ═══════════════════════════════════════════════
  // Phase 1: WebSocket — create scenes & sources
  // ═══════════════════════════════════════════════
  let obs;
  try {
    obs = await connect();
  } catch {
    console.error("Cannot connect to OBS WebSocket.");
    console.error(
      "Make sure OBS is running with WebSocket enabled (Tools > WebSocket Server Settings, port 4455).",
    );
    process.exit(1);
  }

  try {
    await obs.call("SetVideoSettings", {
      baseWidth: CANVAS_W,
      baseHeight: CANVAS_H,
      outputWidth: CANVAS_W,
      outputHeight: CANVAS_H,
      fpsNumerator: 60,
      fpsDenominator: 1,
    });
    console.log(`Canvas: ${CANVAS_W}x${CANVAS_H} @ 60fps\n`);

    await cleanSlate(obs);

    if (profileName) {
      let setupFn = PROFILES[profileName];
      if (!setupFn) {
        try {
          const profilePath = new URL(
            `./scenes/${profileName}.js`,
            import.meta.url,
          ).href;
          const mod = await import(profilePath);
          if (typeof mod.setup !== "function")
            throw new Error(`scenes/${profileName}.js has no setup() export`);
          setupFn = mod.setup;
          console.log(`Loaded generated profile: "${profileName}"`);
        } catch (e) {
          console.error(`Unknown profile: "${profileName}"`);
          console.error(`Built-in: ${Object.keys(PROFILES).join(", ")}`);
          console.error(`Tried: ./scenes/${profileName}.js — ${e.message}`);
          process.exit(1);
        }
      }
      await setupFn(obs);
    } else {
      const available = (await import('fs')).readdirSync(
        new URL('./scenes', import.meta.url)
      ).filter(f => f.endsWith('.js')).map(f => f.replace('.js', ''));
      if (available.length === 0) {
        console.error('No profiles found. Run /obs-setup in Claude Code to generate one.');
        process.exit(1);
      }
      console.error(`Specify a profile with --profile <name>`);
      console.error(`Available: ${available.join(', ')}`);
      process.exit(1);
    }

    // ── Background Music (loops across ALL scenes) ──
    console.log("\n  Adding background music to all scenes...");
    const { scenes: allScenes } = await obs.call("GetSceneList");
    // Filter out __temp__ scene
    const realScenes = allScenes.filter((s) => s.sceneName !== "__temp__");
    // Create BGM source in the first scene (OBS returns reverse order)
    const firstScene = realScenes[realScenes.length - 1].sceneName;
    await addMediaSource(
      obs,
      firstScene,
      "BGM",
      assetsPath("assets/bgm-placeholder.wav"),
      true,
      {},
    );
    // Add to all other scenes
    for (const s of realScenes) {
      if (s.sceneName === firstScene) continue;
      try {
        await addExistingSource(obs, s.sceneName, "BGM", {});
      } catch {
        /* already added */
      }
    }
    // Set BGM volume low (-20dB) so it's subtle background
    await obs.call("SetInputVolume", { inputName: "BGM", inputVolumeDb: -20 });
    console.log("  BGM added to all scenes at -20dB\n");

    await removeTemp(obs);

    await obs.call("SetCurrentSceneTransition", { transitionName: "Fade" });
    await obs.call("SetCurrentSceneTransitionDuration", {
      transitionDuration: 300,
    });

    // Scene 2 is set as active by each profile's setup() function

    // Save the scene collection so it's written to disk
    await obs.call("SaveReplayBuffer").catch(() => {});

    await obs.disconnect();
    console.log("\nPhase 1 complete: scenes created via WebSocket\n");
  } catch (err) {
    console.error("Phase 1 failed:", err.message);
    await obs.disconnect().catch(() => {});
    process.exit(1);
  }

  // ═══════════════════════════════════════════════
  // Phase 2: Quit OBS, patch JSON, restart OBS
  // ═══════════════════════════════════════════════
  console.log("Phase 2: Patching config for transitions + hotkeys...\n");

  // Quit OBS gracefully via SIGTERM (allows it to save config)
  console.log("  Quitting OBS...");
  execSync("pkill -TERM -x OBS || true");

  // Wait until OBS is fully dead
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    try {
      execSync("pgrep -x OBS", { stdio: "ignore" });
    } catch {
      break;
    }
    if (i === 10) execSync("pkill -9 -x OBS 2>/dev/null || true");
  }
  console.log("  OBS stopped");

  // Verify scene file exists
  if (!fs.existsSync(SCENE_FILE)) {
    console.error(`Scene file not found: ${SCENE_FILE}`);
    console.error(
      "OBS may not have saved the config. Try running setup again.",
    );
    process.exit(1);
  }

  // Backup
  const backup = SCENE_FILE + ".pre-patch.bak";
  fs.copyFileSync(SCENE_FILE, backup);

  const data = JSON.parse(fs.readFileSync(SCENE_FILE, "utf8"));
  let patchCount = 0;

  // ── Stinger transition (uses transition.webm if present, else Fade) ──
  const stingerVideoPath = assetsPath("assets/transition.webm");
  const hasStinger = fs.existsSync(stingerVideoPath);

  // YouTube scenes that should use the stinger (switching away from them triggers it)
  const STINGER_SCENES = new Set([
    '1 [TT] Starting Soon',
    '2 [TT] Intro',
    '3 [TT] Screen Share',
    '4 [TT] Full Camera',
    '5 [TT] BRB/Pause',
    '6 [TT] Outro',
  ]);
  const CUT_SCENES = new Set(); // no cut-only scenes

  if (hasStinger) {
    // Inject Stinger transition into transitions array (replace if already present)
    if (!data.transitions) data.transitions = [];
    data.transitions = data.transitions.filter(t => t.name !== 'Stinger');
    data.transitions.push({
      id: 'obs_stinger_transition',
      name: 'Stinger',
      settings: {
        path: stingerVideoPath,
        transition_point_type: 0, // 0 = Time (ms)
        transition_point: 500,    // cut at 500ms — adjust if clip is longer/shorter
        audio_fade_style: 0,
        monitor_audio: false,
      },
    });
    data.current_transition = 'Stinger';
    data.transition_duration = 1000;
    console.log(`  Transition: Stinger (1000ms, cut @ 500ms) → ${stingerVideoPath}`);
  } else {
    data.current_transition = 'Fade';
    data.transition_duration = 300;
    console.log('  Transition: Fade (300ms) — add transition.webm to enable Stinger');
  }
  patchCount++;

  // ── Numpad hotkeys ──
  for (const source of data.sources) {
    if (source.id !== "scene") continue;
    const hotkey = SCENE_HOTKEYS[source.name];
    if (hotkey) {
      source.hotkeys["OBSBasic.SelectScene"] = [
        {
          key: hotkey.key,
          shift: hotkey.shift || false,
          control: false,
          alt: false,
          command: false,
        },
      ];
      const label =
        (hotkey.shift ? "Shift+" : "") + hotkey.key.replace("OBS_KEY_", "");
      console.log(`  Hotkey: ${label} → "${source.name}"`);
      patchCount++;
    }
  }

  // ── Per-scene transition overrides ──
  if (hasStinger) {
    for (const source of data.sources) {
      if (source.id !== 'scene') continue;
      if (STINGER_SCENES.has(source.name)) {
        source.private_settings = {
          ...source.private_settings,
          transition: 'Stinger',
          transition_duration: 1000,
        };
        console.log(`  Scene override: "${source.name}" → Stinger`);
        patchCount++;
      } else if (CUT_SCENES.has(source.name)) {
        source.private_settings = {
          ...source.private_settings,
          transition: 'Cut',
          transition_duration: 50,
        };
        console.log(`  Scene override: "${source.name}" → Cut`);
        patchCount++;
      }
    }
  }

  // Write patched config
  fs.writeFileSync(SCENE_FILE, JSON.stringify(data, null, 2));
  console.log(`\n  ${patchCount} patches applied`);

  // ── Set global audio devices + recording/streaming output in profile ──
  const profileDir = path.join(
    process.env.HOME,
    "Library/Application Support/obs-studio/basic/profiles/Untitled",
  );
  const profileFile = path.join(profileDir, "basic.ini");
  if (fs.existsSync(profileFile)) {
    let profile = fs.readFileSync(profileFile, "utf8");
    // Add global audio devices if not present
    if (!profile.includes("AuxAudioDevice1")) {
      profile = profile.replace(
        "[Audio]\n",
        "[Audio]\nAuxAudioDevice1=BuiltInMicrophoneDevice\nDesktopAudioDevice1=default\n",
      );
      console.log("  Global audio: Mic + Desktop Audio set in profile");
      patchCount++;
    }

    // ── Recording output settings (priority: recording quality for YT/IG) ──
    // Remove existing output sections to rewrite them cleanly
    profile = profile.replace(/\[Output\][\s\S]*?(?=\n\[|$)/, '');
    profile = profile.replace(/\[AdvOut\][\s\S]*?(?=\n\[|$)/, '');
    profile = profile.replace(/\[Video\][\s\S]*?(?=\n\[|$)/, '');

    // Use Advanced output mode with Apple VT H.265 hardware encoder
    // CRF/quality-based encoding = sharp at any bitrate, small files
    profile += `
[Output]
Mode=Advanced

[AdvOut]
RecType=Standard
RecEncoder=com.apple.videotoolbox.videoencoder.ave.avc
RecFormat=mp4
RecFilePath=${process.env.HOME}/Downloads/recordings
RecTracks=1
RecMuxerCustom=
Rescale=false
RecRescaleRes=1920x1080
FFOutputToFile=true
StreamEncoder=com.apple.videotoolbox.videoencoder.ave.hevc
FFVBitrate=6000
FFABitrate=320
TrackIndex=0
StreamTrack=1
VodTrackIndex=2
VodTrackEnabled=false
Track1Bitrate=320
Track2Bitrate=160
Track3Bitrate=160
Track4Bitrate=160
Track5Bitrate=160
Track6Bitrate=160

[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSType=0
FPSCommon=60
ScaleType=lanczos
ColorFormat=NV12
ColorSpace=709
ColorRange=2
`;

    fs.writeFileSync(profileFile, profile);
    console.log("  Recording: Apple VT H.264, MP4, 1080p60, quality-based encoding");
    console.log("  Streaming: Apple VT H.265, 6000kbps");
    patchCount++;
  }

  // ── Write encoder settings for recording (high quality CRF) ──
  const recEncoderFile = path.join(profileDir, "recordEncoder.json");
  fs.writeFileSync(recEncoderFile, JSON.stringify({
    rate_control: "CRF",
    quality: 18,         // CRF 18 = visually lossless, great for YT upload
    profile: "high",
    bf: 2,
    prio_speed: false,   // prioritize quality over speed
    max_bitrate: 40000,  // cap at 40Mbps (more than enough for 1080p60)
  }, null, 2));
  console.log("  Recording encoder: H.264 CRF 18 (near-lossless quality)");

  // ── Write encoder settings for streaming ──
  const streamEncoderFile = path.join(profileDir, "streamEncoder.json");
  fs.writeFileSync(streamEncoderFile, JSON.stringify({
    rate_control: "CBR",
    bitrate: 6000,       // 6Mbps CBR for YouTube live
    profile: "main",
    bf: 2,
    prio_speed: true,    // prioritize speed for real-time streaming
  }, null, 2));
  console.log("  Stream encoder: CBR 6000kbps (YouTube recommended)");

  // ── Ensure WebSocket stays enabled after restart ──
  const wsConfigDir = path.join(
    process.env.HOME,
    "Library/Application Support/obs-studio/plugin_config/obs-websocket",
  );
  const wsConfigFile = path.join(wsConfigDir, "config.json");
  fs.mkdirSync(wsConfigDir, { recursive: true });
  fs.writeFileSync(
    wsConfigFile,
    JSON.stringify(
      {
        server_enabled: true,
        server_port: 4455,
        auth_required: false,
        alerts_enabled: true,
        first_load: false,
      },
      null,
      2,
    ),
  );
  console.log("  WebSocket config preserved (port 4455, no auth)");

  // ── Verify patch before restart ──
  const verify = JSON.parse(fs.readFileSync(SCENE_FILE, "utf8"));
  const hotkeyCount = verify.sources.filter(
    (s) => s.id === "scene" && s.hotkeys?.["OBSBasic.SelectScene"]?.length > 0,
  ).length;
  console.log(
    `  Verified: ${hotkeyCount} hotkeys, transition="${verify.current_transition}"`,
  );
  if (hotkeyCount === 0) {
    console.error(
      "  ERROR: Patches did not persist! Check if OBS is fully stopped.",
    );
    process.exit(1);
  }

  // ── Restart OBS ──
  console.log("\n  Restarting OBS...");
  execSync("open -a OBS");
  await sleep(5000);

  // ── Verify OBS loaded our config ──
  const final = JSON.parse(fs.readFileSync(SCENE_FILE, "utf8"));
  const finalHotkeys = final.sources.filter(
    (s) => s.id === "scene" && s.hotkeys?.["OBSBasic.SelectScene"]?.length > 0,
  ).length;
  if (finalHotkeys > 0) {
    console.log("  OBS loaded patched config successfully");
  } else {
    console.error(
      "  WARNING: OBS may have overwritten patches. Check hotkeys.",
    );
  }

  // ═══════════════════════════════════════════════
  // Done
  // ═══════════════════════════════════════════════
  console.log("\n══════════════════════════════════════════");
  console.log(" Setup complete!");
  console.log("");
  console.log(" Hotkeys:");
  console.log(" ┌─────────────────────────────────────────────┐");
  console.log(" │ NUMPAD        Live Stream    Alfred Scholar  │");
  console.log(" │ ─────────     ───────────    ──────────────  │");
  console.log(" │ Num 1         Starting Soon  Shift: Demo     │");
  console.log(" │ Num 2         Main Camera    Shift: Talking  │");
  console.log(" │ Num 3         Screen Share   Shift: Feature  │");
  console.log(" │ Num 4         Split View     Shift: Compare  │");
  console.log(" │ Num 5         BRB            Shift: Review   │");
  console.log(" │ Num 6         Ending         Shift: CTA      │");
  console.log(" │ Num 7         IG Camera      Shift: IG Demo  │");
  console.log(" │ Num 8         IG Screen      Shift: IG Talk  │");
  console.log(" │ Num 9         IG Starting    Shift: IG Feat  │");
  console.log(" │ Num 0         —              Shift: IG CTA   │");
  console.log(" └─────────────────────────────────────────────┘");
  console.log("");
  console.log(" Transition: Fade (300ms)");
  console.log("");
  console.log(" Scene prefixes:");
  console.log("   [LS] / [LS-IG] = Live Stream (YT / IG)");
  console.log("   [AS] / [AS-IG] = Alfred Scholar (YT / IG)");
  console.log("══════════════════════════════════════════");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
