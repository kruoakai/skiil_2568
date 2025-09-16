const bcrypt = require("bcrypt");
const usersRepo = require("../repositories/users");

// exports.list = async (req, res, next) => {
//   try {
//     const rows = await usersRepo.findAll();
//     res.json({ success: true, data: rows });
//   } catch (e) {
//     next(e);// ส่ง error ไปที่ error handling middleware
//     // res.status(500).json({ success:false, message: e.message });// ส่ง error กลับไปที่ client  
//   }
// };

exports.list = async (req, res, next) => {
  try {
    console.log("list called by:", req.user);
    if (req.user.role === 'admin') {
       const items = await usersRepo.findAll();              // เห็นทั้งหมด
      return res.json({ success: true, items, total: items.length });
    }
    // role อื่น เห็นเฉพาะข้อมูลตัวเอง
    const me = await usersRepo.findById(req.user.id);
    return res.json({ success: true, items: me ? [me] : [], total: me ? 1 : 0 });
  } catch (e) { next(e); }
};

//   try {
//     const rows = await usersRepo.findAll();
//     console.log('list called by:', req.user);
//     return res.json({ success: true, items: rows, total: rows.length });
//   } catch (e) {
//     next(e);
//   }
// };
// try {
//     const rows = await usersRepo.findAll();   // ต้องได้เป็น array
//     console.log('listServer called by:', req.user);
//     console.log('rows isArray?', Array.isArray(rows), 'count:', rows.length);

//     return res.json({
//       success: true,
//       items: rows,            // <-- เป็น array
//       total: rows.length,
//       page: 1,
//       itemsPerPage: rows.length
//     });
//   } catch (e) {
//     next(e);
//   }
// };

exports.get = async (req, res, next) => {
  try {
    console.log("params_id_1", req.params);
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
    console.log("body", req.body);
    const { name_th, email, password, role = "evaluatee" } = req.body || {};
    if (!name_th || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "name, email, password required" });
    const password_hash = await bcrypt.hash(password, 10);
    // password = password_hash
    console.log("password_hash", password_hash);

    // const existing = await usersRepo.findByEmail(email);
    const created = await usersRepo.create({
      name_th,
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
    const { name_th, password, email, role } = req.body || {};
    const id = req.params.id;
    console.log("body", req.body);
    console.log("params_id", req.params);

    if (!id) {
      return res.status(400).json({ success: false, message: "Missing user ID" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const updated = await usersRepo.update(id, {
      name_th,
      password_hash,
      email,
      role,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

// exports.update = async (req, res, next) => {
//   console.log("body", req.body);
//   console.log("params_id", req.params);
//   try {
//     const { name,password, email, role } = req.body || {};
//     const password_hash = await bcrypt.hash(password, 10);
//     const updated = await usersRepo.update(req.params.id, {
//       name,
//       password_hash,
//       email,
//       role,
//     });
//     res.json({ success: true, data: updated });
//   } catch (e) {
//     next(e);
//   }
// };
exports.remove = async (req, res, next) => {
  try {
    await usersRepo.remove(req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);// ส่ง error ไปที่ error handling middleware
    // res.status(500).json({ success:false, message: e.message });// ส่ง error กลับไปที่ client
  }
};

exports.listServer = async (req, res, next) => {
  console.log("query", req.query);
  console.log("typeof query.page", typeof req.query.page);
  console.log("typeof query.itemsPerPage", typeof req.query.itemsPerPage);
  console.log("typeof query.sortBy", typeof req.query.sortBy);
  console.log("typeof query.sortDesc", typeof req.query.sortDesc);
  console.log("typeof query.search", typeof req.query.search);  
  
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
