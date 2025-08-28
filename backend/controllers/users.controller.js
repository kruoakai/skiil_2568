const bcrypt = require("bcrypt");
const usersRepo = require("../repositories/users");

exports.list = async (req, res, next) => {
  try {
    const rows = await usersRepo.findAll();
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const row = await usersRepo.findById(req.params.id);
    if (!row)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body || {};
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "name, email, password required" });
    const password_hash = await bcrypt.hash(password, 10);
    const created = await usersRepo.create({
      name,
      email,
      password_hash,
      role,
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, email, role } = req.body || {};
    const updated = await usersRepo.update(req.params.id, {
      name,
      email,
      role,
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await usersRepo.remove(req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

exports.listServer = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const itemsPerPage = Number(req.query.itemsPerPage || 10);
    const sortBy = (req.query.sortBy || "id").toString();
    const sortDesc = req.query.sortDesc === "false" ? false : true;
    const search = (req.query.search || "").toString().trim();
    const [items, total] = await Promise.all([
      usersRepo.findPage({ page, itemsPerPage, sortBy, sortDesc, search }),
      usersRepo.countAll(search),
    ]);
    res.json({ success: true, items, total, page, itemsPerPage });
  } catch (e) {
    next(e);
  }
};
