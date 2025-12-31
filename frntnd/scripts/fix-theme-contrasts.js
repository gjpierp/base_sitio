const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, '..', 'src', 'assets', 'design-system', 'themes');
const reportFile = path.join(__dirname, 'theme-contrast-report.txt');

function walkThemes() {
  if (!fs.existsSync(themesDir)) {
    console.error('Themes directory not found:', themesDir);
    process.exit(1);
  }
  return fs
    .readdirSync(themesDir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => path.join(themesDir, f));
}

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function extractVars(css) {
  const re = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  const vars = {};
  let m;
  while ((m = re.exec(css))) {
    vars[`--${m[1].trim()}`] = m[2].trim();
  }
  return vars;
}

function firstHex(value) {
  const re = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;
  const m = re.exec(value);
  return m ? normalizeHex('#' + m[1]) : null;
}

function normalizeHex(h) {
  if (!h) return null;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    return (
      '#' +
      h
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
        .toLowerCase()
    );
  }
  return h.toLowerCase();
}

function hexToRgb(h) {
  const hx = normalizeHex(h).slice(1);
  return [parseInt(hx.slice(0, 2), 16), parseInt(hx.slice(2, 4), 16), parseInt(hx.slice(4, 6), 16)];
}

function srgbToLinear(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(hex1, hex2) {
  const L1 = luminance(hex1);
  const L2 = luminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return +((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function chooseBestContrast(bgHex) {
  const black = '#000000';
  const white = '#ffffff';
  const cb = contrastRatio(bgHex, black);
  const cw = contrastRatio(bgHex, white);
  return cb >= cw ? '#000000' : '#ffffff';
}

function updateThemeFile(filePath) {
  const original = readFile(filePath);
  const vars = extractVars(original);

  // candidate pairs to check
  const bgKeysPriority = [
    '--bg-main',
    '--bg',
    '--bg-card',
    '--bg-sidebar',
    '--bg-header',
    '--bg-primary',
  ];
  const textKeysPriority = [
    '--color-text',
    '--text',
    '--color-text-inverse',
    '--color',
    '--color-label',
  ];

  let bgHex = null;
  for (const k of bgKeysPriority) {
    if (vars[k]) {
      bgHex = firstHex(vars[k]);
      if (bgHex) break;
    }
  }
  if (!bgHex) {
    // try any var value
    for (const v of Object.values(vars)) {
      const h = firstHex(v);
      if (h) {
        bgHex = h;
        break;
      }
    }
  }
  if (!bgHex) return { changed: false, reason: 'no-bg-hex' };

  const changes = [];
  const newVars = Object.assign({}, vars);

  for (const tk of textKeysPriority) {
    if (vars[tk]) {
      const currentHex = firstHex(vars[tk]);
      if (!currentHex) continue;
      const cr = contrastRatio(bgHex, currentHex);
      if (cr < 4.5) {
        const best = chooseBestContrast(bgHex);
        newVars[tk] = best;
        changes.push({ key: tk, from: currentHex, to: best, ratio: cr });
      }
    }
  }

  if (changes.length === 0) return { changed: false, reason: 'ok' };

  // create backup
  const bak = filePath + '.bak';
  if (!fs.existsSync(bak)) fs.copyFileSync(filePath, bak);

  // replace only variable values in original file to preserve structure and comments
  let out = original;
  for (const c of changes) {
    // replace the value (keep formatting)
    const re = new RegExp(`(${c.key}\s*:\s*)([^;]+)(;)`, 'g');
    out = out.replace(re, (m, p1, p2, p3) => `${p1}${c.to}${p3}`);
  }

  fs.writeFileSync(filePath, out, 'utf8');
  return { changed: true, changes };
}

function main() {
  const themes = walkThemes();
  const report = [];
  for (const t of themes) {
    const res = updateThemeFile(t);
    report.push({ file: t, result: res });
    console.log('Processed', t, res.changed ? 'updated' : res.reason);
  }
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf8');
  console.log('Wrote report to', reportFile);
}

main();
