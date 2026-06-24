#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/';
const ELECTRON_CUSTOM_DIR = '{{ version }}';

const projectRoot = path.resolve(__dirname, '..');
const electronRoot = path.join(projectRoot, 'node_modules', 'electron');
const electronPackagePath = path.join(electronRoot, 'package.json');

function log(message) {
  console.log(`[ElectronBinary] ${message}`);
}

function warn(message) {
  console.warn(`[ElectronBinary] ${message}`);
}

function fail(message, error) {
  if (error) {
    console.error(`[ElectronBinary] ${message}:`, error);
  } else {
    console.error(`[ElectronBinary] ${message}`);
  }
  process.exit(1);
}

function readElectronVersion() {
  try {
    return require(electronPackagePath).version;
  } catch (error) {
    fail('Electron package is not installed. Run npm install first', error);
  }
}

function getPlatformPath() {
  const platform = process.env.npm_config_platform || os.platform();

  switch (platform) {
    case 'mas':
    case 'darwin':
      return 'Electron.app/Contents/MacOS/Electron';
    case 'freebsd':
    case 'openbsd':
    case 'linux':
      return 'electron';
    case 'win32':
      return 'electron.exe';
    default:
      fail(`Electron builds are not available on platform: ${platform}`);
  }
}

function isElectronInstalled(version, platformPath) {
  const versionPath = path.join(electronRoot, 'dist', 'version');
  const pathFile = path.join(electronRoot, 'path.txt');
  const executablePath = process.env.ELECTRON_OVERRIDE_DIST_PATH
    ? path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, platformPath)
    : path.join(electronRoot, 'dist', platformPath);

  try {
    const installedVersion = fs.readFileSync(versionPath, 'utf8').replace(/^v/, '');
    const installedPlatformPath = fs.readFileSync(pathFile, 'utf8');

    return (
      installedVersion === version &&
      installedPlatformPath === platformPath &&
      fs.existsSync(executablePath)
    );
  } catch {
    return false;
  }
}

function runElectronInstaller() {
  const installPath = path.join(electronRoot, 'install.js');
  const env = {
    ...process.env,
    ELECTRON_MIRROR:
      process.env.ELECTRON_MIRROR ||
      process.env.npm_config_electron_mirror ||
      ELECTRON_MIRROR,
    ELECTRON_CUSTOM_DIR:
      process.env.ELECTRON_CUSTOM_DIR ||
      process.env.npm_config_electron_custom_dir ||
      ELECTRON_CUSTOM_DIR,
  };

  const result = childProcess.spawnSync(process.execPath, [installPath], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });

  if (result.error) {
    warn(`Electron installer could not run: ${result.error.message}`);
    return false;
  }

  if (result.status !== 0) {
    warn(`Electron installer exited with status ${result.status}`);
    return false;
  }

  return true;
}

function getMirrorOptions() {
  return {
    mirror:
      process.env.ELECTRON_MIRROR ||
      process.env.npm_config_electron_mirror ||
      ELECTRON_MIRROR,
    customDir:
      process.env.ELECTRON_CUSTOM_DIR ||
      process.env.npm_config_electron_custom_dir ||
      ELECTRON_CUSTOM_DIR,
  };
}

function getPlatform() {
  return process.env.npm_config_platform || process.platform;
}

function getArch() {
  let arch = process.env.npm_config_arch || process.arch;

  if (
    getPlatform() === 'darwin' &&
    process.platform === 'darwin' &&
    arch === 'x64' &&
    process.env.npm_config_arch === undefined
  ) {
    try {
      const output = childProcess.execSync('sysctl -in sysctl.proc_translated');
      if (output.toString().trim() === '1') {
        arch = 'arm64';
      }
    } catch {
      // Keep the detected Node architecture when Rosetta detection is unavailable.
    }
  }

  return arch;
}

function runCommand(command, args) {
  const result = childProcess.spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error || result.status !== 0) {
    return false;
  }

  return true;
}

function extractWithSystemTool(zipPath, distPath) {
  fs.rmSync(distPath, { recursive: true, force: true });
  fs.mkdirSync(distPath, { recursive: true });

  if (process.platform === 'win32') {
    const command = [
      'Expand-Archive',
      '-LiteralPath',
      JSON.stringify(zipPath),
      '-DestinationPath',
      JSON.stringify(distPath),
      '-Force',
    ].join(' ');

    if (runCommand('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command])) {
      return;
    }
  }

  if (runCommand('unzip', ['-q', '-o', zipPath, '-d', distPath])) {
    return;
  }

  fail('Could not extract Electron. Install unzip or rerun npm install after clearing the Electron cache');
}

async function installWithSystemExtractor(version, platformPath) {
  const { downloadArtifact } = require('@electron/get');

  log('Electron binary is missing or incomplete; downloading a verified archive');

  const zipPath = await downloadArtifact({
    version,
    artifactName: 'electron',
    checksums: require(path.join(electronRoot, 'checksums.json')),
    platform: getPlatform(),
    arch: getArch(),
    mirrorOptions: getMirrorOptions(),
  });

  log('Extracting Electron archive with the system unzip tool');

  const distPath = process.env.ELECTRON_OVERRIDE_DIST_PATH || path.join(electronRoot, 'dist');
  extractWithSystemTool(zipPath, distPath);

  const distTypeDefPath = path.join(distPath, 'electron.d.ts');
  if (fs.existsSync(distTypeDefPath)) {
    fs.renameSync(distTypeDefPath, path.join(electronRoot, 'electron.d.ts'));
  }

  fs.writeFileSync(path.join(electronRoot, 'path.txt'), platformPath);
}

async function main() {
  const version = readElectronVersion();
  const platformPath = getPlatformPath();

  if (isElectronInstalled(version, platformPath)) {
    log(`Electron ${version} binary is ready`);
    return;
  }

  runElectronInstaller();

  if (isElectronInstalled(version, platformPath)) {
    log(`Electron ${version} binary is ready`);
    return;
  }

  await installWithSystemExtractor(version, platformPath);

  if (!isElectronInstalled(version, platformPath)) {
    fail('Electron binary is still incomplete after reinstalling');
  }

  log(`Electron ${version} binary is ready`);
}

main().catch((error) => {
  fail('Failed to ensure Electron binary', error);
});
