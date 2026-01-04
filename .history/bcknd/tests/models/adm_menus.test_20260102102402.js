jest.mock("../../database/config", () => ({ query: jest.fn() }));
const db = require("../../database/config");
const AdmMenu = require("../../models/adm_menus");

describe("models/adm_menus exist checks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("existsByNombre returns true when name exists", async () => {
    db.query.mockResolvedValueOnce([[{ 1: 1 }]]);
    const exists = await AdmMenu.existsByNombre("Mi Menu");
    expect(exists).toBe(true);
    expect(db.query).toHaveBeenCalled();
  });

  test("existsByUrl with excludeId queries correctly", async () => {
    db.query.mockResolvedValueOnce([[{ 1: 1 }]]);
    const exists = await AdmMenu.existsByUrl("/home", 5);
    expect(exists).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining(
        "SELECT 1 FROM adm_menus WHERE url = ? AND id_menu != ? LIMIT 1"
      ),
      ["/home", 5]
    );
  });
});
