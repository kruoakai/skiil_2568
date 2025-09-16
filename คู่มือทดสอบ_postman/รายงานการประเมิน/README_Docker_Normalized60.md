
# A5 MySQL (Docker) – Normalized/60 Demo

## Quick Start
```bash
# 1) Start MySQL with schema + seed + views + stored procedures
docker compose up -d

# 2) Connect (CLI)
docker exec -it a5_mysql mysql -uroot -prootpass evaluation

# 3) Try the views
SELECT * FROM v_normalized60;
CALL sp_normalized60_by_period(1);
CALL sp_topic_breakdown(1, 3);
```

## Files
- `mysql/init/01_schema_minimal.sql` – โครงสร้างตารางขั้นต่ำ
- `mysql/init/02_seed.sql` – Seed ข้อมูลตัวอย่างสำหรับทดสอบ
- `mysql/init/03_views.sql` – VIEWs: v_indicator_rates, v_topic_rates, v_normalized60
- `mysql/init/04_stored_procs.sql` – Stored procedures: sp_normalized60_by_period, sp_topic_breakdown
- `1_topic_rates_ZERO.sql`, `2_normalized60_ZERO.sql` – สูตรนโยบาย “ไม่มีผล = 0”

> หมายเหตุ: container จะรันสคริปต์ภายใน `docker-entrypoint-initdb.d` เมื่อฐานข้อมูลยังว่างครั้งแรกเท่านั้น
ถ้าปรับสคริปต์แล้วอยากรีรัน ให้ลบ volume:
```bash
docker compose down -v
docker compose up -d
```
