#!/usr/bin/env node
/**
 * Bootstrap local development in one command.
 *
 * What it does:
 * 1) Ensure Python 3.11 venv exists at .venv_unified
 * 2) Upgrade pip and install requirements-unified.txt
 * 3) Run npm install
 * 4) Start app with npm run dev
 *
 * Re-runnable safely any time.
 */
import { spawnSync, spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

const venvDir = path.join(repoRoot, ".venv_unified");
const pythonInVenv = isWin
  ? path.join(venvDir, "Scripts", "python.exe")
  : path.join(venvDir, "bin", "python3");

function runOrExit(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.status !== 0) {
    if (result.error) {
      console.error(`[bootstrap] Spawn error: ${result.error.message}`);
    }
    console.error(
      `[bootstrap] Command failed (${result.status ?? "unknown"}): ${command} ${args.join(" ")}`
    );
    process.exit(result.status ?? 1);
  }
}

function resolveSystemPython() {
  if (isWin) {
    const pyCheck = spawnSync("py", ["-3.11", "--version"], {
      cwd: repoRoot,
      stdio: "ignore",
      shell: false,
    });
    if (pyCheck.status === 0) return { cmd: "py", args: ["-3.11"] };

    const pythonCheck = spawnSync("python", ["--version"], {
      cwd: repoRoot,
      stdio: "ignore",
      shell: false,
    });
    if (pythonCheck.status === 0) return { cmd: "python", args: [] };
  } else {
    const py311Check = spawnSync("python3.11", ["--version"], {
      cwd: repoRoot,
      stdio: "ignore",
      shell: false,
    });
    if (py311Check.status === 0) return { cmd: "python3.11", args: [] };

    const py3Check = spawnSync("python3", ["--version"], {
      cwd: repoRoot,
      stdio: "ignore",
      shell: false,
    });
    if (py3Check.status === 0) return { cmd: "python3", args: [] };
  }

  console.error("Could not find a Python interpreter (3.11 recommended).");
  process.exit(1);
}

console.log("\n[bootstrap] Ensuring Python virtual environment...");
if (!existsSync(pythonInVenv)) {
  const sysPy = resolveSystemPython();
  runOrExit(sysPy.cmd, [...sysPy.args, "-m", "venv", ".venv_unified"]);
} else {
  console.log("[bootstrap] Reusing existing .venv_unified");
}

console.log("\n[bootstrap] Installing Python dependencies...");
runOrExit(pythonInVenv, ["-m", "pip", "install", "--upgrade", "pip"]);
runOrExit(pythonInVenv, ["-m", "pip", "install", "-r", "requirements-unified.txt"]);

const npmCmd = "npm";
const npmOptions = isWin ? { shell: true } : {};

console.log("\n[bootstrap] Installing npm dependencies...");
runOrExit(npmCmd, ["install"], npmOptions);

console.log("\n[bootstrap] Starting app (npm run dev)...");
const child = spawn(npmCmd, ["run", "dev"], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: isWin,
  env: {
    ...process.env,
    DR_AI_PYTHON: pythonInVenv,
  },
});

child.on("error", (err) => {
  console.error(`[bootstrap] Failed to start app: ${err.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
