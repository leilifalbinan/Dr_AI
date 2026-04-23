#!/usr/bin/env node
/**
 * Starts the DrAITranscription Flask server (app.py).
 *
 * Python resolution (first match):
 *   DR_AI_PYTHON → VIRTUAL_ENV (active shell venv) → repo .venv_unified → repo .venv
 *   → DrAITranscription/venv → py -3.11 / python3
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const transcriptionDir = path.join(repoRoot, 'DrAITranscription');
const isWin = process.platform === 'win32';
const appPy = path.join(transcriptionDir, 'app.py');

function venvPythonFromRoot(repo, venvFolder) {
  const rel = isWin ? ['Scripts', 'python.exe'] : ['bin', 'python3'];
  const p = path.join(repo, venvFolder, ...rel);
  return existsSync(p) ? p : null;
}

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

const drAiPython = process.env.DR_AI_PYTHON;
const activeVenvPython = pythonFromVirtualEnv();
const nestedVenvWin = path.join(transcriptionDir, 'venv', 'Scripts', 'python.exe');
const nestedVenvUnix = path.join(transcriptionDir, 'venv', 'bin', 'python3');
const nestedVenvUnixAlt = path.join(transcriptionDir, 'venv', 'bin', 'python');

let python;
let pythonArgs;
if (drAiPython && existsSync(drAiPython)) {
  python = drAiPython;
  pythonArgs = ['-u', appPy];
} else if (activeVenvPython) {
  python = activeVenvPython;
  pythonArgs = ['-u', appPy];
} else if (venvPythonFromRoot(repoRoot, '.venv_unified')) {
  python = venvPythonFromRoot(repoRoot, '.venv_unified');
  pythonArgs = ['-u', appPy];
} else if (venvPythonFromRoot(repoRoot, '.venv')) {
  python = venvPythonFromRoot(repoRoot, '.venv');
  pythonArgs = ['-u', appPy];
} else if (isWin && existsSync(nestedVenvWin)) {
  python = nestedVenvWin;
  pythonArgs = ['-u', appPy];
} else if (!isWin && existsSync(nestedVenvUnix)) {
  python = nestedVenvUnix;
  pythonArgs = ['-u', appPy];
} else if (!isWin && existsSync(nestedVenvUnixAlt)) {
  python = nestedVenvUnixAlt;
  pythonArgs = ['-u', appPy];
} else if (isWin) {
  python = 'py';
  pythonArgs = ['-3.11', '-u', appPy];
} else {
  python = 'python3';
  pythonArgs = ['-u', appPy];
}

console.error(`[dev:transcription] Python: ${python}`);

const child = spawn(python, pythonArgs, {
  cwd: transcriptionDir,
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1',
  },
});

child.on('error', (err) => {
  console.error('Failed to start transcription server:', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
