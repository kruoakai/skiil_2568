
-- 1_topic_rates_ZERO.sql
-- Policy: Missing results count as 0 (instead of NULL)
-- Params: :period_id
SELECT
  x.evaluatee_id,
  x.topic_id,
  t.code AS topic_code,
  t.name_th AS topic_name,
  t.weight AS topic_weight,
  ROUND(x.topic_rate, 4) AS topic_rate_0_1,
  ROUND(x.topic_rate * t.weight, 4) AS topic_score_on_60_part
FROM (
  SELECT
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
  JOIN evaluation_topics t ON t.id = i.topic_id
  LEFT JOIN results r
    ON r.indicator_id = i.id
   AND r.period_id = :period_id
  WHERE i.type IN ('score_1_4','yes_no')
  GROUP BY r.evaluatee_id, i.topic_id
) x
JOIN evaluation_topics t ON t.id = x.topic_id
ORDER BY x.evaluatee_id, x.topic_id;
