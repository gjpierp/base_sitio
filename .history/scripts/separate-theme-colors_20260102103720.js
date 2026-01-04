#!/usr/bin/env node
/*
Script: separate-theme-colors.js
Propósito:
 - Leer adm_temas.css_vars (JSON), extraer solo variables cuyos valores sean colores (hex, rgb(a), hsl(a)).
 - Convertir colores `rgba()` a hex (incluyendo alpha como dos dígitos al final: #rrggbbaa).
 - Actualizar la columna `css_vars` en `adm_temas` para que contenga únicamente las variables de color en formato hex.
 - Asegurar que `adm_temas_variables` y `adm_temas_variables_valores` contienen las claves/valores correspondientes.

Uso:
  node scripts/separate-theme-colors.js

Requisitos: configurar las variables de entorno de conexión a BD (ver `bcknd/database/config.js`).
Hacer backup antes de ejecutar.
*/

const db = require('../bcknd/database/config');

function padHex(n) {
  return n.toString(16).padStart(2, '0');
}

function clamp(v, lo = 0, hi = 255) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function rgbaToHex(r, g, b, a = 1) {
  const R = clamp(r), G = clamp(g), B = clamp(b);
  const A = Math.round(clamp(a * 255, 0, 255));
  const hex = `#${padHex(R)}${padHex(G)}${padHex(B)}${padHex(A)}`.toLowerCase();
  return hex;
}

function rgbToHex(r, g, b) {
  return rgbaToHex(r, g, b, 1).slice(0, 7).toLowerCase();
}

function parseColorString(s) {
  if (!s || typeof s !== 'string') return null;
  const str = s.trim();
  // Hex (#fff, #ffffff, #ffffffff)
  const hexRe = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  if (hexRe.test(str)) {
    let v = str.toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(v)) {
      // expand short form
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    // if 6-digit keep 6, if 8-digit keep 8
    return v;
  }

  // rgb() or rgba()
  const rgbRe = /^rgba?\s*\(([^)]+)\)$/i;
  const m = str.match(rgbRe);
  if (m) {
    const parts = m[1].split(',').map(p => p.trim());
    if (parts.length >= 3) {
      const r = parseFloat(parts[0]);
      const g = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      let a = 1;
      if (parts.length === 4) {
        a = parseFloat(parts[3]);
      }
      if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
      // If alpha === 1 return 6-digit hex
      if (a >= 0.999) return rgbToHex(r, g, b);
      return rgbaToHex(r, g, b, a);
    }
  }

  // hsl() / hsla() - convert to rgb
  const hslRe = /^hsla?\s*\(([^)]+)\)$/i;
  const mh = str.match(hslRe);
  if (mh) {
    const parts = mh[1].split(',').map(p => p.trim());
    if (parts.length >= 3) {
      let h = parseFloat(parts[0]);
      let s = parseFloat(parts[1].replace('%','')) / 100;
      let l = parseFloat(parts[2].replace('%','')) / 100;
      let a = 1;
      if (parts.length === 4) a = parseFloat(parts[3]);
      if (isNaN(h) || isNaN(s) || isNaN(l) || isNaN(a)) return null;
      h = ((h % 360) + 360) % 360;
      // HSL -> RGB
      const c = (1 - Math.abs(2*l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m2 = l - c/2;
      let r1=0,g1=0,b1=0;
      if (h < 60) { r1=c; g1=x; b1=0; }
      else if (h < 120) { r1=x; g1=c; b1=0; }
      else if (h < 180) { r1=0; g1=c; b1=x; }
      else if (h < 240) { r1=0; g1=x; b1=c; }
      else if (h < 300) { r1=x; g1=0; b1=c; }
      else { r1=c; g1=0; b1=x; }
      const R = Math.round((r1 + m2) * 255);
      const G = Math.round((g1 + m2) * 255);
      const B = Math.round((b1 + m2) * 255);
      if (a >= 0.999) return rgbToHex(R,G,B);
      return rgbaToHex(R,G,B,a);
    }
  }

  return null;
}

function isColorKey(key, value) {
  // heuristics: keys that likely represent colors: contain color, bg, border, breadcrumb, accent, primary, secondary, header-text, text, success, danger, info, warning
  const colorKeyRe = /color|bg|accent|primary|secondary|header|breadcrumb|text|danger|success|info|warning|overlay|elev|btn|sidebar|breadcrumb/i;
  if (!colorKeyRe.test(key)) return false;
  // value should parse as a color string
  const parsed = parseColorString(String(value));
  return parsed !== null;
}

async function main() {
  console.log('Leyendo temas...');
  const [temas] = await db.query('SELECT id_tema, clave, nombre, css_vars FROM adm_temas');
  for (const t of temas) {
    let raw = t.css_vars;
    if (!raw) raw = '{}';
    // raw may be object or string
    let cssObj = {};
    if (typeof raw === 'object') cssObj = raw;
    else {
      try { cssObj = JSON.parse(String(raw)); } catch (err) { cssObj = {}; }
    }
    const newColors = {};
    for (const k of Object.keys(cssObj)) {
      const v = cssObj[k];
      if (isColorKey(k, v)) {
        const parsed = parseColorString(String(v));
        if (parsed) {
          newColors[k] = parsed;
        }
      }
    }

    // Update adm_temas.css_vars if changed
    const newJson = JSON.stringify(newColors);
    if (newJson !== JSON.stringify(cssObj)) {
      console.log(`Actualizando tema ${t.id_tema} (${t.clave}) -> colores: ${Object.keys(newColors).length}`);
      await db.query('UPDATE adm_temas SET css_vars = ? WHERE id_tema = ?', [newJson, t.id_tema]);
    } else {
      console.log(`Tema ${t.id_tema} (${t.clave}) sin cambios.`);
    }

    // Ensure adm_temas_variables entries exist and adm_temas_variables_valores set
    for (const [key, val] of Object.entries(newColors)) {
      // upsert into adm_temas_variables
      const [rows] = await db.query('SELECT id_tema_var FROM adm_temas_variables WHERE clave = ? LIMIT 1', [key]);
      let id_tema_var;
      if (rows.length === 0) {
        const etiqueta = key.replace(/^--/, '');
        const [res] = await db.query('INSERT INTO adm_temas_variables (clave, etiqueta, tipo, valor_defecto) VALUES (?, ?, ?, ?) ', [key, etiqueta, 'color', val]);
        id_tema_var = res.insertId;
      } else {
        id_tema_var = rows[0].id_tema_var;
        // update valor_defecto if null
        await db.query('UPDATE adm_temas_variables SET valor_defecto = COALESCE(valor_defecto, ?) WHERE id_tema_var = ?', [val, id_tema_var]);
      }

      // upsert into adm_temas_variables_valores
      await db.query(
        'INSERT INTO adm_temas_variables_valores (id_tema, id_tema_var, valor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor), actualizado_at = CURRENT_TIMESTAMP',
        [t.id_tema, id_tema_var, val]
      );
    }
  }

  console.log('Proceso terminado.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
