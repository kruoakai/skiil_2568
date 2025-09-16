# A5 Upload Guide — MkDocs Project

## Setup
```bash
python -m pip install mkdocs-material mkdocs-mermaid2-plugin mkdocs-with-pdf
mkdocs serve
mkdocs build
```
- ผลลัพธ์เว็บไซต์อยู่ที่ `site/`
- ปลั๊กอิน `with-pdf` จะสร้างไฟล์ `site/A5_Upload_Guide.pdf`

## Export DOCX/PDF with Pandoc
เตรียมไฟล์ `template_th.docx` (สไตล์ TH Sarabun) แล้วรันคำสั่งใน `docs/appendix.md` ส่วน Pandoc