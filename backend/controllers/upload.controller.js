// exports.single = async (req, res, next) => {
//   console.log("file=", req.file);
//   try {
//     if (!req.file)
//       return res.status(400).json({ success: false, message: "no file" });
//     const url = `/uploads/${req.file.filename}`;
//     res.status(201).json({ success: true, url });
//   } catch (e) {
//     next(e);
//   }
// };

// controllers/upload.controller.js
// controllers/upload.controller.js
const path = require('path');
const fs = require('fs');
const attRepo = require('../repositories/attachments');
const asgRepo = require('../repositories/assignments');
const mapRepo = require('../repositories/indicatorEvidence');
const db = require('../db/knex');

// ---------- helpers ----------
function safeUnlink(abs) {
  try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch {}
}
function relFromUploads(absPath) {
  // ให้ได้ path แบบ relative ต่อโฟลเดอร์ uploads และใช้ slash เดียว
  return path
    .relative(path.join(__dirname, '..', 'uploads'), absPath)
    .replace(/\\/g, '/');
}
async function isPeriodActive(period_id) {
  const row = await db('evaluation_periods').where({ id: period_id, is_active: 1 }).first();
  return !!row;
}

// =====================================================================
// Evaluatee: CREATE (อัปโหลดหลักฐานของตัวเอง)
// Body: { period_id, indicator_id, evidence_type_id } + file
// =====================================================================
exports.uploadEvidence = async (req, res, next) => {
  try {
    const evaluatee_id = Number(req.user?.id);
    const { period_id, indicator_id, evidence_type_id } = req.body || {};

    if (!req.file) return res.status(400).json({ success:false, message:'no file' });
    if (!period_id || !indicator_id || !evidence_type_id) {
      return res.status(400).json({ success:false, message:'missing period_id/indicator_id/evidence_type_id' });
    }

    // ต้องถูก assign ใน period นั้น
    const okAssign = await asgRepo.hasEvaluateeInPeriod({
      period_id: Number(period_id),
      evaluatee_id
    });
    if (!okAssign) return res.status(400).json({ success:false, message:'evaluatee not assigned in the period' });

    // period ต้องเปิดอยู่
    if (!(await isPeriodActive(Number(period_id)))) {
      return res.status(403).json({ success:false, message:'period closed' });
    }

    // mapping indicator-evidence_type ต้องถูกต้อง
    const okMap = await mapRepo.mapExists({
      indicator_id: Number(indicator_id),
      evidence_type_id: Number(evidence_type_id)
    });
    if (!okMap) return res.status(400).json({ success:false, message:'invalid indicator/evidence_type pair' });

    const storage_path = relFromUploads(req.file.path);

    const [id] = await db('attachments').insert({
      period_id: Number(period_id),
      evaluatee_id,
      indicator_id: Number(indicator_id),
      evidence_type_id: Number(evidence_type_id),
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_path
    });

    const created = await attRepo.findById(id);
    res.status(201).json({ success:true, data: { ...created, url: `/uploads/${created.storage_path}` }});
  } catch (e) { next(e); }
};

// =====================================================================
// Evaluatee: LIST ของตัวเอง
// Query optional: period_id, indicator_id, evidence_type_id
// =====================================================================
exports.listMine = async (req, res, next) => {
  try {
    const evaluatee_id = Number(req.user?.id);
    const { period_id, indicator_id, evidence_type_id } = req.query || {};

    let q = db('attachments').where({ evaluatee_id }).orderBy('id', 'desc');
    if (period_id) q = q.andWhere({ period_id: Number(period_id) });
    if (indicator_id) q = q.andWhere({ indicator_id: Number(indicator_id) });
    if (evidence_type_id) q = q.andWhere({ evidence_type_id: Number(evidence_type_id) });

    const rows = await q;
    const data = rows.map(r => ({ ...r, url:`/uploads/${r.storage_path}` }));
    res.json({ success:true, data });
  } catch (e) { next(e); }
};

