#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { connect, cleanSlate, removeTemp } from "./utils.js";

const SCENE_COLLECTION_DIR = path.join(
  process.env.HOME,
  "Library/Application Support/obs-studio/basic/scenes",
);
const SCENE_FILE = path.join(SCENE_COLLECTION_DIR, "Untitled.json");

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
    await cleanSlate(obs);

    if (profileName) {
      let setupFn;
      try {
        const profilePath = new URL(
          `./scenes/${profileName}.js`,
          import.meta.url,
        ).href;
        const mod = await import(profilePath);
        if (typeof mod.setup !== "function")
          throw new Error(`scenes/${profileName}.js has no setup() export`);
        setupFn = mod.setup;
        console.log(`Loaded profile: "${profileName}"\n`);
      } catch (e) {
        const available = fs
          .readdirSync(new URL("./scenes", import.meta.url))
          .filter((f) => f.endsWith(".js"))
          .map((f) => f.replace(".js", ""));
        console.error(`Unknown profile: "${profileName}"`);
        console.error(`Available: ${available.join(", ")}`);
        console.error(`Error: ${e.message}`);
        process.exit(1);
      }
      await setupFn(obs);
    } else {
      const available = fs
        .readdirSync(new URL("./scenes", import.meta.url))
        .filter((f) => f.endsWith(".js"))
        .map((f) => f.replace(".js", ""));
      if (available.length === 0) {
        console.error(
          "No profiles found. Run /obs-setup in Claude Code to generate one.",
        );
        process.exit(1);
      }
      console.error(`Specify a profile with --profile <name>`);
      console.error(`Available: ${available.join(", ")}`);
      process.exit(1);
    }

    await removeTemp(obs);

    // Read back the canvas size the profile set
    const videoSettings = await obs.call("GetVideoSettings");
    const W = videoSettings.baseWidth;
    const H = videoSettings.baseHeight;

    await obs.call("SetCurrentSceneTransition", { transitionName: "Fade" });
    await obs.call("SetCurrentSceneTransitionDuration", {
      transitionDuration: 300,
    });

    await obs.disconnect();
    console.log("\nPhase 1 complete: scenes created via WebSocket\n");

    // ═══════════════════════════════════════════════
    // Phase 2: Quit OBS, patch profile config, restart
    // ═══════════════════════════════════════════════
    console.log("Phase 2: Patching recording output settings...\n");

    console.log("  Quitting OBS...");
    execSync("pkill -TERM -x OBS || true");

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

    // ── Hide screen capture audio from mixer (set mixers bitmask to 0) ──
    if (fs.existsSync(SCENE_FILE)) {
      const data = JSON.parse(fs.readFileSync(SCENE_FILE, "utf8"));
      for (const source of data.sources) {
        if (source.name === "[TT] Screen Capture") {
          source.mixers = 0; // hides from Audio Mixer entirely
          console.log('  Patched: "[TT] Screen Capture" hidden from Audio Mixer');
        }
      }
      fs.writeFileSync(SCENE_FILE, JSON.stringify(data, null, 2));
    }

    // ── Recording output: ProRes 422 HW, best audio ──
    const profileDir = path.join(
      process.env.HOME,
      "Library/Application Support/obs-studio/basic/profiles/Untitled",
    );
    const profileFile = path.join(profileDir, "basic.ini");
    if (fs.existsSync(profileFile)) {
      let profile = fs.readFileSync(profileFile, "utf8");

      // Remove existing sections to rewrite cleanly
      profile = profile.replace(/\[Output\][\s\S]*?(?=\n\[|$)/, "");
      profile = profile.replace(/\[AdvOut\][\s\S]*?(?=\n\[|$)/, "");
      profile = profile.replace(/\[Video\][\s\S]*?(?=\n\[|$)/, "");
      profile = profile.replace(/\[Audio\][\s\S]*?(?=\n\[|$)/, "");

      // Remove stale audio device entries and let OBS use what the profile sets
      profile = profile.replace(/AuxAudioDevice1=.*/g, "");
      profile = profile.replace(/DesktopAudioDevice1=.*/g, "");

      profile += `
[Output]
Mode=Advanced

[AdvOut]
RecType=Standard
RecEncoder=com.apple.videotoolbox.videoencoder.appleproreshw.422
RecFormat=mov
RecFilePath=${process.env.HOME}/Downloads/recordings
RecTracks=3
Rescale=false
RecRescaleRes=${W}x${H}
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

[Video]
BaseCX=${W}
BaseCY=${H}
OutputCX=${W}
OutputCY=${H}
FPSType=0
FPSCommon=30
ScaleType=lanczos
ColorFormat=NV12
ColorSpace=709
ColorRange=2
`;

      fs.writeFileSync(profileFile, profile);
      console.log(`  Recording: ProRes 422 HW → ${W}x${H} MOV`);
      console.log("  Audio: 48kHz Stereo, 3 tracks @ 320kbps");
    }

    // ProRes 422 encoder config
    const recEncoderFile = path.join(profileDir, "recordEncoder.json");
    fs.writeFileSync(
      recEncoderFile,
      JSON.stringify({ codec_type: 1634755438 }, null, 2),
    );
    console.log("  Encoder: ProRes 422 Hardware");

    // WebSocket config
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
    console.log("  WebSocket preserved (port 4455, no auth)");

    // Kill existing auto-extract
    execSync(
      "kill $(cat /tmp/obs-auto-extract.pid 2>/dev/null) 2>/dev/null || true",
    );

    // Restart OBS
    console.log("\n  Restarting OBS...");
    execSync("open -a OBS");
    await sleep(5000);

    // Start auto-extract watcher
    const autoExtract = new URL("./auto-extract.js", import.meta.url).pathname;
    execSync(`node "${autoExtract}" &>/tmp/obs-auto-extract.log &`, {
      shell: "/bin/zsh",
    });
    console.log("  Auto-extract watcher started");

    // Done
    console.log("\n══════════════════════════════════════════");
    console.log(` Setup complete! ${W}x${H} Recording Ready`);
    console.log("");
    console.log(" Recording outputs:");
    console.log(" ┌──────────────────────────────────────────────────┐");
    console.log(` │ Combined      ProRes 422 HW      ${W}x${H}  .mov   │`);
    console.log(` │ Screen ISO    H.264 HW 30Mbps    ${W}x${H}  .mkv   │`);
    console.log(` │ Camera ISO    H.264 HW 15Mbps    ${W}x${H}  .mkv   │`);
    console.log(" │ Mic           PCM 16-bit         48kHz   .wav   │");
    console.log(" │ System Audio  PCM 16-bit         48kHz   .wav   │");
    console.log(" └──────────────────────────────────────────────────┘");
    console.log("");
    console.log(" Files: ~/Downloads/recordings/<timestamp>/");
    console.log("══════════════════════════════════════════");
  } catch (err) {
    console.error("Setup failed:", err.message);
    await obs.disconnect().catch(() => {});
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();
