# Data Dictionary & Schema Guide — `02_schema.sql`

คู่มือทำความเข้าใจสคีมาเพื่อใช้พัฒนาตามเอกสาร A5 (Backend/Frontend/QA)

## 1) ภาพรวมโดเมน
- หน่วยงาน/ผู้ใช้ → `vocational_categories`/`vocational_fields`/`departments`/`org_groups`/`users`
- แบบประเมิน → `evaluation_periods`/`evaluation_topics`/`indicators`/`evidence_types` + map `indicator_evidence`
- มอบหมาย/ผล/ไฟล์ → `assignments`/`evaluation_results`/`attachments`

### ER (Mermaid)
```mermaid
erDiagram
  vocational_categories {
    string id PK
    string code UNIQUE
    string name_th
  }
  vocational_fields {
    string code PK
    string name_th
    string category_id FK
  }
  org_groups {
    string id PK
    string code UNIQUE
    string name_th
  }
  departments {
    string id PK
    string code UNIQUE
    string name_th
    string category_id FK
    string org_group_id FK
  }
  dept_fields {
    string dept_id PK/FK
    string field_code PK/FK
  }
  users {
    string id PK
    string email UNIQUE
    string password
    string name_th
    string role
    string status
    string department_id FK
    string org_group_id FK
  }
  evaluation_periods {
    string id PK
    string code UNIQUE
    string name_th
    string buddhist_year
    string start_date
    string end_date
    string is_active
  }
  evaluation_topics {
    string id PK
    string code UNIQUE
    string title_th
    string description
    string weight
    string active
  }
  indicators {
    string id PK
    string topic_id FK
    string code UNIQUE
    string name_th
    string type
    string weight
    string min_score
    string max_score
    string active
  }
  evidence_types {
    string id PK
    string code UNIQUE
    string name_th
    string description
  }
  indicator_evidence {
    string indicator_id PK/FK
    string evidence_type_id PK/FK
  }
  assignments {
    string id PK
    string period_id FK
    string evaluator_id FK
    string evaluatee_id FK
    string dept_id FK
    string UNIQUE(period,evaluator,evaluatee)
  }
  evaluation_results {
    string id PK
    string period_id FK
    string evaluatee_id FK
    string evaluator_id FK
    string topic_id FK
    string indicator_id FK
    string score
    string value_yes_no
    string status
  }
  attachments {
    string id PK
    string period_id FK
    string evaluatee_id FK
    string indicator_id FK
    string evidence_type_id FK
    string file_name
    string mime_type
    string size_bytes
    string storage_path
  }
  vocational_fields }o--|| vocational_categories : category_id → id
  departments }o--|| vocational_categories : category_id → id
  departments }o--|| org_groups : org_group_id → id
  dept_fields }o--|| departments : dept_id → id
  dept_fields }o--|| vocational_fields : field_code → code
  users }o--|| departments : department_id → id
  users }o--|| org_groups : org_group_id → id
  indicators }o--|| evaluation_topics : topic_id → id
  indicator_evidence }o--|| indicators : indicator_id → id
  indicator_evidence }o--|| evidence_types : evidence_type_id → id
  assignments }o--|| evaluation_periods : period_id → id
  assignments }o--|| users : evaluator_id → id
  assignments }o--|| users : evaluatee_id → id
  assignments }o--|| departments : dept_id → id
  evaluation_results }o--|| evaluation_periods : period_id → id
  evaluation_results }o--|| users : evaluatee_id → id
  evaluation_results }o--|| users : evaluator_id → id
  evaluation_results }o--|| evaluation_topics : topic_id → id
  evaluation_results }o--|| indicators : indicator_id → id
  attachments }o--|| evaluation_periods : period_id → id
  attachments }o--|| users : evaluatee_id → id
  attachments }o--|| indicators : indicator_id → id
  attachments }o--|| evidence_types : evidence_type_id → id
```

