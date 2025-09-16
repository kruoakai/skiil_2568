
-- 3_topic_breakdown_single_SUBMITTED.sql
-- Purpose: Per-topic breakdown (0..1 and contribution on 60) for a single evaluatee & period, using only submitted results.
-- Params: :period_id, :evaluatee_id
SELECT
  t.id AS topic_id,
  t.code AS topic_code,
  t.name_th AS topic_name,
  t.weight AS topic_weight,
  ROUND(SUM(
    (CASE
      WHEN i.type='score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
      WHEN i.type='yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
      ELSE NULL
    END) * i.weight
  ) / NULLIF(SUM(
    CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END
  ),0), 4) AS topic_rate_0_1,
  ROUND(
    (
      SUM(
        (CASE
          WHEN i.type='score_1_4' AND r.score IS NOT NULL THEN r.score / 4.0
          WHEN i.type='yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no * 1.0
          ELSE NULL
        END) * i.weight
      ) / NULLIF(SUM(
        CASE WHEN i.type IN ('score_1_4','yes_no') THEN i.weight ELSE 0 END
      ),0)
    ) * t.weight
  , 4) AS topic_score_on_60_part
FROM evaluation_topics t
JOIN indicators i ON i.topic_id = t.id
LEFT JOIN results r
  ON r.indicator_id = i.id
 AND r.period_id = :period_id
 AND r.evaluatee_id = :evaluatee_id
 AND r.status = 'submitted'
WHERE i.type IN ('score_1_4','yes_no')
GROUP BY t.id, t.code, t.name_th, t.weight
ORDER BY t.id;
