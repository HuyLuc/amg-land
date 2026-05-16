# AMG Land

AMG Land la monorepo cho he thong bat dong san gom backend API, web khach hang va web noi bo cho quan ly/nhan su.

## Cau Truc

```text
amg-land/
  backend/        FastAPI API, SQLAlchemy models, Alembic migrations
  admin/          React + Vite web noi bo cho quan ly, tu van, dang bai
  frontend/       React + Vite web khach hang
  packages/       Shared contracts/types scaffold
  infra/          Docker/nginx/scripts phu tro
  docs/           Tai lieu dac ta, API, database, use case, ADR
  compose.yaml    Docker Compose entrypoint o root
```

Stack local:

- Backend API: FastAPI + Uvicorn, port `8000`
- Web khach hang: React + Vite, port `5173`
- Web noi bo: React + Vite, port `5174`
- Database: PostgreSQL 16, port `5432`
- Object storage: MinIO, API port `9000`, console port `9001`
- Migration: Alembic, service `migrate`

## Chuc Nang Hien Co

Backend expose API tai `http://localhost:8000/api/v1`.

- Auth: dang ky/dang nhap khach hang, dang nhap noi bo, refresh/logout, forgot/reset password token flow.
- Users: quan ly tai khoan quan ly, nhan vien tu van, nhan vien dang bai, khach hang.
- Projects: danh sach/chi tiet/tao/sua/xoa mem, gallery MinIO, tien ich, can ho thuoc du an.
- Apartments: danh sach/chi tiet/tao/sua/xoa, media anh/video, loc theo du an.
- Amenities: tao/sua/xoa tien ich gan theo tung du an.
- Posts: bai viet noi dung, lien ket du an/can ho, upload anh rieng cho bai viet.
- Contacts: khach tu van, gan nhan vien phu trach, lien ket du an/can ho that.
- Community: bai dang cong dong, binh luan, thich, luu, chia se, upload anh.
- Search: search da tieu chi, search phong thuy.
- Chat: message fallback, history, feng-shui suggestion.
- Analytics: create event.
- Stats: dashboard tu contact va analytics events.

## Yeu Cau Moi Truong

Can cai san:

- Docker Desktop
- Docker Compose plugin
- Node.js 20+ va npm
- PowerShell hoac terminal tuong duong

Kiem tra nhanh:

```powershell
docker --version
docker compose version
node --version
npm --version
```

## Chay Lan Dau Sau Khi Clone

Tat ca lenh duoi day chay tu thu muc root repo.

```powershell
cd D:\amg-land
```

Tao file moi truong local:

```powershell
Copy-Item .env.example .env
```

Sua `.env` neu can, toi thieu nen cau hinh tai khoan quan ly local:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_FULL_NAME=AMG Admin
JWT_SECRET_KEY=change-this-local-secret
GEMINI_API_KEY=your-gemini-api-key
SUPPORT_HOTLINE=0942319933
```

Build va chay backend stack:

```powershell
docker compose up -d --build
```

Docker Compose se:

1. Start PostgreSQL.
2. Cho PostgreSQL healthy.
3. Chay `alembic upgrade head` bang service `migrate`.
4. Start MinIO va tao bucket public mac dinh.
5. Start backend FastAPI.

Kiem tra container:

```powershell
docker compose ps
```

Kiem tra backend:

```powershell
curl http://localhost:8000/health
```

Ket qua dung:

```json
{"status":"ok"}
```

## Chay Web Noi Bo

Mo terminal moi:

```powershell
cd D:\amg-land\admin
npm install
npm run dev
```

URL:

```text
http://localhost:5174
```

Neu cong `5174` dang bi chiem, Vite se bao loi va dung lai de ban giai phong dung cong thay vi tu dong nhay sang cong khac.

Web noi bo dung API mac dinh:

```text
http://localhost:8000/api/v1
```

Neu can doi API URL, tao file `admin/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Chay Web Khach Hang

Mo terminal moi:

```powershell
cd D:\amg-land\frontend
npm install
npm run dev
```

URL:

```text
http://localhost:5173
```

Neu cong `5173` dang bi chiem, Vite se bao loi va dung lai de ban giai phong dung cong thay vi tu dong nhay sang cong khac.

Neu can doi API URL, tao file `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## URL Local

- Web khach hang: `http://localhost:5173`
- Web noi bo: `http://localhost:5174`
- Backend health: `http://localhost:8000/health`
- Backend OpenAPI: `http://localhost:8000/docs`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Thong tin MinIO mac dinh:

```text
MINIO_ROOT_USER=amgminio
MINIO_ROOT_PASSWORD=amgminio123
MINIO_BUCKET=amg-land-media
```

## Seed Du Lieu Local

Nap lai du lieu demo local:

```powershell
docker compose run --rm backend python -m app.db.seed --reset
```

Lenh nay xoa du lieu nghiep vu hien tai trong database local va nap lai bo du lieu mau. Script se tu choi chay neu `APP_ENV=production`.

## Tai Khoan Dang Nhap Local

Khi backend startup, he thong chi tu tao tai khoan admin neu ban da cau hinh trong `.env`:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_FULL_NAME=AMG Admin
```

Tai khoan nay dang nhap duoc web noi bo tai:

```text
http://localhost:5174
```

Neu chay seed demo:

```powershell
docker compose run --rm backend python -m app.db.seed --reset
```

Seeder se tao cac tai khoan mau sau:

```text
Quan ly:
  Email:    quanly@amgland.vn
  Password: Demo@12345

Nhan vien tu van:
  Email:    linh.tran@amgland.vn
  Password: Demo@12345