## 2) Data Dictionary (คอลัมน์/ข้อจำกัด/ดัชนี)
### assignments

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `period_id` | BIGINT UNSIGNED NOT NULL | |
| `evaluator_id` | BIGINT UNSIGNED NOT NULL | |
| `evaluatee_id` | BIGINT UNSIGNED NOT NULL | |
| `dept_id` | INT NULL | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Constraints**
- CONSTRAINT fk_asg_period
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id)
    ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_asg_evalr
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
- CONSTRAINT fk_asg_evale
    FOREIGN KEY (evaluatee_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
- CONSTRAINT fk_asg_dept
    FOREIGN KEY (dept_id) REFERENCES departments(id)
    ON DELETE SET NULL ON UPDATE CASCADE
- CONSTRAINT uniq_asg UNIQUE (period_id, evaluator_id, evaluatee_id)

**Indexes**
- KEY idx_asg_evalr (evaluator_id, period_id)
- KEY idx_asg_evale (evaluatee_id, period_id)

### attachments

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `period_id` | BIGINT UNSIGNED NOT NULL | |
| `evaluatee_id` | BIGINT UNSIGNED NOT NULL | |
| `indicator_id` | BIGINT UNSIGNED NOT NULL | |
| `evidence_type_id` | INT NOT NULL | |
| `file_name` | VARCHAR(255) NOT NULL | |
| `mime_type` | VARCHAR(100) NOT NULL | |
| `size_bytes` | INT UNSIGNED NOT NULL | |
| `storage_path` | VARCHAR(1024) NOT NULL | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Constraints**
- CONSTRAINT fk_att_period  FOREIGN KEY (period_id)       REFERENCES evaluation_periods(id) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_att_evale   FOREIGN KEY (evaluatee_id)    REFERENCES users(id)              ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_att_ind     FOREIGN KEY (indicator_id)    REFERENCES indicators(id)         ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_att_evtype  FOREIGN KEY (evidence_type_id) REFERENCES evidence_types(id)    ON DELETE RESTRICT ON UPDATE CASCADE

**Indexes**
- KEY idx_attach_evale (evaluatee_id, period_id)

### departments

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | |
| `code` | VARCHAR(20) NOT NULL UNIQUE | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `category_id` | INT NOT NULL | |
| `org_group_id` | INT NOT NULL | |

**Constraints**
- CONSTRAINT fk_dept_cat
    FOREIGN KEY (category_id) REFERENCES vocational_categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
- CONSTRAINT fk_dept_org
    FOREIGN KEY (org_group_id) REFERENCES org_groups(id)
    ON DELETE RESTRICT ON UPDATE CASCADE

### dept_fields

| Column | Type/Definition | Notes |
|---|---|---|
| `dept_id` | INT NOT NULL | |
| `field_code` | VARCHAR(10) NOT NULL | |

**Constraints**
- PRIMARY KEY (dept_id, field_code)
- CONSTRAINT fk_df_dept
    FOREIGN KEY (dept_id) REFERENCES departments(id)
    ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_df_field
    FOREIGN KEY (field_code) REFERENCES vocational_fields(code)
    ON DELETE CASCADE ON UPDATE CASCADE

### evaluation_periods

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `code` | VARCHAR(30) NOT NULL UNIQUE | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `buddhist_year` | INT NOT NULL | |
| `start_date` | DATE NOT NULL | |
| `end_date` | DATE NOT NULL | |
| `is_active` | TINYINT(1) NOT NULL DEFAULT 1 | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |

### evaluation_results

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `period_id` | BIGINT UNSIGNED NOT NULL | |
| `evaluatee_id` | BIGINT UNSIGNED NOT NULL | |
| `evaluator_id` | BIGINT UNSIGNED NOT NULL | |
| `topic_id` | BIGINT UNSIGNED NOT NULL | |
| `indicator_id` | BIGINT UNSIGNED NOT NULL | |
| `score` | DECIMAL(5,2) NULL | |
| `value_yes_no` | TINYINT(1) NULL | |
| `notes` | TEXT NULL | |
| `status` | ENUM('draft','submitted') NOT NULL DEFAULT 'draft' | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Constraints**
- CONSTRAINT fk_res_period  FOREIGN KEY (period_id)    REFERENCES evaluation_periods(id) ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_res_evale   FOREIGN KEY (evaluatee_id) REFERENCES users(id)              ON DELETE RESTRICT ON UPDATE CASCADE
- CONSTRAINT fk_res_evalr   FOREIGN KEY (evaluator_id) REFERENCES users(id)              ON DELETE RESTRICT ON UPDATE CASCADE
- CONSTRAINT fk_res_topic   FOREIGN KEY (topic_id)     REFERENCES evaluation_topics(id)  ON DELETE RESTRICT ON UPDATE CASCADE
- CONSTRAINT fk_res_ind     FOREIGN KEY (indicator_id) REFERENCES indicators(id)         ON DELETE RESTRICT ON UPDATE CASCADE

**Indexes**
- KEY idx_results_evale (evaluatee_id, period_id)
- KEY idx_results_indicator (indicator_id)

### evaluation_topics

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `code` | VARCHAR(30) NOT NULL UNIQUE | |
| `title_th` | VARCHAR(255) NOT NULL | |
| `description` | TEXT NULL | |
| `weight` | DECIMAL(5,2) NOT NULL DEFAULT 0.00 | |
| `active` | TINYINT(1) NOT NULL DEFAULT 1 | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |

### evidence_types

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | |
| `code` | VARCHAR(30) NOT NULL UNIQUE | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `description` | TEXT NULL | |

### indicator_evidence

| Column | Type/Definition | Notes |
|---|---|---|
| `indicator_id` | BIGINT UNSIGNED NOT NULL | |
| `evidence_type_id` | INT NOT NULL | |

**Constraints**
- PRIMARY KEY (indicator_id, evidence_type_id)
- CONSTRAINT fk_ie_ind
    FOREIGN KEY (indicator_id) REFERENCES indicators(id)
    ON DELETE CASCADE ON UPDATE CASCADE
- CONSTRAINT fk_ie_ev
    FOREIGN KEY (evidence_type_id) REFERENCES evidence_types(id)
    ON DELETE CASCADE ON UPDATE CASCADE

### indicators

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `topic_id` | BIGINT UNSIGNED NOT NULL | |
| `code` | VARCHAR(40) NOT NULL UNIQUE | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `description` | TEXT NULL | |
| `type` | ENUM('score_1_4','yes_no','file_url') NOT NULL DEFAULT 'score_1_4' | |
| `weight` | DECIMAL(5,2) NOT NULL DEFAULT 1.00 | |
| `min_score` | TINYINT NOT NULL DEFAULT 1 | |
| `max_score` | TINYINT NOT NULL DEFAULT 4 | |
| `active` | TINYINT(1) NOT NULL DEFAULT 1 | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |

**Constraints**
- CONSTRAINT fk_ind_topic
    FOREIGN KEY (topic_id) REFERENCES evaluation_topics(id)
    ON DELETE CASCADE ON UPDATE CASCADE

**Indexes**
- KEY idx_ind_topic (topic_id)

### org_groups

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | |
| `code` | VARCHAR(20) NOT NULL UNIQUE | |
| `name_th` | VARCHAR(255) NOT NULL | |

### users

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY | |
| `email` | VARCHAR(255) NOT NULL UNIQUE | |
| `password` | VARCHAR(255) NOT NULL | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `role` | ENUM('admin','evaluator','evaluatee') NOT NULL | |
| `status` | ENUM('active','disabled') NOT NULL DEFAULT 'active' | |
| `department_id` | INT NULL | |
| `org_group_id` | INT NULL | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Constraints**
- CONSTRAINT fk_users_dept
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE SET NULL ON UPDATE CASCADE
- CONSTRAINT fk_users_org
    FOREIGN KEY (org_group_id) REFERENCES org_groups(id)
    ON DELETE SET NULL ON UPDATE CASCADE

### vocational_categories

| Column | Type/Definition | Notes |
|---|---|---|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | |
| `code` | VARCHAR(10) NOT NULL UNIQUE | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP | |

### vocational_fields

| Column | Type/Definition | Notes |
|---|---|---|
| `code` | VARCHAR(10) PRIMARY KEY | |
| `name_th` | VARCHAR(255) NOT NULL | |
| `category_id` | INT NOT NULL | |

**Constraints**
- CONSTRAINT fk_vf_cat
    FOREIGN KEY (category_id) REFERENCES vocational_categories(id)
    ON DELETE CASCADE ON UPDATE CASCADE

## 3) VIEW (ถ้ามี)
```sql
CREATE OR REPLACE VIEW v_evidence_progress AS
SELECT
  u.name_th AS evaluatee_name,
  d.name_th AS dept_name,
  p.buddhist_year,
  t.title_th AS topic_title,
  i.code AS indicator_code,
  i.name_th AS indicator_name,
  COUNT(a.id) AS files_uploaded
FROM users u
JOIN departments d ON d.id = u.department_id
JOIN assignments s ON s.evaluatee_id = u.id
JOIN evaluation_periods p ON p.id = s.period_id AND p.is_active = 1
JOIN indicators i ON 1=1
JOIN evaluation_topics t ON t.id = i.topic_id
LEFT JOIN attachments a
  ON a.indicator_id = i.id
 AND a.evaluatee_id = u.id
 AND a.period_id = p.id
WHERE u.role = 'evaluatee'
GROUP BY u.name_th, d.name_th, p.buddhist_year, t.title_th, i.code, i.name_th
ORDER BY u.name_th, t.title_th, i.code;
```

---