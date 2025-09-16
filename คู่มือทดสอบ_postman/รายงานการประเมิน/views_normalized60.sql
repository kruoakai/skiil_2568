
-- views_normalized60.sql
-- Creates views for indicator_percent, topic_rates, and normalized_60 (submitted-only policy).

DROP VIEW IF EXISTS v_indicator_rates;
CREATE VIEW v_indicator_rates AS
SELECT
  r.period_id,
  r.evaluatee_id,
  i.topic_id,
  i.id AS indicator_id,
  i.weight AS indicator_weight,
  CASE
    WHEN i.type='score_1_4' AND r.score IS NOT NULL THEN r.score/4.0
    WHEN i.type='yes_no'    AND r.yes_no IS NOT NULL THEN r.yes_no*1.0
    ELSE NULL
  END AS indicator_percent
FROM results r
JOIN indicators i ON i.id = r.indicator_id
WHERE r.status='submitted' AND i.type IN ('score_1_4','yes_no');

DROP VIEW IF EXISTS v_topic_rates;
CREATE VIEW v_topic_rates AS
SELECT
  period_id,
  evaluatee_id,
  topic_id,
  SUM(indicator_percent * indicator_weight) / NULLIF(SUM(indicator_weight),0) AS topic_rate_0_1
FROM v_indicator_rates
GROUP BY period_id, evaluatee_id, topic_id;

DROP VIEW IF EXISTS v_normalized60;
CREATE VIEW v_normalized60 AS
SELECT
  tr.period_id,
  tr.evaluatee_id,
  ROUND(SUM(tr.topic_rate_0_1 * t.weight), 4) AS normalized_60
FROM v_topic_rates tr
JOIN evaluation_topics t ON t.id = tr.topic_id
GROUP BY tr.period_id, tr.evaluatee_id;
