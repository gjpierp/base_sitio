const fs = require('fs');
const path = require('path');

const backupDir = path.resolve(__dirname, '..', 'Backup');
const entitiesDir = path.resolve(__dirname, '..', 'bcknd', 'entities', 'db_vvff_admin');

function parseSqlFile(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const createMatch = txt.match(/CREATE TABLE `([^`]+)` \(([\s\S]*?)\) ENGINE=/i);
  if (!createMatch) return null;
  const table = createMatch[1];
  const body = createMatch[2];
  const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const columns = [];
  const primaryKey = [];
  const keys = {};
  const foreignKeys = [];

  for (const line of lines) {
    if (line.startsWith('`')) {
      // column definition
      const m = line.match(/^`([^`]+)`\s+([^,]+)(?:,?)/);
      if (!m) continue;
      const name = m[1];
      const rest = m[2];
      const col = { name };
      col.type = rest.split(/\s+/)[0];
      col.nullable = !/NOT NULL/i.test(rest);
      col.auto_increment = /AUTO_INCREMENT/i.test(rest);
      const defMatch = rest.match(/DEFAULT\s+([^\s,]+)/i);
      if (defMatch) col.default = defMatch[1].replace(/^'/, '').replace(/'$/, '');
      const commentMatch = rest.match(/COMMENT\s+'([^']+)'/i);
      if (commentMatch) col.comment = commentMatch[1];
      columns.push(col);
      continue;
    }
    if (/PRIMARY KEY \(`([^`]+)`\)/i.test(line)) {
      const m = line.match(/PRIMARY KEY \(([^)]+)\)/i);
      if (m) {
        const cols = m[1].split(',').map(s => s.replace(/`/g,'').trim());
        primaryKey.push(...cols);
      }
      continue;
    }
    if (/KEY `([^`]+)` \(`([^`]+)`\)/i.test(line)) {
      const m = line.match(/KEY `([^`]+)` \(([^)]+)\)/i);
      if (m) {
        const keyName = m[1];
        const cols = m[2].split(',').map(s => s.replace(/`/g,'').trim());
        keys[keyName] = cols;
      }
      continue;
    }
    if (/CONSTRAINT `([^`]+)` FOREIGN KEY \(([^)]+)\) REFERENCES `([^`]+)` \(([^)]+)\)/i.test(line)) {
      const m = line.match(/CONSTRAINT `([^`]+)` FOREIGN KEY \(([^)]+)\) REFERENCES `([^`]+)` \(([^)]+)\)/i);
      if (m) {
        const constraint = m[1];
        const cols = m[2].split(',').map(s => s.replace(/`/g,'').trim());
        const refTable = m[3];
        const refCols = m[4].split(',').map(s => s.replace(/`/g,'').trim());
        foreignKeys.push({ constraint, columns: cols, referencedTable: refTable, referencedColumns: refCols });
      }
      continue;
    }
  }

  return { table, columns, primaryKey, keys, foreignKeys };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run() {
  ensureDir(entitiesDir);
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('db_vvff_admin_') && f.endsWith('.sql'));
  const report = [];
  for (const f of files) {
    const p = path.join(backupDir, f);
    const parsed = parseSqlFile(p);
    if (!parsed) {
      report.push({ file: f, status: 'no-create-table' });
      continue;
    }
    const outPath = path.join(entitiesDir, `${parsed.table}.json`);
    const entity = {
      table: parsed.table,
      columns: parsed.columns,
      primaryKey: parsed.primaryKey,
      uniqueKeys: {},
      keys: parsed.keys,
      foreignKeys: parsed.foreignKeys,
    };
    let changed = true;
    if (fs.existsSync(outPath)) {
      const existing = JSON.parse(fs.readFileSync(outPath,'utf8'));
      // quick compare by column names
      const existCols = (existing.columns||[]).map(c=>c.name).join(',');
      const newCols = parsed.columns.map(c=>c.name).join(',');
      changed = existCols !== newCols;
    }
    if (changed) {
      fs.writeFileSync(outPath, JSON.stringify(entity, null, 2), 'utf8');
      report.push({ file: f, table: parsed.table, status: 'created/updated' });
    } else {
      report.push({ file: f, table: parsed.table, status: 'skipped' });
    }
  }
  console.log('Sync report:');
  console.table(report);
}

if (require.main === module) run();
