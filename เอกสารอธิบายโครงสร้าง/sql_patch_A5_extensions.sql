-- A5 Extensions Patch
-- 1) เพิ่มคอลัมน์เวลาส่งผล/ล็อกผลในตาราง evaluation_results
ALTER TABLE evaluation_results
  ADD COLUMN submitted_at DATETIME NULL AFTER status,
  ADD COLUMN locked_at DATETIME NULL,
  ADD COLUMN locked_by INT NULL,
  ADD CONSTRAINT fk_results_locked_by FOREIGN KEY (locked_by) REFERENCES users(id);

-- 2) View รายงานความก้าวหน้าการส่งผล (ระดับหัวข้อ)
DROP VIEW IF EXISTS v_submit_progress_topic;
CREATE VIEW v_submit_progress_topic AS
SELECT
  er.period_id,
  er.evaluatee_id,
  er.topic_id,
  COUNT(*) AS total_results,
  SUM(er.status = 'submitted') AS submitted_results,
  ROUND(100 * SUM(er.status = 'submitted') / NULLIF(COUNT(*),0), 2) AS percent_submitted
FROM evaluation_results er
GROUP BY er.period_id, er.evaluatee_id, er.topic_id;

-- 3) View รายงานความก้าวหน้าการส่งผล (ระดับตัวชี้วัด)
DROP VIEW IF EXISTS v_submit_progress_indicator;
CREATE VIEW v_submit_progress_indicator AS
SELECT
  er.period_id,
  er.evaluatee_id,
  er.indicator_id,
  COUNT(*) AS total_records,
  SUM(er.status = 'submitted') AS submitted_records,
  ROUND(100 * SUM(er.status = 'submitted') / NULLIF(COUNT(*),0), 2) AS percent_submitted
FROM evaluation_results er
GROUP BY er.period_id, er.evaluatee_id, er.indicator_id;

-- หมายเหตุ:
-- - หากต้องการปิดรอบทั้งชุด ให้พิจารณาเพิ่มคอลัมน์ is_locked ใน evaluation_periods หรือใช้ business rule ชั้นแอป