const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const workspaceRoot = process.cwd();
const localNode = join(workspaceRoot, '.tools', 'node-v22.22.3-win-x64', 'node.exe');
const nodeBinary = existsSync(localNode) ? localNode : process.execPath;
const cliEntrypoint = join(workspaceRoot, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const args = process.argv.slice(2);

const result = spawnSync(nodeBinary, [cliEntrypoint, ...args], {
  cwd: workspaceRoot,
  stdio: 'inherit',
  env: process.env,
  windowsHide: false,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
