#!/usr/bin/env node
/**
 * Starts the Gait Flask server (Gait/gait_api.py) on http://127.0.0.1:8000.
 * Vite proxies /api/gait to that port (see vite.config.js).
 *
 * cwd must be the Gait folder so gait_outputs resolves correctly.
 *
 * Python resolution (first match):
 *   DR_AI_PYTHON → VIRTUAL_ENV → repo .venv_unified → repo .venv → .venv_face → Gait/venv → py -3.11
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const gaitDir = path.join(repoRoot, 'Gait');
const gaitApi = path.join(gaitDir, 'gait_api.py');
const isWin = process.platform === 'win32';

function pythonFromVirtualEnv() {
  const base = process.env.VIRTUAL_ENV;
  if (!base) return null;
  const win = path.join(base, 'Scripts', 'python.exe');
  const unix = path.join(base, 'bin', 'python3');
  const unixAlt = path.join(base, 'bin', 'python');
  if (isWin && existsSync(win)) return win;
  if (!isWin && existsSync(unix)) return unix;
  if (!isWin && existsSync(unixAlt)) return unixAlt;
  return null;
}

function venvPythonFromRoot(venvFolder) {
  const rel = isWin ? ['Scripts', 'python.exe'] : ['bin', 'python3'];
  const p = path.join(repoRoot, venvFolder, ...rel);
  return existsSync(p) ? p : null;
}

// Order: explicit override → same venv as your shell (VIRTUAL_ENV) → repo unified venvs →
// legacy .venv_face / Gait/venv. Do NOT use DrAITranscription/venv here (protobuf vs MediaPipe).
const venvCandidates = [];
const drAiPython = process.env.DR_AI_PYTHON;
if (drAiPython && existsSync(drAiPython)) venvCandidates.push(drAiPython);
const active = pythonFromVirtualEnv();
if (active) venvCandidates.push(active);
const unified = venvPythonFromRoot('.venv_unified');
if (unified) venvCandidates.push(unified);
const dotVenv = venvPythonFromRoot('.venv');
if (dotVenv) venvCandidates.push(dotVenv);
if (isWin) {
  venvCandidates.push(path.join(repoRoot, '.venv_face', 'Scripts', 'python.exe'));
  venvCandidates.push(path.join(gaitDir, 'venv', 'Scripts', 'python.exe'));
} else {
  venvCandidates.push(path.join(repoRoot, '.venv_face', 'bin', 'python3'));
  venvCandidates.push(path.join(gaitDir, 'venv', 'bin', 'python3'));
  venvCandidates.push(path.join(gaitDir, 'venv', 'bin', 'python'));
}

let python;
let pythonArgs;
const found = venvCandidates.find((p) => existsSync(p));
if (found) {
  python = found;
  pythonArgs = ['-u', gaitApi];
} else if (isWin) {
  python = 'py';
  pythonArgs = ['-3.11', '-u', gaitApi];
} else {
  python = 'python3';
  pythonArgs = ['-u', gaitApi];
}

if (!existsSync(gaitApi)) {
  console.error('Gait server not found:', gaitApi);
  process.exit(1);
}

console.error(`[dev:gait] Python: ${python}`);

const child = spawn(python, pythonArgs, {
  cwd: gaitDir,
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1',
  },
});

child.on('error', (err) => {
  console.error('Failed to start gait server:', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
