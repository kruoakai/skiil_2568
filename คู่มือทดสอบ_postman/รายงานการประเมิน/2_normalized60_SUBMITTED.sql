
-- 2_normalized60_SUBMITTED.sql
-- Purpose: Final Normalized/60 per evaluatee per period, counting only submitted results.
-- Params: :period_id
SELECT
  y.period_id,
  y.evaluatee_id,
  ROUND(SUM(y.topic_rate * t.weight), 4) AS normalized_60
FROM (
  SELECT
    r.period_id,
    r.evaluatee_id,
    i.topic_id,
    SUM(
      (CASE
         WHEN i.type = 'score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
         WHEN i.type = 'yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
         ELSE NULL
       END) * i.weight
    ) / NULLIF(SUM(CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END), 0) AS topic_rate
  FROM results r
  JOIN indicators i ON i.id = r.indicator_id
  WHERE r.status = 'submitted'
    AND r.period_id = :period_id
    AND i.type IN ('score_1_4','yes_no')
  GROUP BY r.period_id, r.evaluatee_id, i.topic_id
) y
JOIN evaluation_topics t ON t.id = y.topic_id
GROUP BY y.period_id, y.evaluatee_id
ORDER BY y.period_id, y.evaluatee_id;
