
-- 2_normalized60_ZERO.sql
-- Policy: Missing results count as 0 (instead of NULL)
-- Params: :period_id
SELECT
  y.period_id,
  y.evaluatee_id,
  ROUND(SUM(y.topic_rate * t.weight), 4) AS normalized_60
FROM (
  SELECT
    COALESCE(r.period_id, :period_id) AS period_id,
    r.evaluatee_id,
    i.topic_id,
    SUM(
      (CASE
         WHEN i.type = 'score_1_4' THEN COALESCE(r.score, 0) / 4.0
         WHEN i.type = 'yes_no'    THEN COALESCE(r.yes_no, 0) * 1.0
         ELSE 0
       END) * i.weight
    ) / NULLIF(SUM(CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END), 0) AS topic_rate
  FROM indicators i
  LEFT JOIN results r
    ON r.indicator_id = i.id
   AND r.period_id = :period_id
  WHERE i.type IN ('score_1_4','yes_no')
  GROUP BY r.evaluatee_id, i.topic_id, COALESCE(r.period_id, :period_id)
) y
JOIN evaluation_topics t ON t.id = y.topic_id
GROUP BY y.period_id, y.evaluatee_id
ORDER BY y.period_id, y.evaluatee_id;
