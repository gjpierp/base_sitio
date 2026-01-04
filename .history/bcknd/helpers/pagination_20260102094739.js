const AdmConfiguraciones = require("../models/adm_configuraciones");

async function getDefaultPerPage() {
  const cfg = await AdmConfiguraciones.findByClave("items_per_page");
  return cfg && !isNaN(Number(cfg.valor)) ? Number(cfg.valor) : 10;
}

/**
 * parsePagination(req) -> { desde, limite, page, per_page }
 * - acepta query params: page (1-based), per_page (o perPage), desde, hasta, limite
 * - si no se pasa nada, devuelve primera página con per_page = items_per_page
 */
async function parsePagination(req) {
  const defaultPerPage = await getDefaultPerPage();
  const pageParam = Number(req.query.page);
  const perPageParam = Number(req.query.per_page ?? req.query.perPage);
  const per_page = !isNaN(perPageParam) && perPageParam > 0 ? perPageParam : defaultPerPage;
  const limiteParam = Number(req.query.limite);

  // If page provided, compute offset
  if (!isNaN(pageParam) && pageParam >= 1) {
    const page = Math.floor(pageParam);
    const desde = (page - 1) * per_page;
    const limite = per_page;
    return { desde, limite, page, per_page };
  }

  // If desde/hasta/limite provided, prefer them
  const hasDesde = typeof req.query.desde !== "undefined";
  const hasHasta = typeof req.query.hasta !== "undefined";
  if (hasDesde || hasHasta || !isNaN(limiteParam)) {
    const desde = Number(req.query.desde) || 0;
    let limite;
    if (!isNaN(limiteParam)) {
      limite = limiteParam;
    } else if (hasHasta) {
      const hasta = Number(req.query.hasta);
      limite = isNaN(hasta) ? per_page : Math.max(0, hasta - desde);
    } else {
      limite = per_page;
    }
    const page = Math.floor(desde / per_page) + 1;
    return { desde, limite, page, per_page };
  }

  // Default: first page
  return { desde: 0, limite: per_page, page: 1, per_page };
}

module.exports = { parsePagination };
