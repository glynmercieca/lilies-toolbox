const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const workspaceRoot = process.cwd();
const environmentFiles = [
  join(workspaceRoot, 'src', 'environments', 'environment.ts'),
  join(workspaceRoot, 'src', 'environments', 'environment.development.ts'),
];
const versionPattern = /version:\s*'(\d+)\.(\d+)\.(\d+)'/;
const shouldStage = process.argv.includes('--stage');

const sourceContent = readFileSync(environmentFiles[0], 'utf8');
const currentVersion = readVersion(sourceContent);
const nextVersion = incrementPatch(currentVersion);

for (const filePath of environmentFiles) {
  const content = readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(versionPattern, `version: '${nextVersion}'`);

  if (updatedContent === content) {
    throw new Error(`Unable to update version in ${filePath}.`);
  }

  writeFileSync(filePath, updatedContent);
}

if (shouldStage) {
  const result = spawnSync('git', ['add', ...environmentFiles], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

process.stdout.write(nextVersion);

function readVersion(content) {
  const match = content.match(versionPattern);
  if (!match) {
    throw new Error('Unable to locate app version.');
  }

  return match.slice(1, 4).map((value) => Number(value));
}

function incrementPatch([major, minor, patch]) {
  return `${major}.${minor}.${patch + 1}`;
}
