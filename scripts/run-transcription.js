#!/usr/bin/env node
/**
 * Starts the DrAITranscription Flask server (app.py).
 * Uses the venv in DrAITranscription if present, otherwise system python.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const transcriptionDir = path.join(repoRoot, 'DrAITranscription');
const isWin = process.platform === 'win32';
const appPy = path.join(transcriptionDir, 'app.py');

const python = isWin ? 'py' : 'python3';
const pythonArgs = isWin ? ['-3.11', '-u', appPy] : ['-u', appPy];

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
