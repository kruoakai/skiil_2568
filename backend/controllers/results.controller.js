const db = require("../db/knex");
const { isAdmin, isEvaluator, isEvaluatee } = require("../utils/authz");

// GET /api/results?period_id=&user_id= (IDOR guard)
exports.list = async (req, res, next) => {
  try {
    const period_id = Number(req.query.period_id || 0) || null;
    const user_id = req.query.user_id ? Number(req.query.user_id) : null;
    const me = req.user;

    // Base query
    let q = db("evaluation_results as r")
      .leftJoin("evaluation_topics as t", "t.id", "r.topic_id")
      .select(
        "r.id",
        "r.user_id",
        "r.period_id",
        "r.topic_id",
        "r.total_score",
        "r.status",
        "t.title as topic_title"
      );

    if (period_id) q.where("r.period_id", period_id);

    if (isAdmin(me)) {
      if (user_id) q.where("r.user_id", user_id);
    } else if (isEvaluator(me)) {
      // only results where I'm evaluator of that evaluatee in that period per assignments
      q.whereExists(function () {
        this.from("assignments as a")
          .whereRaw("a.evaluatee_id = r.user_id")
          .andWhere("a.period_id", period_id || db.raw("a.period_id"))
          .andWhere("a.evaluator_id", me.id);
      });
      if (user_id) q.andWhere("r.user_id", user_id);
    } else {
      // evaluatee: only own
      q.andWhere("r.user_id", me.id);
    }

    const rows = await q.orderBy("r.id", "desc");
    res.json({ success: true, data: rows });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/results/:id/submit  → rule: status must be 'draft' and has at least 1 attachment
exports.submit = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const me = req.user;

    const row = await db("evaluation_results").where({ id }).first();
    if (!row)
      return res.status(404).json({ success: false, message: "not found" });

    // IDOR guard: only owner, assigned evaluator, or admin can submit
    const admin = isAdmin(me);
    let allowed = admin || row.user_id === me.id;
    if (!allowed && isEvaluator(me)) {
      const assign = await db("assignments")
        .where({
          evaluatee_id: row.user_id,
          period_id: row.period_id,
          evaluator_id: me.id,
        })
        .first();
      allowed = !!assign;
    }
    if (!allowed)
      return res.status(403).json({ success: false, message: "forbidden" });

    if (row.status !== "draft")
      return res
        .status(400)
        .json({ success: false, message: "only draft can be submitted" });

    const attachCount = await db("attachments")
      .where({ result_id: id })
      .count({ c: "*" })
      .first();
    if ((attachCount?.c || 0) < 1) {
      return res
        .status(400)
        .json({
          success: false,
          message: "evidence required (at least 1 attachment)",
        });
    }

    await db("evaluation_results")
      .where({ id })
      .update({ status: "submitted", submitted_at: db.fn.now() });
    res.json({ success: true, message: "submitted" });
  } catch (e) {
    next(e);
  }
};
