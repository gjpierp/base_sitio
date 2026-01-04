#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");

const SRC_DIR = path.join(
  __dirname,
  "..",
  "frntnd",
  "src",
  "app",
  "pages",
  "usuarios"
);

function pascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

async function copyTemplate(targetKebab, singularKebab) {
  if (!targetKebab) {
    console.error(
      "Uso: node scripts/generate-page-from-usuarios.js <target-kebab> [singular-kebab]"
    );
    process.exit(1);
  }
  if (!singularKebab) {
    singularKebab = targetKebab.replace(/s$/, "") || targetKebab;
  }
  const destDir = path.join(
    __dirname,
    "..",
    "frntnd",
    "src",
    "app",
    "pages",
    targetKebab
  );

  // Build replacement tokens
  const pluralSrc = "usuarios";
  const singularSrc = "usuario";
  const pluralTarget = targetKebab;
  const singularTarget = singularKebab;
  const PascalPluralSrc = pascalCase(pluralSrc);
  const PascalSingularSrc = pascalCase(singularSrc);
  const PascalPluralTarget = pascalCase(pluralTarget);
  const PascalSingularTarget = pascalCase(singularTarget);

  async function ensureDir(d) {
    await fs.mkdir(d, { recursive: true });
  }

  async function processFile(srcPath, relPath) {
    const content = await fs.readFile(srcPath, "utf8");
    // Replace content tokens
    let out = content
      .split(pluralSrc)
      .join(pluralTarget)
      .split(singularSrc)
      .join(singularTarget)
      .split(PascalPluralSrc)
      .join(PascalPluralTarget)
      .split(PascalSingularSrc)
      .join(PascalSingularTarget);

    const destPath = path.join(
      destDir,
      relPath
        .split(pluralSrc)
        .join(pluralTarget)
        .split(singularSrc)
        .join(singularTarget)
    );

    await ensureDir(path.dirname(destPath));
    await fs.writeFile(destPath, out, "utf8");
    console.log("Created", path.relative(process.cwd(), destPath));
  }

  async function walkAndCopy(src, base) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const ent of entries) {
      const srcPath = path.join(src, ent.name);
      const relPath = path.relative(base, srcPath);
      if (ent.isDirectory()) {
        await walkAndCopy(srcPath, base);
      } else if (ent.isFile()) {
        await processFile(srcPath, relPath);
      }
    }
  }

  // Check source exists
  try {
    await fs.access(SRC_DIR);
  } catch (e) {
    console.error("Plantilla origen no encontrada:", SRC_DIR);
    process.exit(2);
  }

  try {
    await walkAndCopy(SRC_DIR, SRC_DIR);
    console.log("\nPlantilla copiada a", destDir);
    console.log(
      "Revisa y ajusta manualmente los nombres y rutas en los ficheros nuevos."
    );
  } catch (e) {
    console.error("Error generando plantilla:", e);
    process.exit(3);
  }
}

const args = process.argv.slice(2);
copyTemplate(args[0], args[1]);
