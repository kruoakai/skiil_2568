
-- seed_normalized60_minimal.sql
-- Minimal seed for testing Normalized/60 flow.
-- WARNING: Run on a sandbox/dev database. Adjust IDs or use AUTO_INCREMENT as needed.

-- Clear (optional: comment out in shared environments)
-- SET FOREIGN_KEY_CHECKS=0;
-- TRUNCATE TABLE attachments;
-- TRUNCATE TABLE results;
-- TRUNCATE TABLE assignments;
-- TRUNCATE TABLE indicators;
-- TRUNCATE TABLE evaluation_topics;
-- TRUNCATE TABLE periods;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE evidence_types;
-- SET FOREIGN_KEY_CHECKS=1;

-- Users (admin/evaluator/evaluatee)
INSERT INTO users (id, email, name_th, role, status) VALUES
(1, 'admin@ctc.ac.th',    'ผู้ดูแล', 'admin', 'active'),
(2, 'eval1@ctc.ac.th',    'ครูผู้ประเมิน 1', 'evaluator', 'active'),
(3, 'staff1@ctc.ac.th',   'ผู้รับการประเมิน 1', 'evaluatee', 'active')
ON DUPLICATE KEY UPDATE name_th=VALUES(name_th);

-- Period
INSERT INTO periods (id, code, name, buddhist_year, start_date, end_date, is_active)
VALUES (1, 'A5-2568-1', 'รอบ 1/2568', 2568, '2025-06-01', '2025-09-30', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Topics (weights 15/21/15/9)
INSERT INTO evaluation_topics (id, code, name_th, description, weight, order_no) VALUES
(1, 'TOP1', 'แผน/การสอน', 'แผนการสอน/การเตรียมการ', 15, 1),
(2, 'TOP2', 'ผลสัมฤทธิ์', 'ผลลัพธ์ผู้เรียน/ผลงาน', 21, 2),
(3, 'TOP3', 'ปฏิบัติการ', 'จัดการเรียนรู้จริง', 15, 3),
(4, 'TOP4', 'จริยธรรม', 'คุณธรรม/วินัย', 9, 4)
ON DUPLICATE KEY UPDATE name_th=VALUES(name_th);

-- Indicators (mix score_1_4 and yes_no; weight per indicator)
INSERT INTO indicators (id, topic_id, code, name_th, description, type, weight) VALUES
(101, 1, 'T1-PLAN',  'แผนการจัดการเรียนรู้', 'มีแผนการสอนครบ/อัปเดต', 'score_1_4', 1.00),
(102, 1, 'T1-MAP',   'แผน-มาตรฐาน',        'สอดคล้องมาตรฐาน',       'yes_no',     1.00),
(201, 2, 'T2-OUT1',  'ผลสัมฤทธิ์ 1',        'คะแนนเฉลี่ยรายวิชา',     'score_1_4', 2.00),
(202, 2, 'T2-OUT2',  'ผลสัมฤทธิ์ 2',        'คุณภาพโครงงาน',           'score_1_4', 1.00),
(301, 3, 'T3-PRAC',  'ปฏิบัติในชั้น',       'สังเกตการสอนจริง',        'score_1_4', 1.00),
(401, 4, 'T4-ETH',   'จริยธรรม',            'การตรงต่อเวลา/วินัย',     'yes_no',     1.00)
ON DUPLICATE KEY UPDATE name_th=VALUES(name_th);

-- Assignment (evaluator 2 -> evaluatee 3 on each topic)
INSERT INTO assignments (id, period_id, evaluator_id, evaluatee_id, topic_id, assigned_at) VALUES
(1, 1, 2, 3, 1, NOW()),
(2, 1, 2, 3, 2, NOW()),
(3, 1, 2, 3, 3, NOW()),
(4, 1, 2, 3, 4, NOW())
ON DUPLICATE KEY UPDATE assigned_at=VALUES(assigned_at);

-- Results (mix draft/submitted)
-- Topic 1: indicators 101 (score), 102 (yes_no)
INSERT INTO results (id, period_id, evaluator_id, evaluatee_id, topic_id, indicator_id, score, yes_no, note, status, updated_at) VALUES
(1001, 1, 2, 3, 1, 101, 3, NULL, 'ดีมาก', 'submitted', NOW()),
(1002, 1, 2, 3, 1, 102, NULL, 1,  'มีเอกสารอ้างอิง', 'submitted', NOW()),

-- Topic 2: indicators 201 (score weight 2), 202 (score weight 1)
(2001, 1, 2, 3, 2, 201, 4, NULL, 'คะแนนเฉลี่ยสูง', 'submitted', NOW()),
(2002, 1, 2, 3, 2, 202, 3, NULL, 'โครงงานคุณภาพดี', 'submitted', NOW()),

-- Topic 3: indicators 301 (score)
(3001, 1, 2, 3, 3, 301, 2, NULL, 'ยังปรับปรุงได้', 'submitted', NOW()),

-- Topic 4: indicators 401 (yes_no)
(4001, 1, 2, 3, 4, 401, NULL, 1, 'วินัยดี', 'submitted', NOW())
ON DUPLICATE KEY UPDATE note=VALUES(note), status=VALUES(status);

-- Evidence types (basic)
INSERT INTO evidence_types (id, code, name_th, description) VALUES
(1, 'IMG', 'รูปภาพ', 'ไฟล์รูป'),
(2, 'PDF', 'เอกสาร PDF', 'ไฟล์ PDF')
ON DUPLICATE KEY UPDATE name_th=VALUES(name_th);

-- Attachments (for yes_no=1 indicators to satisfy evidence rule; e.g., indicator 102, 401)
INSERT INTO attachments (period_id, evaluatee_id, indicator_id, evidence_type_id, filename, mime, size, storage_path, created_at)
VALUES
(1, 3, 102, 2, 'policy-2025.pdf', 'application/pdf', 123456, '/uploads/policy-2025.pdf', NOW()),
(1, 3, 401, 1, 'discipline.jpg',  'image/jpeg',      234567, '/uploads/discipline.jpg', NOW());
