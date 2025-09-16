// backend/repositories/users.js
const db = require("../db/knex");
//  const TABLE = 'users';
// ดึงทั้งหมด (ไม่ดึง password_hash ออกไปฝั่ง API)
exports.findAll = async () => {
  const rows = await db("users")
    .select("id", "name_th", "email", "role", "created_at")
    .orderBy("id", "desc");
    return rows;
};

exports.findUser = async () => {
  const rows = await db("users")
    .select("id", "name_th", "email", "role", "created_at")
    .where("role", "admin")

  return rows;
};

exports.findById = async (id) => {
  console.log("findById id_1=", id);
  const rows = await db("users")
    .select("id", "name_th", "email", "role", "created_at")// ปกติไม่ต้องส่ง hash ออก
    .where({ id })
    .first()
   return rows || null;
};

// ใช้ตอน login: ต้องดึง password_hash มาด้วย
exports.findByEmail = async (email) => {
  const user = await db("users").where("email", email).first();
  return user || null;
};
// exports.create = async (req,res) => {
exports.create = async ({
  name_th,
  email,
  password_hash,
  role = "evaluatee",
}) => {
  const payload = { name_th, email, password_hash, role };
  console.log("payload", payload);
  // บน SQLite/	knex.insert() จะคืน [lastID]
  // บน MySQL/	mysql2, knex.insert() จะคืน [insertId]
  const [insertId] = await db("users").insert(payload);// insertId = 3
  console.log("insertId", insertId);    
  return { id: insertId, name_th, email, role };
};
exports.update = async (id, { name_th, password_hash, email, role }) => {
  console.log("update id=", id, name_th, password_hash, email, role);
  await db("users")
    .where({ id })
    .update({ name_th, password_hash, email, role });
  return exports.findById(id); // return updated record  ดึงข้อมูลล่าสุดส่งกลับ
  // return "ok";
};
exports.remove = async (id) => {
  const affected = await db("users").where({ id }).del();
  return affected > 0;
};

// เวอร์ชัน CONCAT เหมือน SQL เดิม (เร็วและตรงที่สุด)
exports.countAll = async (search = "") => {
  if (!search) {
    const row = await db("users").count({ cnt: "*" }).first();
    return Number(row?.cnt || 0);
  }
  const like = `%${search}%`;
  const row = await db("users")
    .whereRaw("CONCAT(id,' ',name_th,' ',email,' ',role) LIKE ?", [like])
    .count({ cnt: "*" })
    .first();
  return Number(row?.cnt || 0);
};

exports.findPage = async ({
  page = 1,
  itemsPerPage = 10,
  sortBy = "id",
  sortDesc = true,
  search = "",
}) => {
  const allowed = new Set(["id", "name_th", "email", "role", "created_at"]);
  const column = allowed.has(sortBy) ? sortBy : "id";
  const dir = sortDesc ? "DESC" : "ASC";
  const off = (page - 1) * itemsPerPage;
  const like = `%${search}%`;
  const rows = await db("users")
  .whereRaw("CONCAT(id,' ',name_th,' ',email,' ',role) LIKE ?", [like])
  .orderBy(column, dir)
  .limit(itemsPerPage)
  .offset(off);
   return rows;
 
};
