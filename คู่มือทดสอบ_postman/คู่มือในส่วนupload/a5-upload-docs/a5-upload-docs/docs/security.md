# ความปลอดภัยและนโยบายไฟล์

## Upload Policy
- MIME whitelist (เช่น `application/pdf`, `image/png`, `image/jpeg`, `image/webp`, …)
- จำกัดขนาดไฟล์ด้วย `UPLOAD_MAX_MB` (จาก `.env`)
- โฟลเดอร์จัดเก็บ: `uploads/{period_id}/{evaluatee_id}/`
- ชื่อไฟล์: `{timestamp}_{safeName}.{ext}`

## ตัวอย่าง Multer Filter (ย่อ)
```js
const ALLOWED = new Set(['application/pdf','image/png','image/jpeg','image/webp']);
function fileFilter(req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) return cb(new Error('Unsupported file type'), false);
  cb(null, true);
}
```

## การเสิร์ฟไฟล์แบบ static
```js
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  immutable: true,
  maxAge: '30d',
  setHeaders: (res, p) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));
```

## Nginx: ปิดการ execute
```nginx
location /uploads/ {
  alias /var/www/app/backend/uploads/;
  autoindex off;
  default_type application/octet-stream;
  add_header X-Content-Type-Options nosniff;
  types { }
}
```

## Audit & Logging
เก็บ `user_id, action (upload/replace/delete), ip, user_agent, file_meta, timestamp`

## สำรองไฟล์ & Storage
- Production แนะนำแยก storage (เช่น S3/NFS) + snapshot/backup
- ตรวจ checksum (เช่น SHA-256) เพื่อยืนยันความถูกต้อง

## HTTPS
- บังคับ HTTPS ทุก endpoint ที่รับไฟล์/ข้อมูลส่วนบุคคล
- ตั้งค่า CORS ตาม `CORS_ORIGIN` ควบคุมโดเมนที่อนุญาต