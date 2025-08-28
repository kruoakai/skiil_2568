const db = require("../db/knex");

// POST /api/assignments  { period_id, evaluator_id, evaluatee_id }
// Rule: unique tuple per period
exports.create = async (req, res, next) => {
  try {
    const { period_id, evaluator_id, evaluatee_id } = req.body;
    if (!period_id || !evaluator_id || !evaluatee_id) {
      return res
        .status(400)
        .json({ success: false, message: "missing fields" });
    }
    const exists = await db("assignments")
      .where({ period_id, evaluator_id, evaluatee_id })
      .first();
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "duplicate assignment" });

    const [id] = await db("assignments").insert({
      period_id,
      evaluator_id,
      evaluatee_id,
    });
    res.status(201).json({ success: true, id });
  } catch (e) {
    next(e);
  }
};
