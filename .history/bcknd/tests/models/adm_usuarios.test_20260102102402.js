jest.mock("../../database/config", () => ({ query: jest.fn() }));
const db = require("../../database/config");

const AdmUsuario = require("../../models/adm_usuarios");

describe("models/adm_usuarios (DB-backed methods)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("obtenerPorCorreo returns a user row", async () => {
    db.query.mockResolvedValueOnce([[{ id_usuario: 1, correo: "a@a.com" }]]);
    const u = await AdmUsuario.obtenerPorCorreo("a@a.com");
    expect(u).toBeDefined();
    expect(u.correo).toBe("a@a.com");
    expect(db.query).toHaveBeenCalled();
  });

  test("obtenerRolesPorUsuario returns roles via join", async () => {
    db.query.mockResolvedValueOnce([[{ id_rol: 2, nombre: "ADMIN" }]]);
    const roles = await AdmUsuario.obtenerRolesPorUsuario(5);
    expect(Array.isArray(roles)).toBe(true);
    expect(roles[0].nombre).toBe("ADMIN");
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT r.* FROM adm_roles"),
      [5]
    );
  });

  test("obtenerPermisosPorUsuario returns permisos via joins", async () => {
    db.query.mockResolvedValueOnce([[{ id_permiso: 3, nombre: "EDIT" }]]);
    const perms = await AdmUsuario.obtenerPermisosPorUsuario(6);
    expect(Array.isArray(perms)).toBe(true);
    expect(perms[0].nombre).toBe("EDIT");
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT DISTINCT p.* FROM adm_permisos"),
      [6]
    );
  });
});
