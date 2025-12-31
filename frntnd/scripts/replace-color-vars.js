const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const srcDir = path.join(workspaceRoot, 'src');

function walk(dir, exts, excludePredicate, results = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (excludePredicate && excludePredicate(p)) continue;
      walk(p, exts, excludePredicate, results);
    } else {
      const ext = path.extname(it.name).toLowerCase();
      if (exts.includes(ext)) results.push(p);
    }
  }
  return results;
}

function replaceHexesInFile(filePath, hexes) {
  let txt = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Avoid replacing inside theme files or if file already contains the var usage
  for (const h of hexes) {
    const name = `--c-${h.slice(1).toLowerCase()}`;
    // regex: match the exact hex code not already preceded by '--c-' or 'var('
    const re = new RegExp(`(?<!var\(|--c-)(${h.replace('#', '\\#')})\\b`, 'gi');
    if (re.test(txt)) {
      txt = txt.replace(re, `var(${name}, ${h})`);
      changed = true;
    }
  }

  if (changed) {
    const backup = filePath + '.bak';
    if (!fs.existsSync(backup)) fs.writeFileSync(backup, fs.readFileSync(filePath, 'utf8'), 'utf8');
    fs.writeFileSync(filePath, txt, 'utf8');
  }

  return changed;
}

function findHexesInFiles(files) {
  const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
  const set = new Set();
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = hexRe.exec(txt))) {
      set.add('#' + m[1].toLowerCase());
    }
  }
  return Array.from(set).sort();
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.error('Cannot find src directory:', srcDir);
    process.exit(1);
  }

  // scan for component files (exclude themes)
  const componentFiles = walk(srcDir, ['.css', '.scss', '.html', '.ts'], (p) =>
    p.includes(path.join('assets', 'design-system', 'themes'))
  );
  const hexes = findHexesInFiles(componentFiles);
  if (hexes.length === 0) {
    console.log('No hex literals found to replace.');
    return;
  }

  console.log('Found', hexes.length, 'unique hex codes to consider.');

  let totalChanged = 0;
  for (const f of componentFiles) {
    const ok = replaceHexesInFile(f, hexes);
    if (ok) {
      console.log('Updated', f);
      totalChanged++;
    }
  }

  console.log(`Done. Files changed: ${totalChanged}`);
  console.log('Note: backups created with .bak extension. Review changes before committing.');
}

main();