// =====================================================================
// Evaluatee: DELETE ของตัวเอง (ลบได้เฉพาะช่วงที่ period ยังเปิด)
// =====================================================================
exports.deleteMine = async (req, res, next) => {
  try {
    const evaluatee_id = Number(req.user?.id);
    const id = Number(req.params.id);
    const row = await attRepo.findById(id);

    if (!row || row.evaluatee_id !== evaluatee_id) {
      return res.status(404).json({ success:false, message:'not found' });
    }
    if (!(await isPeriodActive(row.period_id))) {
      return res.status(403).json({ success:false, message:'period closed' });
    }

    const abs = path.join(__dirname, '..', 'uploads', row.storage_path);
    await db('attachments').where({ id }).del();
    safeUnlink(abs);

    res.json({ success:true, message:'deleted' });
  } catch (e) { next(e); }
};

// =====================================================================
// Evaluatee: UPDATE FILE ของตัวเอง  (ของเดิมของคุณ)
// =====================================================================
exports.updateFileMine = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ success:false, message:'no file' });

    const row = await attRepo.findById(id);
    if (!row || row.evaluatee_id !== userId) return res.status(404).json({ success:false, message:'not found' });

    if (!(await isPeriodActive(row.period_id))) {
      return res.status(403).json({ success:false, message:'period closed' });
    }

    const oldAbs = path.join(__dirname, '..', 'uploads', row.storage_path);
    const newRel = relFromUploads(req.file.path);

    await db('attachments').where({ id }).update({
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_path: newRel
    });

    safeUnlink(oldAbs);
    const updated = await attRepo.findById(id);
    res.json({ success:true, data: { ...updated, url: `/uploads/${updated.storage_path}` }});
  } catch (e) { next(e); }
};

// =====================================================================
// Evaluatee: UPDATE META ของตัวเอง (ของเดิมของคุณ)
// =====================================================================
exports.updateMetaMine = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);
    const { indicator_id, evidence_type_id } = req.body || {};

    const row = await attRepo.findById(id);
    if (!row || row.evaluatee_id !== userId) return res.status(404).json({ success:false, message:'not found' });

    if (!(await isPeriodActive(row.period_id))) {
      return res.status(403).json({ success:false, message:'period closed' });
    }

    const newIndicator = indicator_id ? Number(indicator_id) : row.indicator_id;
    const newEvType   = evidence_type_id ? Number(evidence_type_id) : row.evidence_type_id;

    const okMap = await mapRepo.mapExists({ indicator_id: newIndicator, evidence_type_id: newEvType });
    if (!okMap) return res.status(400).json({ success:false, message:'invalid indicator/evidence_type pair' });

    await db('attachments').where({ id }).update({
      indicator_id: newIndicator,
      evidence_type_id: newEvType
    });

    const updated = await attRepo.findById(id);
    res.json({ success:true, data: { ...updated, url: `/uploads/${updated.storage_path}` }});
  } catch (e) { next(e); }
};

// =====================================================================
// Evaluator: LIST หลักฐานของ evaluatee ที่ดูแล
// Query optional: period_id
// =====================================================================
exports.listForEvaluator = async (req, res, next) => {
  try {
    const evaluateeId = Number(req.params.evaluateeId);
    const { period_id } = req.query || {};

    let q = db('attachments').where({ evaluatee_id: evaluateeId }).orderBy('id', 'desc');
    if (period_id) q = q.andWhere({ period_id: Number(period_id) });

    // (ถ้าต้องการตรวจสิทธิ์ evaluator ↔ evaluatee เพิ่ม เติมที่นี่)
    const rows = await q;
    const data = rows.map(r => ({ ...r, url:`/uploads/${r.storage_path}` }));
    res.json({ success:true, data });
  } catch (e) { next(e); }
};

// =====================================================================
// Admin: CREATE แทนผู้อื่น (on-behalf) + file
// Body: { evaluatee_id, period_id, indicator_id, evidence_type_id } + file
// =====================================================================
exports.adminUploadOnBehalf = async (req, res, next) => {
  try {
    const { evaluatee_id, period_id, indicator_id, evidence_type_id } = req.body || {};
    if (!req.file) return res.status(400).json({ success:false, message:'no file' });

    if (!evaluatee_id || !period_id || !indicator_id || !evidence_type_id) {
      return res.status(400).json({ success:false, message:'missing evaluatee_id/period_id/indicator_id/evidence_type_id' });
    }

    const okAssign = await asgRepo.hasEvaluateeInPeriod({
      period_id: Number(period_id),
      evaluatee_id: Number(evaluatee_id)
    });
    if (!okAssign) return res.status(400).json({ success:false, message:'evaluatee not assigned in the period' });

    const okMap = await mapRepo.mapExists({
      indicator_id: Number(indicator_id),
      evidence_type_id: Number(evidence_type_id)
    });
    if (!okMap) return res.status(400).json({ success:false, message:'invalid indicator/evidence_type pair' });

    const storage_path = relFromUploads(req.file.path);

    const [id] = await db('attachments').insert({
      period_id: Number(period_id),
      evaluatee_id: Number(evaluatee_id),
      indicator_id: Number(indicator_id),
      evidence_type_id: Number(evidence_type_id),
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_path
    });

    const created = await attRepo.findById(id);
    res.status(201).json({ success:true, data: { ...created, url: `/uploads/${created.storage_path}` }});
  } catch (e) { next(e); }
};

