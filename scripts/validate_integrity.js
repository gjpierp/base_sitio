const fs = require("fs");
const path = require("path");

const entitiesDir = path.resolve(
  __dirname,
  "..",
  "bcknd",
  "entities",
  "db_vvff_admin"
);
const modelsDir = path.resolve(__dirname, "..", "bcknd", "models");
const outJson = path.resolve(__dirname, "integrity_report.json");

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return null;
  }
}

function tokenize(content) {
  const tokens = new Set();
  if (!content) return tokens;
  const re = /\b[a-zA-Z0-9_]+\b/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    tokens.add(m[0].toLowerCase());
  }
  // remove common JS keywords
  const blacklist = new Set([
    "function",
    "const",
    "let",
    "var",
    "return",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "break",
    "new",
    "require",
    "module",
    "exports",
    "async",
    "await",
    "true",
    "false",
    "null",
    "undefined",
    "try",
    "catch",
    "class",
    "extends",
    "constructor",
    "console",
    "await",
    "then",
  ]);
  for (const b of blacklist) tokens.delete(b);
  return tokens;
}

const report = { generatedAt: new Date().toISOString(), tables: [] };

if (!fs.existsSync(entitiesDir)) {
  console.error("Entities directory not found:", entitiesDir);
  process.exit(1);
}

const files = fs.readdirSync(entitiesDir).filter((f) => f.endsWith(".json"));
for (const file of files) {
  const table = path.basename(file, ".json");
  const entity = readJson(path.join(entitiesDir, file));
  const normalize = (s) =>
    (s || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const entityCols =
    entity && entity.columns
      ? entity.columns.map((c) => normalize(c.name))
      : [];

  const modelFile = path.join(modelsDir, `${table}.js`);
  const modelExists = fs.existsSync(modelFile);
  const modelContent = modelExists ? fs.readFileSync(modelFile, "utf8") : "";
  const tokens = Array.from(tokenize(modelContent));

  const usedColumns = entityCols.filter((c) => tokens.includes(c));
  const missingInModel = entityCols.filter((c) => !tokens.includes(c));
  const extraInModel = tokens.filter((t) => {
    // consider likely column tokens: start with id_ or contain _ and not numeric
    if (/^\d+$/.test(t)) return false;
    if (entityCols.includes(t)) return false;
    return /^id_|_/.test(t) || t.endsWith("id") || t.startsWith("id");
  });

  report.tables.push({
    table,
    modelExists,
    entityColumns: entityCols,
    usedColumns,
    missingInModel,
    extraInModel,
  });
}

fs.writeFileSync(outJson, JSON.stringify(report, null, 2), "utf8");
console.log("Reporte generado:", outJson);
console.log("Resumen:");
for (const t of report.tables) {
  console.log(
    `- ${t.table}: modelExists=${t.modelExists}, entityCols=${t.entityColumns.length}, missing=${t.missingInModel.length}, extraTokens=${t.extraInModel.length}`
  );
}

process.exit(0);
