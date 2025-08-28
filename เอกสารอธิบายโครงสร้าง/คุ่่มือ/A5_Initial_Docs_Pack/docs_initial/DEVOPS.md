# DEVOPS — Compose, Reverse Proxy/Load Balancer, Scale

## โครง Compose (แนวทาง)
- services: db, api(2 replicas), ui, nginx (reverse proxy), phpmyadmin
- ตัวอย่างปรับแต่ง Nginx ให้ health‑check และกระจายโหลดไปยัง api ทั้งสองอินสแตนซ์
- ยิงโหลดด้วย k6/autocannon → เก็บค่า p95 และวิเคราะห์หากเกินเกณฑ์ (เช่น 500ms)

## สิ่งที่ต้องจัดเตรียม/ส่งมอบ
- `docker-compose.yml` (หรือ `docker-compose.lb.yml`) ที่รันได้จริง
- `nginx.lb.conf` พร้อม upstream หลายอินสแตนซ์
- หลักฐานทดสอบ: ภาพ `docker ps`, ผล `curl /system/health`, รายงาน k6/autocannon