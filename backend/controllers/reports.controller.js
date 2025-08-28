const db = require("../db/knex");

// GET /api/reports/normalized?period_id=&base=60
exports.normalized = async (req, res, next) => {
  try {
    const period_id = Number(req.query.period_id || 0);
    const base = Number(req.query.base || 60);
    if (!period_id)
      return res
        .status(400)
        .json({ success: false, message: "period_id required" });

    // Assume total_score is on 100 scale; normalize to base
    const rows = await db("evaluation_results as r")
      .join("users as u", "u.id", "r.user_id")
      .select("r.user_id", "u.name_th", "u.department_id", "r.total_score")
      .where("r.period_id", period_id)
      .andWhere("r.status", "submitted");

    const data = rows.map((r) => ({
      user_id: r.user_id,
      name_th: r.name_th,
      department_id: r.department_id,
      total_score: Number(r.total_score || 0),
      normalized:
        Math.round((Number(r.total_score || 0) / 100) * base * 100) / 100,
    }));

    res.json({ success: true, base, data });
  } catch (e) {
    next(e);
  }
};

// GET /api/reports/progress?period_id=
// returns { department_id, total_evaluatees, submitted, percent }
exports.progress = async (req, res, next) => {
  try {
    const period_id = Number(req.query.period_id || 0);
    if (!period_id)
      return res
        .status(400)
        .json({ success: false, message: "period_id required" });

    // evaluatees by department (assigned in this period)
    const depts = await db("users as u")
      .join("assignments as a", "a.evaluatee_id", "u.id")
      .where("a.period_id", period_id)
      .andWhere("u.role", "evaluatee")
      .groupBy("u.department_id")
      .select("u.department_id")
      .countDistinct({ total_evaluatees: "u.id" });

    // submitted per department
    const submitted = await db("evaluation_results as r")
      .join("users as u", "u.id", "r.user_id")
      .where("r.period_id", period_id)
      .andWhere("r.status", "submitted")
      .groupBy("u.department_id")
      .select("u.department_id")
      .countDistinct({ submitted: "u.id" });

    const map = new Map();
    depts.forEach((d) =>
      map.set(String(d.department_id), {
        department_id: d.department_id,
        total_evaluatees: Number(d.total_evaluatees || 0),
        submitted: 0,
      })
    );
    submitted.forEach((s) => {
      const key = String(s.department_id);
      if (!map.has(key))
        map.set(key, {
          department_id: s.department_id,
          total_evaluatees: 0,
          submitted: Number(s.submitted || 0),
        });
      else map.get(key).submitted = Number(s.submitted || 0);
    });

    const data = Array.from(map.values()).map((x) => ({
      ...x,
      percent: x.total_evaluatees
        ? Math.round((x.submitted / x.total_evaluatees) * 10000) / 100
        : 0,
    }));

    res.json({ success: true, period_id, data });
  } catch (e) {
    next(e);
  }
};
