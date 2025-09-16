
-- sp_normalized60.sql
-- Stored Procedures for querying normalized scores.

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_normalized60_by_period $$
CREATE PROCEDURE sp_normalized60_by_period(IN p_period_id INT)
BEGIN
  SELECT n.period_id, n.evaluatee_id, n.normalized_60
  FROM v_normalized60 n
  WHERE n.period_id = p_period_id
  ORDER BY n.evaluatee_id;
END $$

DROP PROCEDURE IF EXISTS sp_topic_breakdown $$
CREATE PROCEDURE sp_topic_breakdown(IN p_period_id INT, IN p_evaluatee_id INT)
BEGIN
  SELECT
    t.id AS topic_id,
    t.code AS topic_code,
    t.name_th AS topic_name,
    t.weight AS topic_weight,
    ROUND(tr.topic_rate_0_1,4) AS topic_rate_0_1,
    ROUND(tr.topic_rate_0_1 * t.weight,4) AS topic_score_on_60_part
  FROM v_topic_rates tr
  JOIN evaluation_topics t ON t.id = tr.topic_id
  WHERE tr.period_id = p_period_id
    AND tr.evaluatee_id = p_evaluatee_id
  ORDER BY t.id;
END $$

DELIMITER ;
