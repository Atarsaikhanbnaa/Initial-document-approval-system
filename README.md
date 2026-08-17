# Бичиг баримтын хяналтын систем

Next.js + MongoDB + Mongoose ашигласан ажиллах MVP.

## Боломжууд

- Username/password login
- Ажилтан Word `.doc` / `.docx` файл оруулах
- Хянагч сонгох
- Хянагч файл татаж авах
- Засварласан шинэ version оруулах
- Version history
- Санал/тайлбар
- Хэн үзсэн, татсан, засварласан, баталсан түүх
- Албан тушаал, хэлтэс, огноо/цаг хадгалах
- Хянасан / Баталсан / Засварт буцаасан статус

## 1. Node.js

Node.js LTS ашиглахыг зөвлөж байна.

## 2. MongoDB

Local MongoDB ажиллуулж болно:

MONGODB_URI=mongodb://127.0.0.1:27017/document_approval

эсвэл MongoDB Atlas URI ашиглана.

## 3. Project setup

```bash
npm install
```

`.env.example` файлыг `.env.local` болгож хуул.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Git Bash:

```bash
cp .env.example .env.local
```

`.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/document_approval
JWT_SECRET=THIS_SHOULD_BE_A_LONG_RANDOM_SECRET_KEY
```

## 4. Demo хэрэглэгч үүсгэх

Seed script dotenv уншихын тулд:

```bash
npm install -D dotenv
npm run seed
```

Demo:

- admin / 123456
- bat / 123456
- darga / 123456
- director / 123456

## 5. Ажиллуулах

```bash
npm run dev
```

Browser:

http://localhost:3000

## Анхаарах зүйл

Энэ MVP файл системийн `uploads/` хавтаст хадгалдаг. Production орчинд S3/MinIO/Azure Blob зэрэг object storage ашиглах нь зөв.

`JWT_SECRET`-ийг production дээр заавал соль.

Demo password-уудыг production дээр ашиглаж болохгүй.

Дараагийн хувилбарт:
- admin user management
- шаталсан reviewer workflow
- director final approval
- email/notification
- ONLYOFFICE integration
- audit export
- document number
- department-based permission
нэмж болно.
