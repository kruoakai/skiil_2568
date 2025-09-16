
-- 1_topic_rates.sql
-- Purpose: Compute per-topic rate (0..1) for each evaluatee within a period (MySQL 8+ with CTE).
-- Params to replace: :period_id (e.g., 1)
WITH indicator_rates AS (
  SELECT
    r.period_id,
    r.evaluatee_id,
    i.topic_id,
    i.weight            AS indicator_weight,
    CASE
      WHEN i.type = 'score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
      WHEN i.type = 'yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
      ELSE NULL
    END AS indicator_percent
  FROM results r
  JOIN indicators i ON i.id = r.indicator_id
  WHERE r.status IN ('draft','submitted')
    AND r.period_id = :period_id
    AND i.type IN ('score_1_4','yes_no')
),
topic_rates AS (
  SELECT
    ir.period_id,
    ir.evaluatee_id,
    ir.topic_id,
    SUM(ir.indicator_percent * ir.indicator_weight) / NULLIF(SUM(ir.indicator_weight),0) AS topic_rate
  FROM indicator_rates ir
  GROUP BY ir.period_id, ir.evaluatee_id, ir.topic_id
)
SELECT
  tr.period_id,
  tr.evaluatee_id,
  t.id   AS topic_id,
  t.code AS topic_code,
  t.name_th AS topic_name,
  t.weight  AS topic_weight,       -- e.g., 15/21/15/9
  ROUND(tr.topic_rate, 4) AS topic_rate_0_1,
  ROUND(tr.topic_rate * t.weight, 4) AS topic_score_on_60_part
FROM topic_rates tr
JOIN evaluation_topics t ON t.id = tr.topic_id
ORDER BY tr.evaluatee_id, tr.period_id, t.id;
