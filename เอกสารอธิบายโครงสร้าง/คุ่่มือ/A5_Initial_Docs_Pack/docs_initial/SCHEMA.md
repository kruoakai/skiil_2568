# SCHEMA — พจนานุกรมข้อมูล (อ้างอิง `02_schema.sql`)

ตารางหลัก: `vocational_categories`, `vocational_fields`, `org_groups`, `departments`, `dept_fields`, `users`, `evaluation_periods`, `evaluation_topics`, `indicators`, `evidence_types`, `indicator_evidence`, `assignments`, `evaluation_results`, `attachments`

ความสัมพันธ์สำคัญ (ตัวอย่าง):
- indicators.topic_id → evaluation_topics.id
- indicator_evidence: (indicator_id, evidence_type_id) PK
- assignments: UNIQUE(period_id, evaluator_id, evaluatee_id)
- evaluation_results/evidence อ้าง period/evaluatee/indicator ตามเงื่อนไข

> แนะนำให้นำ `02_schema.sql` ไปเปิดใน DB Tool แล้ว export ER diagram แนบเข้าคู่มือ