// =====================================================================
// Admin: LIST ทั้งระบบ (มี filter ได้)
// =====================================================================
exports.adminList = async (req, res, next) => {
  try {
    const { period_id, evaluatee_id, indicator_id, evidence_type_id } = req.query || {};
    let q = db('attachments').orderBy('id', 'desc');

    if (period_id) q = q.andWhere({ period_id: Number(period_id) });
    if (evaluatee_id) q = q.andWhere({ evaluatee_id: Number(evaluatee_id) });
    if (indicator_id) q = q.andWhere({ indicator_id: Number(indicator_id) });
    if (evidence_type_id) q = q.andWhere({ evidence_type_id: Number(evidence_type_id) });

    const rows = await q;
    const data = rows.map(r => ({ ...r, url:`/uploads/${r.storage_path}` }));
    res.json({ success:true, data });
  } catch (e) { next(e); }
};

// =====================================================================
// Admin: DELETE (ลบได้เสมอ)
// =====================================================================
exports.adminDelete = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await attRepo.findById(id);
    if (!row) return res.status(404).json({ success:false, message:'not found' });

    const abs = path.join(__dirname, '..', 'uploads', row.storage_path);
    await db('attachments').where({ id }).del();
    safeUnlink(abs);

    res.json({ success:true, message:'deleted' });
  } catch (e) { next(e); }
};

// =====================================================================
// Admin: UPDATE FILE (ของเดิมของคุณ)
// =====================================================================
exports.adminUpdateFile = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ success:false, message:'no file' });

    const row = await attRepo.findById(id);
    if (!row) return res.status(404).json({ success:false, message:'not found' });

    const oldAbs = path.join(__dirname, '..', 'uploads', row.storage_path);
    const newRel = relFromUploads(req.file.path);

    await db('attachments').where({ id }).update({
      file_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      storage_path: newRel
    });

    safeUnlink(oldAbs);

    const updated = await attRepo.findById(id);
    res.json({ success:true, data: { ...updated, url: `/uploads/${updated.storage_path}` }});
  } catch (e) { next(e); }
};

// =====================================================================
// Admin: UPDATE META (ของเดิมของคุณ + ตรวจ assignment/map)
// =====================================================================
exports.adminUpdateMeta = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { period_id, evaluatee_id, indicator_id, evidence_type_id } = req.body || {};

    const row = await attRepo.findById(id);
    if (!row) return res.status(404).json({ success:false, message:'not found' });

    const newPeriod    = period_id    ? Number(period_id)    : row.period_id;
    const newEvaluatee = evaluatee_id ? Number(evaluatee_id) : row.evaluatee_id;
    const newIndicator = indicator_id ? Number(indicator_id) : row.indicator_id;
    const newEvType    = evidence_type_id ? Number(evidence_type_id) : row.evidence_type_id;

    const okAssign = await asgRepo.hasEvaluateeInPeriod({ period_id: newPeriod, evaluatee_id: newEvaluatee });
    if (!okAssign) return res.status(400).json({ success:false, message:'evaluatee not assigned in the new period' });

    const okMap = await mapRepo.mapExists({ indicator_id: newIndicator, evidence_type_id: newEvType });
    if (!okMap) return res.status(400).json({ success:false, message:'invalid indicator/evidence_type pair' });

    await db('attachments').where({ id }).update({
      period_id: newPeriod,
      evaluatee_id: newEvaluatee,
      indicator_id: newIndicator,
      evidence_type_id: newEvType
    });

    const updated = await attRepo.findById(id);
    res.json({ success:true, data: { ...updated, url: `/uploads/${updated.storage_path}` }});
  } catch (e) { next(e); }
};