Nhan vien tu van:
  Email:    hoang.pham@amgland.vn
  Password: Demo@12345

Nhan vien dang bai:
  Email:    mai.do@amgland.vn
  Password: Demo@12345

Khach hang demo:
  Email:    khachhang.demo@example.com
  Password: Demo@12345
```

Neu `ADMIN_EMAIL` hoac `ADMIN_PASSWORD` da duoc cau hinh trong `.env`, tai khoan quan ly trong seed se dung gia tri do thay cho `quanly@amgland.vn / Demo@12345`.

Luu y:

- Web noi bo chi cho role `admin`, `consultant`, `content` dang nhap.
- Tai khoan `khachhang.demo@example.com` dung cho web khach hang tai `http://localhost:5173`, khong dung cho web noi bo.
- Role `consultant` la nhan vien tu van.
- Role `content` la nhan vien dang bai.

## Lenh Docker Thuong Dung

Start hoac rebuild stack:

```powershell
docker compose up -d --build
```

Dung stack nhung giu data volume:

```powershell
docker compose down
```

Dung stack va xoa data PostgreSQL/MinIO:

```powershell
docker compose down -v
```

Xem log backend:

```powershell
docker compose logs -f backend
```

Xem log migration:

```powershell
docker compose logs migrate
```

Chay shell trong backend container:

```powershell
docker compose exec backend sh
```

Chay API smoke test:

```powershell
docker compose run --rm backend pytest -q -p no:cacheprovider
```

## Migration Database

Du an dung Alembic trong `backend/alembic`.

Chay migration thu cong:

```powershell
docker compose run --rm backend alembic upgrade head
```

Tao migration moi sau khi sua SQLAlchemy models:

```powershell
docker compose run --rm backend alembic revision --autogenerate -m "describe change"
```

Xem revision hien tai:

```powershell
docker compose run --rm backend alembic current
```

Rollback migration gan nhat:

```powershell
docker compose run --rm backend alembic downgrade -1
```

Chi rollback khi ban hieu ro tac dong den du lieu.

Migration hien co dang bao phu:

- Initial schema.
- Audit/auth/analytics constraints.
- Contact link toi apartment.
- Project short description.
- Amenity category `other`.
- Apartment media.
- Customer role va phone.
- Post link toi project/apartment.
- Bo post categories.
- Post multiple images.
- Roles consultant/content va phan cong tu van.
- Community posts/comments/likes/bookmarks.

## Reset Database Local

Khi muon xoa sach database local va tao lai schema tu dau:

```powershell
docker compose down -v
docker compose up -d --build
```

Lenh `down -v` se xoa named volumes, bao gom data PostgreSQL va MinIO.

## Compose Trong `infra/docker`

Repo co them file compose phu:

```text
infra/docker/docker-compose.yml
infra/docker/.env.example
```

Neu muon chay theo bo file nay:

```powershell
Copy-Item infra/docker/.env.example infra/docker/.env
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
```

Dung stack:

```powershell
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml down
```

Mac dinh README khuyen dung `compose.yaml` o root cho don gian.

## Cau Hinh Moi Truong

File `.env` o root duoc Docker Compose tu dong doc khi chay `docker compose ...`.

Khong commit `.env` that len Git. File mau duoc commit la:

```text
.env.example
infra/docker/.env.example
```

Bien auth quan trong:

```text
JWT_SECRET_KEY=change-this-local-secret
GEMINI_API_KEY=your-gemini-api-key
SUPPORT_HOTLINE=0942319933
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_MINUTES=15
```

Chatbot tu van:

- Chatbot web co the ket hop Gemini qua model `gemini-2.5-flash`.
- Backend doc `GEMINI_API_KEY` tu moi truong de goi Gemini Developer API.
- `SUPPORT_HOTLINE` dung de chen vao cau tra loi khi khach hoi cac noi dung can tu van sau nhu phap ly, vay von, hop dong, chien luoc dau tu.

Tin tuc ben ngoai:

- Trang `Tin tuc` tren frontend tu dong lay danh sach bai viet tu Google News RSS feed, gioi han ket qua theo ngon ngu tieng Viet va khu vuc Ha Noi cho nhom tu khoa bat dong san.
- Backend expose endpoint `GET /api/v1/news/external` de frontend hien thi feed nay.

Trong `APP_ENV=production`, backend yeu cau `JWT_SECRET_KEY` phai duoc cau hinh ro rang.

Bien CORS local:

```text
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

## Backend Development

Backend Dockerfile:

```text
backend/Dockerfile
```

Backend source duoc mount vao container qua volume:

```text
./backend/app:/app/app
```

Vi vay khi sua code trong `backend/app`, Uvicorn reload tu dong trong moi truong development.

Dependency Python:

```text
backend/requirements.txt
```

Sau khi them package Python moi, rebuild backend:

```powershell
docker compose up -d --build backend
```

## Frontend Development

Admin va frontend la hai app Vite rieng:

```powershell
cd admin
npm run dev
```

```powershell
cd frontend
npm run dev
```

Kiem tra TypeScript khong build:

```powershell
cd admin
npx tsc --noEmit --pretty false
```

```powershell
cd frontend
npx tsc --noEmit --pretty false
```

## Troubleshooting

Backend khong start vi migration fail:

```powershell
docker compose logs migrate
```

PostgreSQL chua healthy:

```powershell
docker compose logs postgres
```

Port bi trung thi sua `.env`:

```text
BACKEND_PORT=8000
POSTGRES_PORT=5432
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
```

Build lai sach image backend:

```powershell
docker compose build --no-cache backend migrate
docker compose up -d
```
