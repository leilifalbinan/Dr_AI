#!/usr/bin/env node
/**
 * Starts the DrAITranscription Flask server (app.py).
 * Uses the venv in DrAITranscription if present, otherwise system python.
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

const venvPythonWin = path.join(transcriptionDir, 'venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(transcriptionDir, 'venv', 'bin', 'python3');
const venvPythonUnixAlt = path.join(transcriptionDir, 'venv', 'bin', 'python');

let python;
let pythonArgs;
if (isWin && existsSync(venvPythonWin)) {
  python = venvPythonWin;
  pythonArgs = ['-u', appPy];
} else if (!isWin && existsSync(venvPythonUnix)) {
  python = venvPythonUnix;
  pythonArgs = ['-u', appPy];
} else if (!isWin && existsSync(venvPythonUnixAlt)) {
  python = venvPythonUnixAlt;
  pythonArgs = ['-u', appPy];
} else if (isWin) {
  python = 'py';
  pythonArgs = ['-3.11', '-u', appPy];
} else {
  python = 'python3';
  pythonArgs = ['-u', appPy];
}

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
