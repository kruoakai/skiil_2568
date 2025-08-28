// backend/repositories/users.js
const db = require('../db/knex');
const TABLE = 'users';

// ดึงทั้งหมด (ไม่ดึง password_hash ออกไปฝั่ง API)
exports.findAll = async () => {
  return await db(TABLE)
    .select('id', 'name', 'email', 'role', 'created_at')
    .orderBy('id', 'asc');
};

exports.findById = async (id) => {
  return await db(TABLE)
    .select('id', 'name', 'email', 'role', 'created_at') // ปกติไม่ต้องส่ง hash ออก
    .where({ id })
    .first() || null;
};

// ใช้ตอน login: ต้องดึง password_hash มาด้วย
exports.findByEmail = async (email) => {
  return await db(TABLE)
    .where({ email })
    .first() || null;
};

// exports.findByEmail = async (email) => {
//   const user = await db('users')
//     .where('email', email)
//     .first();

//   return user || null;
// };




exports.create = async ({ name, email, password_hash, role = 'user' }) => {
  const payload = { name, email, password_hash, role };
  // บน MySQL/	mysql2, knex.insert() จะคืน [insertId]
  const [insertId] = await db(TABLE).insert(payload);
  return { id: insertId, name, email, role };
};

exports.update = async (id, { name, email, role }) => {
  await db(TABLE).where({ id }).update({ name, email, role });
  return exports.findById(id);
};

exports.remove = async (id) => {
  const affected = await db(TABLE).where({ id }).del();
  return affected > 0;
};

// เวอร์ชัน CONCAT เหมือน SQL เดิม (เร็วและตรงที่สุด)
exports.countAll = async (search = '') => {
  if (!search) {
    const row = await db(TABLE).count({ cnt: '*' }).first();
    return Number(row?.cnt || 0);
  }
  const like = `%${search}%`;
  const row = await db(TABLE)
    .whereRaw("CONCAT(id,' ',name,' ',email,' ',role) LIKE ?", [like])
    .count({ cnt: '*' })
    .first();
  return Number(row?.cnt || 0);
};

// (ถ้าอยากหลีกเลี่ยง whereRaw ก็ใช้ orWhere หลายคอลัมน์แทนได้)
// exports.countAll = async (search='') => {
//   if (!search) return Number((await db(TABLE).count({cnt:'*'}).first()).cnt);
//   const like = `%${search}%`;
//   const row = await db(TABLE)
//     .where((qb) => {
//       qb.where('name', 'like', like)
//         .orWhere('email', 'like', like)
//         .orWhere('role', 'like', like)
//         .orWhereRaw('CAST(id AS CHAR) LIKE ?', [like]);
//     })
//     .count({ cnt: '*' })
//     .first();
//   return Number(row?.cnt || 0);
// };



// exports.findAll = async () => {
//   const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
//   return rows;
// };

// exports.findById = async (id) => {
//   const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE id=?', [id]);
//   return rows[0] || null;
// };

//   // exports.findByEmail = async (email) => {
//   //   const [rows] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
//   //   return rows[0] || null;
//   // };

// exports.findByEmail = async (email) => {
//   const user = await db('users')
//     .where('email', email)
//     .first();

//   return user || null;
// };

// exports.create = async ({ name, email, password_hash, role='user' }) => {
//   const [res] = await db.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
//     [name, email, password_hash, role]);
//   return { id: res.insertId, name, email, role };
// };

// exports.update = async (id, { name, email, role }) => {
//   await db.execute('UPDATE users SET name=?, email=?, role=? WHERE id=?', [name, email, role, id]);
//   return exports.findById(id);
// };

// exports.remove = async (id) => {
//   await db.execute('DELETE FROM users WHERE id=?', [id]);
//   return true;
// };

// exports.countAll = async (search = '') => {
//   const like = `%${search}%`
//   const [rows] = await db.execute(
//     "SELECT COUNT(*) as cnt FROM users WHERE CONCAT(id,' ',name,' ',email,' ',role) LIKE ?",
//     [like]
//   );
//   return rows[0]?.cnt || 0;
// };

exports.findPage = async ({ page = 1, itemsPerPage = 10, sortBy = 'id', sortDesc = true, search = '' }) => {
  const allowed = new Set(['id','name','email','role','created_at']);
  const column = allowed.has(sortBy) ? sortBy : 'id';
  const dir = sortDesc ? 'DESC' : 'ASC';
  const off = (page - 1) * itemsPerPage;
  const like = `%${search}%`;
  const [rows] = await db.execute(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE CONCAT(id,' ',name,' ',email,' ',role) LIKE ?
     ORDER BY ${column} ${dir}
     LIMIT ? OFFSET ?`,
     [like, itemsPerPage, off]
  );
  return rows;
};
