const AdmConfiguraciones = require('../../models/adm_configuraciones');
jest.mock('../../models/adm_configuraciones');

const { parsePagination } = require('../../helpers/pagination');

describe('helpers/pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('default per_page taken from configuracion', async () => {
    AdmConfiguraciones.findByClave.mockResolvedValue({ valor: '15' });
    const req = { query: {} };
    const out = await parsePagination(req);
    expect(out).toEqual({ desde: 0, limite: 15, page: 1, per_page: 15 });
  });

  test('page param computes offset and limit', async () => {
    AdmConfiguraciones.findByClave.mockResolvedValue({ valor: '10' });
    const req = { query: { page: '2' } };
    const out = await parsePagination(req);
    expect(out).toEqual({ desde: 10, limite: 10, page: 2, per_page: 10 });
  });

  test('desde and hasta compute limite correctly', async () => {
    AdmConfiguraciones.findByClave.mockResolvedValue({ valor: '20' });
    const req = { query: { desde: '30', hasta: '50' } };
    const out = await parsePagination(req);
    expect(out).toEqual({ desde: 30, limite: 20, page: 2, per_page: 20 });
  });
});
