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
const jsonOutput = process.argv.includes('--json');
const fromRef = readArg('--from');
const toRef = readArg('--to');

const sourceContent = readFileSync(environmentFiles[0], 'utf8');
const currentVersion = readVersion(sourceContent);
const analysis = analyzeChanges(fromRef, toRef);
const nextVersion = incrementVersion(currentVersion, analysis.bumpType);

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

if (jsonOutput) {
  process.stdout.write(
    JSON.stringify({
      currentVersion: formatVersion(currentVersion),
      nextVersion,
      bumpType: analysis.bumpType,
      reasons: analysis.reasons,
      stats: analysis.stats,
    }),
  );
} else {
  process.stdout.write(nextVersion);
}

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

function incrementVersion([major, minor, patch], bumpType) {
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function formatVersion([major, minor, patch]) {
  return `${major}.${minor}.${patch}`;
}

function analyzeChanges(from, to) {
  const range = resolveRange(from, to);
  const commitMessages = readCommitMessages(range);
  const stats = readDiffStats(range);
  const messageBlob = commitMessages.join('\n').toLowerCase();
  const reasons = [];

  if (hasBreakingSignal(messageBlob)) {
    reasons.push('breaking-change-signal');
    return { bumpType: 'major', reasons, stats };
  }

  if (hasFeatureSignal(messageBlob)) {
    reasons.push('feature-signal');
  }

  if (stats.filesChanged >= 14 || stats.totalChanges >= 260) {
    reasons.push('large-change-volume');
  }

  if (reasons.length > 0) {
    return { bumpType: 'minor', reasons, stats };
  }

  reasons.push('default-patch');
  return { bumpType: 'patch', reasons, stats };
}

function hasBreakingSignal(messageBlob) {
  return (
    /\bbreaking\b/.test(messageBlob) ||
    /\bbreaking change\b/.test(messageBlob) ||
    /(^|\n)\w+(\([^)]+\))?!:/.test(messageBlob)
  );
}

function hasFeatureSignal(messageBlob) {
  return (
    /(^|\n)feat(\([^)]+\))?:/.test(messageBlob) ||
    /\bfeature\b/.test(messageBlob) ||
    /\bintroduc(e|ed|es|ing)\b/.test(messageBlob) ||
    /\bimplement(ed|s|ing)?\b/.test(messageBlob) ||
    /\badd(ed|s|ing)?\b/.test(messageBlob) ||
    /\bnew\b/.test(messageBlob)
  );
}

function resolveRange(from, to) {
  if (from && to && !/^0+$/.test(from)) {
    return `${from}..${to}`;
  }

  if (to) {
    return `${to}^!`;
  }

  return 'HEAD^!';
}

function readCommitMessages(range) {
  const result = spawnSync('git', ['log', '--format=%s%n%b', range], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || 'Unable to read commit messages.');
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function readDiffStats(range) {
  const result = spawnSync('git', ['diff', '--shortstat', range], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || 'Unable to read diff stats.');
  }

  const output = result.stdout.trim();
  return {
    filesChanged: extractStat(output, /(\d+)\s+files?\s+changed/),
    insertions: extractStat(output, /(\d+)\s+insertions?\(\+\)/),
    deletions: extractStat(output, /(\d+)\s+deletions?\(-\)/),
    totalChanges:
      extractStat(output, /(\d+)\s+insertions?\(\+\)/) + extractStat(output, /(\d+)\s+deletions?\(-\)/),
  };
}

function extractStat(output, pattern) {
  const match = output.match(pattern);
  return match ? Number(match[1]) : 0;
}

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return '';
  }

  return process.argv[index + 1] || '';
}
