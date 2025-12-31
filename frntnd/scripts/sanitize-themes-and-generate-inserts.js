const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const themesDir = path.join(workspaceRoot, 'src', 'assets', 'design-system', 'themes');
const outSql = path.join(__dirname, 'insert-adm-temas.sql');

if (!fs.existsSync(themesDir)) {
  console.error('Themes directory not found:', themesDir);
  process.exit(1);
}

function readTheme(file) {
  return fs.readFileSync(file, 'utf8');
}

function extractVars(cssText) {
  // Match CSS variable declarations like: --name: value;
  const re = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  const vars = {};
  let m;
  while ((m = re.exec(cssText))) {
    const key = `--${m[1].trim()}`;
    const raw = m[2].trim();
    // remove trailing comments
    const val = raw.replace(/\/\*.*?\*\//g, '').trim();
    vars[key] = val;
  }
  return vars;
}

function sanitizeAndWrite(themeFile, vars) {
  const backup = themeFile + '.bak';
  if (!fs.existsSync(backup)) {
    fs.copyFileSync(themeFile, backup);
  }

  const lines = [':root {'];
  for (const k of Object.keys(vars)) {
    lines.push(`  ${k}: ${vars[k]};`);
  }
  lines.push('}');

  fs.writeFileSync(themeFile, lines.join('\n') + '\n', 'utf8');
}

function jsonEscape(obj) {
  // Returns compact JSON string with double quotes escaped for SQL single-quoted literal safety
  return JSON.stringify(obj);
}

function makeInsertRows(themeInfos) {
  // Build SQL rows list
  const rows = themeInfos.map((info) => {
    const clave = info.clave.replace(/'/g, "''");
    const nombre = info.nombre.replace(/'/g, "''");
    const descripcion = info.descripcion.replace(/'/g, "''");
    const tipo = info.tipo;
    const cssVarsJson = jsonEscape(info.css_vars).replace(/'/g, "''");
    const preview = info.preview.replace(/'/g, "''");
    const publico = info.publico ? 1 : 0;
    const activo = info.activo ? 1 : 0;
    const creado_por = info.creado_por || 1;

    return `('${clave}','${nombre}','${descripcion}','${tipo}', '${cssVarsJson}', '${preview}',${publico},${activo},${creado_por})`;
  });
  return rows.join(',\n');
}

function buildThemeInfoFromFile(file) {
  const name = path.basename(file, '.css');
  const txt = readTheme(file);
  const vars = extractVars(txt);

  const css_vars = {};
  // reduce values to simple strings: if value contains unquoted strings, keep as-is
  for (const k of Object.keys(vars)) {
    css_vars[k] = vars[k];
  }

  const info = {
    clave: name,
    nombre: name.charAt(0).toUpperCase() + name.slice(1),
    descripcion: `Tema ${name}`,
    tipo: 'builtin',
    css_vars,
    preview: `/assets/img/themes/${name}.png`,
    publico: 1,
    activo: 1,
    creado_por: 1,
  };
  return info;
}

function main() {
  const files = fs.readdirSync(themesDir).filter((f) => f.endsWith('.css'));
  if (files.length === 0) {
    console.log('No theme files found in', themesDir);
    return;
  }

  const themeInfos = [];
  for (const f of files) {
    const fp = path.join(themesDir, f);
    console.log('Processing', f);
    const txt = readTheme(fp);
    const vars = extractVars(txt);
    if (Object.keys(vars).length === 0) {
      console.warn('  No css variables found, skipping sanitize for', f);
      continue;
    }

    // sanitize file (write :root with only vars)
    sanitizeAndWrite(fp, vars);
    const info = buildThemeInfoFromFile(fp);
    themeInfos.push(info);
  }

  if (themeInfos.length === 0) {
    console.log('No themes processed. Exiting.');
    return;
  }

  const header = `-- Generated INSERTs for adm_temas\n-- Created by sanitize-themes-and-generate-inserts.js\n\nINSERT INTO adm_temas (clave,nombre,descripcion,tipo,css_vars,preview,publico,activo,creado_por) VALUES\n`;
  const rows = makeInsertRows(themeInfos);
  const sql = header + rows + ';\n';
  fs.writeFileSync(outSql, sql, 'utf8');
  console.log('Wrote SQL inserts to', outSql);
  console.log(
    'Backups created with .bak extension next to original theme files. Review before committing.'
  );
}

main();
