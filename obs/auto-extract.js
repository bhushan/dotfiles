#!/usr/bin/env node

// Runs in the background and watches for OBS recording stop events.
// When recording stops, automatically extracts audio and organizes the session folder.
//
// Start:  node obs/auto-extract.js &
// Stop:   kill $(cat /tmp/obs-auto-extract.pid)

import OBSWebSocket from 'obs-websocket-js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PID_FILE = '/tmp/obs-auto-extract.pid';
const REC_DIR = path.join(process.env.HOME, 'Downloads/recordings');
const SCRIPT = new URL('./extract-audio.sh', import.meta.url).pathname;

fs.writeFileSync(PID_FILE, String(process.pid));
console.log(`[auto-extract] PID ${process.pid} — watching for recording stops...`);

async function connect() {
  const obs = new OBSWebSocket();
  const url = process.env.OBS_WEBSOCKET_URL || 'ws://localhost:4455';
  const password = process.env.OBS_WEBSOCKET_PASSWORD || undefined;

  obs.on('RecordStateChanged', async (event) => {
    // outputState: OBS_WEBSOCKET_OUTPUT_STOPPED
    if (event.outputState === 'OBS_WEBSOCKET_OUTPUT_STOPPED') {
      const outputPath = event.outputPath;
      console.log(`\n[auto-extract] Recording stopped: ${path.basename(outputPath)}`);
      console.log('[auto-extract] Waiting 3 seconds for ISO files to finish writing...');

      await new Promise(r => setTimeout(r, 3000));

      try {
        const output = execSync(`bash "${SCRIPT}" "${outputPath}"`, {
          encoding: 'utf8',
          timeout: 60000,
        });
        console.log(output);
      } catch (e) {
        console.error('[auto-extract] Extraction failed:', e.message);
      }
    }
  });

  obs.on('ConnectionClosed', () => {
    console.log('[auto-extract] OBS disconnected — reconnecting in 5s...');
    setTimeout(connect, 5000);
  });

  obs.on('ConnectionError', () => {
    setTimeout(connect, 5000);
  });

  try {
    await obs.connect(url, password);
    console.log('[auto-extract] Connected to OBS WebSocket');
  } catch {
    console.log('[auto-extract] OBS not running — retrying in 5s...');
    setTimeout(connect, 5000);
  }
}

connect();
