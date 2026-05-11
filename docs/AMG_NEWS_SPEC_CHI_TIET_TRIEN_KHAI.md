# SPEC CHI TIET DU AN AMG NEWS

Website tin tuc bat dong san va tim kiem khach hang cho AMG Land

Phien ban: 1.0  
Ngay lap: 11/05/2026  
Nguon tong hop: `AMG_News_BaoCaoVietNam_DacTaChiTiet.md`, `Use Case.html`, `Database.html`, `API Endpoints.html`

---

## 1. Tong Quan Du An

AMG News la web application phuc vu cong ty AMG Land trong viec cong bo thong tin du an bat dong san, ho tro khach hang tim kiem can ho phu hop va thu thap lead tu cac nhu cau tu van. He thong gom website public cho khach hang va CMS private cho nhan vien/admin.

Gia tri chinh cua san pham:

- Cung cap kenh thong tin chinh thong, chuyen nghiep cho cac du an AMG Land dang phan phoi.
- Ho tro khach hang loc du an/can ho theo vi tri, gia, dien tich, so phong, huong nha va phong thuy.
- Tich hop AI chatbot su dung Google Gemini API de tu van phong thuy va goi y can ho.
- Cung cap CMS de nhan vien quan ly du an, can ho, tien ich, bai viet va yeu cau tu van.

## 2. Pham Vi

### 2.1. Trong Pham Vi

- Frontend website public responsive cho desktop, tablet, mobile.
- Backend REST API bang FastAPI.
- PostgreSQL database cho du lieu co cau truc.
- CMS cho admin, editor/nhan vien va viewer.
- Luu tru anh du an, mat bang va thumbnail qua MinIO.
- AI chatbot tu van phong thuy va goi y can ho tu du lieu he thong.
- Xac thuc CMS bang JWT, mat khau hash bang bcrypt.
- Docker hoa cac thanh phan backend, database va object storage.

### 2.2. Ngoai Pham Vi Giai Doan Dau

- Ung dung mobile native iOS/Android.
- Thanh toan truc tuyen.
- Ky hop dong dien tu.
- CRM day du nhu pipeline ban hang, nhac viec, email automation nang cao.
- Tich hop san giao dich bat dong san ben thu ba.

## 3. Actor Va Phan Quyen

| Actor | Mo ta | Quyen chinh |
| --- | --- | --- |
| Khach hang | Nguoi truy cap website tim hieu du an/can ho | Xem du an, can ho, tin tuc; tim kiem; dung chatbot; gui yeu cau tu van |
| Viewer | Tai khoan noi bo chi doc | Xem dashboard/co so du lieu theo phan quyen, khong duoc sua |
| Editor/Nhan vien | Nhan vien kinh doanh/marketing | Quan ly du an, can ho, tien ich, bai viet, yeu cau tu van |
| Admin | Quan tri cap cao | Toan quyen, bao gom quan ly user, xoa du lieu, xem thong ke |

Quy uoc role trong database: `admin`, `editor`, `viewer`.

## 4. Kien Truc He Thong

### 4.1. Kien Truc 3 Lop

| Lop | Thanh phan | Trach nhiem |
| --- | --- | --- |
| Presentation | React.js, Tailwind CSS | UI website public va CMS, responsive, goi REST API |
| Business Logic | FastAPI | Xu ly nghiep vu, xac thuc, phan quyen, chatbot, tim kiem |
| Data | PostgreSQL, MinIO | Luu tru du lieu quan he va media/object storage |

### 4.2. Cong Nghe De Xuat

| Hang muc | Cong nghe | Ghi chu |
| --- | --- | --- |
| Frontend | React.js | Cong nghe frontend da chot, component-based, phu hop website public va CMS |
| Styling | Tailwind CSS | Dong bo design system, responsive nhanh |
| Backend | FastAPI | API REST, OpenAPI/Swagger tu dong |
| Database | PostgreSQL | Phu hop quan he du an - can ho - tien ich |
| Migration | Alembic | Quan ly schema version |
| Auth | JWT + bcrypt | JWT nen luu trong httpOnly cookie cho CMS |
| AI | Google Gemini API | Tu van tieng Viet, sinh giai thich phong thuy |
| Object Storage | MinIO | Luu anh du an, mat bang, thumbnail |
| Deploy | Docker/Docker Compose | Dong bo moi truong dev/staging/production |

## 5. Yeu Cau Chuc Nang

### 5.1. Website Public

#### F-01. Trang Chu

Mo ta: Trang dau tien gioi thieu AMG News, hien thi du an noi bat, thanh tim kiem nhanh, tin tuc moi va nut mo chatbot AI.

Thanh phan:

- Header: logo AMG News/AMG Land, menu du an, tin tuc, lien he, CTA dang ky tu van.
- Hero/banner slider: du an noi bat, anh nen, ten du an, vi tri, gia tu, nut xem chi tiet.
- Search nhanh: quan/huyen, khoang gia, dien tich, so phong ngu.
- Section du an noi bat: card gom anh, ten, dia chi, gia tu, trang thai.
- Section tin tuc moi: danh sach bai viet moi nhat.
- Floating chatbot button.

Acceptance criteria:

- Trang tai du lieu du an active va bai viet published.
- Neu API loi, hien skeleton/loading va thong bao loi than thien.
- Neu khong co du lieu, hien empty state phu hop.
- Responsive tot tu 375px den 1920px.

#### F-02. Danh Sach Du An

Mo ta: Khach hang xem toan bo du an dang hien thi, co phan trang va loc.

Bo loc:

- Quan/huyen.
- Trang thai du an.
- Gia khoi diem.
- Tu khoa ten du an.

Acceptance criteria:

- Mac dinh hien 10 du an/trang.
- Chi hien du an `status=active` va `deleted_at IS NULL`.
- URL nen luu query filter de co the share link.

#### F-03. Chi Tiet Du An

Mo ta: Trang thong tin sau ve mot du an.

Thanh phan:

- Gallery anh va lightbox.
- Thong tin tong quan: ten, dia chi, quan, thanh pho, gia tu, mo ta.
- Ban do vi tri.
- Tabs: Tong quan, Tien ich, Mat bang, Can ho.
- Danh sach tien ich noi khu/ngoai khu.
- Mat bang tang dien hinh.
- Bang can ho co loc theo tang, so phong, huong, trang thai.
- Form/nut dang ky tu van sticky.

Acceptance criteria:

- Truy cap slug khong ton tai tra ve 404.
- Anh loi hien placeholder.
- Can ho da ban van co the xem thong tin nhung CTA lien he bi an hoac doi thanh "Da ban".

#### F-04. Chi Tiet Can Ho

Mo ta: Modal hoac trang rieng hien thi thong so can ho.

Thong tin can hien:

- Ma can, du an, tang, dien tich, so phong ngu, so WC.
- Huong nha, gia, trang thai.
- Menh/phong thuy phu hop.
- CTA dang ky tu van neu can ho con trong/da dat.

Acceptance criteria:

- Badge trang thai: `available`, `reserved`, `sold`.
- Gia hien thi dinh dang VND.
- Khong hien thong tin can ho thuoc du an bi dong/xoa tren public.

#### F-05. Tim Kiem Va Loc Da Tieu Chi

Mo ta: Khach hang tim can ho theo nhieu dieu kien.

Tieu chi:

- Quan/huyen.
- Gia toi thieu/toi da.
- Dien tich toi thieu/toi da.
- So phong ngu.
- Loai hinh bat dong san neu du lieu co ho tro.
- Huong nha.
- Trang thai can ho.

Acceptance criteria:

- Debounce 300ms khi nguoi dung thay doi bo loc.
- Hien tong so ket qua.
- Ho tro sap xep theo gia tang/giam, dien tich tang/giam.
- Neu khong co ket qua, goi y mo rong tieu chi.

#### F-06. Chatbot AI Tu Van Phong Thuy

Mo ta: Chatbot hoi thong tin khach hang, tu van phong thuy va goi y can ho.

Input chinh:

- Ngay/thang/nam sinh.
- Nhu cau: mua/thue.
- Ngan sach.
- Quan/huyen uu tien.
- Dien tich/so phong mong muon neu co.

Xu ly:

1. Tao hoac tai `session_id`.
2. Luu tin nhan nguoi dung vao `chat_sessions`.
3. Xac dinh menh, huong hop/ky.
4. Loc can ho bang rule-based query.
5. Goi Gemini API de sinh giai thich tu nhien.
6. Tra ve cau tra loi va danh sach can ho goi y.

Acceptance criteria:

- Timeout Gemini API toi da 10 giay.
- Khi Gemini API loi, tra thong bao fallback va hotline/form lien he.
- Goi y toi da 5 can ho trong khung chat, endpoint phong thuy co the tra top 10.
- Lich su chat het han sau 24h.

#### F-07. Bo Loc Phong Thuy

Mo ta: Form rieng cho khach nhap ngay sinh va dieu kien co ban de loc can ho hop phong thuy.

Acceptance criteria:

- Validate ngay sinh hop le.
- Hien menh, huong hop, huong ky.
- Ket qua co `score` va `reason`.

#### F-08. Tin Tuc Va Bai Viet

Mo ta: Khu vuc noi dung tin tuc thi truong, phan tich xu huong, bai viet SEO.

Chuc nang:

- Danh sach bai viet published.
- Tim kiem theo keyword.
- Loc theo danh muc.
- Trang chi tiet bai viet theo slug.

Acceptance criteria:

- Chi hien bai `status=published` va `published_at <= now`.
- Noi dung HTML duoc sanitize truoc khi render.
- Thumbnail loi hien placeholder.

#### F-09. Lien He Va Dang Ky Tu Van

Mo ta: Khach gui thong tin de nhan tu van.

Fields:

- Ho ten: bat buoc.
- So dien thoai: bat buoc, validate dinh dang Viet Nam.
- Email: tuy chon, validate email neu co.
- Du an quan tam: tuy chon.
- Loi nhan: tuy chon.

Acceptance criteria:

- Luu vao `contact_requests` voi `status=new`.
- Rate limit 3 request/gio/IP.
- Hien thong bao thanh cong ro rang sau khi submit.

### 5.2. CMS

#### CMS-01. Dang Nhap, Dang Xuat, Quen Mat Khau

Chuc nang:

- Dang nhap bang email/mat khau.
- Hash mat khau bang bcrypt, salt rounds >= 10.
- Cap access token va refresh token.
- Sai mat khau 5 lan khoa tai khoan 15 phut.
- Quen mat khau gui reset link qua email, token het han sau 1 gio.

Acceptance criteria:

- JWT luu httpOnly cookie neu CMS cung domain.
- Logout revoke refresh token.
- Log last_login va failed_attempts.

#### CMS-02. Quan Ly Nguoi Dung

Chi Admin duoc:

- Xem danh sach user.
- Tao user moi.
- Cap nhat ho ten, role, is_active.
- Xoa/vo hieu hoa user.

Rang buoc:

- Khong cho xoa tai khoan dang dang nhap.
- Email la duy nhat.
- Role hop le: `admin`, `editor`, `viewer`.

#### CMS-03. Quan Ly Du An

Nhan vien/Admin duoc:

- Tao, cap nhat du an.
- Upload anh dai dien va gallery.
- Gan tien ich.
- Upload mat bang tang.
- Cap nhat trang thai: `draft`, `active`, `closed`.

Admin duoc xoa mem du an.

Validation:

- Ten, slug, dia chi, quan, thanh pho, gia tu bat buoc.
- Anh chi nhan JPG/PNG/WebP, toi da 5MB/file.
- Slug tu dong sinh tu ten va phai duy nhat.

#### CMS-04. Quan Ly Can Ho

Chuc nang:

- Them/sua/xoa can ho trong du an.
- Cap nhat ma can, tang, dien tich, so phong, WC, huong, gia, menh phu hop, trang thai.

Validation:

- Ma can khong trung trong cung du an.
- Gia va dien tich > 0.
- Huong thuoc tap: `N`, `S`, `E`, `W`, `NE`, `NW`, `SE`, `SW`.
- Trang thai: `available`, `reserved`, `sold`.

#### CMS-05. Quan Ly Tien Ich

Chuc nang:

- Them/sua/xoa tien ich.
- Phan loai `internal`/`external`.
- Gan tien ich cho tung du an.

Rang buoc:

- Khi xoa tien ich dang duoc gan, he thong can canh bao.

#### CMS-06. Quan Ly Bai Viet

Chuc nang:

- Soan bai bang rich text editor.
- Upload thumbnail.
- Chon category.
- Luu nhap, dang ngay, dat lich, an bai.

Validation:

- Tieu de va noi dung bat buoc.
- Slug duy nhat.
- HTML content can sanitize o backend hoac khi render.

#### CMS-07. Quan Ly Yeu Cau Tu Van

Chuc nang:

- Xem danh sach contact request.
- Loc theo trang thai.
- Gan nhan vien phu trach.
- Ghi chu noi bo.
- Cap nhat trang thai `new`, `processing`, `done`.

Acceptance criteria:

- Nhan vien khong duoc thay doi du lieu contact ngoai cac field xu ly.
- Moi thay doi quan trong nen ghi activity log neu module log duoc bo sung.

#### CMS-08. Dashboard Thong Ke

Chi Admin duoc xem:

- Luot truy cap.
- Yeu cau tu van moi.
- Du an duoc xem nhieu.
- Can ho duoc quan tam nhieu.
- Bieu do theo tuan/thang.
- Xuat PDF/Excel neu co.

Ghi chu: Tai lieu hien tai chua co bang luu page view/event, can bo sung bang analytics neu muon thong ke that.

## 6. Use Case Matrix

| Ma | Ten | Actor | Uu tien | Module |
| --- | --- | --- | --- | --- |
| UC-01 | Trang chu | Khach hang | Cao | Public |
| UC-02 | Xem danh sach du an | Khach hang | Cao | Public |
| UC-03 | Chi tiet du an | Khach hang | Cao | Public |
| UC-04 | Xem chi tiet can ho | Khach hang | Cao | Public |
| UC-05 | Tim kiem & Loc | Khach hang | Cao | Search |
| UC-06 | Chatbot AI tu van | Khach hang | Cao | AI |
| UC-07 | Goi y ca nhan hoa | Khach hang | Trung binh | AI/Search |
| UC-08 | Tin tuc & Bai viet | Khach hang | Trung binh | Content |
| UC-09 | Lien he & Dang ky tu van | Khach hang | Cao | Lead |
| UC-10 | Bo loc phong thuy | Khach hang | Trung binh | Search/AI |
| UC-11 | Dang nhap CMS | Staff/Admin | Cao | Auth |
| UC-12 | Quan ly nguoi dung | Admin | Cao | CMS |
| UC-13 | Quan ly du an | Staff/Admin | Cao | CMS |
| UC-14 | Quan ly can ho | Staff/Admin | Cao | CMS |
| UC-15 | Quan ly tien ich | Staff/Admin | Trung binh | CMS |
| UC-16 | Quan ly bai viet | Staff/Admin | Trung binh | CMS |
| UC-17 | Quan ly yeu cau tu van | Staff/Admin | Trung binh | CMS |
| UC-18 | Thong ke & Bao cao | Admin | Thap | CMS |

## 7. Mo Hinh Du Lieu

### 7.1. Bang Chinh

| Bang | Muc dich |
| --- | --- |
| users | Tai khoan CMS |
| projects | Thong tin du an |
| apartments | Thong tin can ho |
| amenities | Danh muc tien ich |
| project_amenities | Lien ket du an - tien ich |
| floor_plans | Anh/mat bang tang cua du an |
| project_images | Gallery anh du an |
| posts | Bai viet tin tuc |
| categories | Danh muc bai viet |
| contact_requests | Lead/yeu cau tu van |
| chat_sessions | Lich su hoi thoai chatbot |

### 7.2. Cac Enum Can Chuan Hoa

| Ten | Gia tri |
| --- | --- |
| user_role | `admin`, `editor`, `viewer` |
| project_status | `draft`, `active`, `closed` |
| apartment_status | `available`, `reserved`, `sold` |
| post_status | `draft`, `published`, `archived` |
| contact_status | `new`, `processing`, `done` |
| amenity_category | `internal`, `external` |
| direction | `N`, `S`, `E`, `W`, `NE`, `NW`, `SE`, `SW` |

### 7.3. Quan He

- `users 1-n projects`: user tao nhieu du an.
- `projects 1-n apartments`: mot du an co nhieu can ho.
- `projects n-n amenities` qua `project_amenities`.
- `projects 1-n floor_plans`.
- `projects 1-n project_images`.
- `categories 1-n posts`.
- `users 1-n posts`.
- `projects 1-n contact_requests`.
- `users 1-n contact_requests` qua `assigned_to`.

### 7.4. De Xuat Bo Sung Schema

Tai lieu co nhac den log hoat dong va thong ke truy cap nhung chua co bang rieng. Nen bo sung:

`activity_logs`:

- id UUID PK
- user_id UUID nullable FK users.id
- action VARCHAR(100)
- entity_type VARCHAR(50)
- entity_id UUID nullable
- metadata JSONB
- ip_address VARCHAR(45)
- created_at TIMESTAMP

`analytics_events`:

- id UUID PK
- session_id VARCHAR(100)
- event_name VARCHAR(100)
- entity_type VARCHAR(50) nullable
- entity_id UUID nullable
- path VARCHAR(500)
- user_agent TEXT
- ip_address VARCHAR(45)
- created_at TIMESTAMP

## 8. API Specification Tom Tat

Base path: `/api/v1`

### 8.1. Projects

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| GET | `/projects` | Public | Lay danh sach du an, ho tro `page`, `limit`, `district`, `status` |
| GET | `/projects/{slug}` | Public | Lay chi tiet du an theo slug |
| POST | `/projects` | Admin/Staff | Tao du an moi |
| PUT | `/projects/{id}` | Admin/Staff | Cap nhat du an |
| DELETE | `/projects/{id}` | Admin | Xoa mem du an |
| POST | `/projects/{id}/images` | Admin/Staff | Upload anh du an len MinIO |

### 8.2. Apartments

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| GET | `/projects/{id}/apartments` | Public | Lay can ho theo du an, loc theo tang/phong/huong/status |
| GET | `/apartments/{id}` | Public | Lay chi tiet can ho |
| POST | `/apartments` | Admin/Staff | Tao can ho |
| PUT | `/apartments/{id}` | Admin/Staff | Cap nhat can ho |
| DELETE | `/apartments/{id}` | Admin | Xoa can ho |

### 8.3. Search & Feng Shui

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| GET | `/search` | Public | Tim kiem da tieu chi |
| GET | `/search/feng-shui` | Public | Loc theo ngay sinh, ngan sach, quan/huyen |

### 8.4. AI Chatbot

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| POST | `/chat/message` | Public | Gui tin nhan chatbot |
| GET | `/chat/{session_id}` | Public | Lay lich su chat |
| POST | `/chat/feng-shui` | Public | Tu van phong thuy va goi y can ho |

### 8.5. Posts

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| GET | `/posts` | Public | Lay danh sach bai viet |
| GET | `/posts/{slug}` | Public | Lay chi tiet bai viet |
| POST | `/posts` | Admin/Staff | Tao bai viet |
| PUT | `/posts/{id}` | Admin/Staff | Cap nhat bai viet |
| DELETE | `/posts/{id}` | Admin | Xoa bai viet |

### 8.6. Contact Requests

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| POST | `/contacts` | Public | Gui yeu cau tu van |
| GET | `/contacts` | Admin/Staff | Lay danh sach yeu cau |
| PATCH | `/contacts/{id}` | Admin/Staff | Cap nhat trang thai/ghi chu/nguoi phu trach |

### 8.7. Auth & Users

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Dang nhap CMS |
| POST | `/auth/refresh` | JWT | Lam moi token |
| POST | `/auth/logout` | JWT | Dang xuat |
| POST | `/auth/forgot-password` | Public | Gui email reset |
| POST | `/auth/reset-password` | Public | Dat lai mat khau |
| GET | `/users` | Admin | Lay danh sach user |
| POST | `/users` | Admin | Tao user |
| PUT | `/users/{id}` | Admin | Cap nhat user |
| DELETE | `/users/{id}` | Admin | Xoa/vo hieu hoa user |

### 8.8. Statistics

| Method | Endpoint | Auth | Mo ta |
| --- | --- | --- | --- |
| GET | `/stats/dashboard` | Admin | Lay dashboard theo `period=week|month` |

## 9. Thuat Toan Goi Y Can Ho

### 9.1. Input

- Ngay sinh.
- Ngan sach toi da/toi thieu.
- Quan/huyen uu tien.
- Dien tich mong muon.
- So phong ngu.
- Nhu cau mua/thue neu co.

### 9.2. Xu Ly

1. Validate input.
2. Tinh menh ngu hanh tu ngay sinh.
3. Xac dinh huong hop va huong ky.
4. Loc cung:
   - `apartments.status = 'available'`
   - Gia trong khoang ngan sach.
   - Dien tich trong khoang mong muon neu co.
   - Du an thuoc quan/huyen uu tien neu co.
   - Du an `status='active'`, chua bi xoa.
5. Cham diem:
   - Huong nha hop menh: +40.
   - Tang hop tuoi: +20.
   - So phong ngu phu hop nhu cau: +20.
   - Gan tien ich uu tien: +20.
6. Sap xep giam dan theo tong diem.
7. Tra top 10 cho endpoint search, top 5 trong chatbot.
8. Gemini API sinh ly do goi y ngan gon, de hieu.

### 9.3. Bang Huong Theo Menh

| Menh | Huong hop | Huong ky |
| --- | --- | --- |
| Kim | Tay, Tay Bac, Tay Nam | Dong, Dong Nam |
| Moc | Dong, Dong Nam, Nam | Tay, Tay Bac |
| Thuy | Bac, Dong, Dong Nam | Nam, Tay Nam |
| Hoa | Nam, Dong, Dong Nam | Bac, Tay Bac |
| Tho | Tay Nam, Dong Bac, Tay, Tay Bac | Dong, Dong Nam |

## 10. Yeu Cau Phi Chuc Nang

### 10.1. Hieu Nang

- Trang chu tai duoi 3 giay tren ket noi 20 Mbps.
- API thong thuong phan hoi duoi 500ms.
- He thong dap ung toi thieu 200 nguoi dung dong thoi.
- Anh co lazy loading, nen anh va kich thuoc phu hop.
- Lighthouse Performance >= 70.

### 10.2. Bao Mat

- HTTPS cho toan bo giao tiep production.
- Mat khau hash bang bcrypt, salt rounds >= 10.
- JWT co thoi han ngan, refresh token co revoke.
- CORS gioi han domain frontend/CMS hop le.
- Rate limit login, contact request va chatbot.
- Validate/sanitize input de phong SQL Injection, XSS, CSRF.
- Upload file chi cho phep mime type va extension hop le.
- Khong log token, mat khau, API key Gemini.

### 10.3. Kha Dung Va UX

- Ho tro Chrome, Firefox, Safari, Edge phien ban moi.
- Responsive cac moc: 375px, 768px, 1366px, 1920px.
- Loi duoc hien bang ngon ngu than thien, co cach tiep tuc hanh dong.
- Cac thao tac quan tri can co loading, success, error state.

### 10.4. Bao Tri Va Mo Rong

- API co Swagger/OpenAPI.
- Database migration bang Alembic.
- Tach module theo domain: auth, projects, apartments, posts, contacts, chat, users, stats.
- Config qua environment variables.
- Co kha nang bo sung i18n trong tuong lai.

## 11. UI/UX Specification

### 11.1. Design Direction

- Phong cach: hien dai, chuyen nghiep, tin cay, phu hop bat dong san cao cap.
- Mau chu dao: xanh duong dam `#1F3864`, trang, xam trung tinh; mau nhan cho CTA.
- Layout mobile-first.
- Card du an ro rang, anh chat luong cao, thong tin gia/vi tri/trang thai de scan.
- CMS uu tien tinh thuc dung, bang du lieu de loc/sua nhanh.

### 11.2. Public Pages

- `/`: Trang chu.
- `/du-an`: Danh sach du an.
- `/du-an/{slug}`: Chi tiet du an.
- `/can-ho/{id}` hoac modal trong chi tiet du an.
- `/tin-tuc`: Danh sach bai viet.
- `/tin-tuc/{slug}`: Chi tiet bai viet.
- `/lien-he`: Form lien he/dang ky tu van.

### 11.3. CMS Pages

- `/admin/login`: Dang nhap.
- `/admin`: Dashboard.
- `/admin/projects`: Quan ly du an.
- `/admin/projects/{id}`: Sua du an, tab can ho/anh/tien ich/mat bang.
- `/admin/amenities`: Quan ly tien ich.
- `/admin/posts`: Quan ly bai viet.
- `/admin/contacts`: Quan ly yeu cau tu van.
- `/admin/users`: Quan ly user, chi admin.
- `/admin/stats`: Thong ke, chi admin.

## 12. Uu Tien Trien Khai

### 12.1. MVP

1. Auth CMS: login/logout, role admin/editor.
2. CRUD du an, upload anh MinIO.
3. CRUD can ho.
4. Website public: trang chu, danh sach du an, chi tiet du an/can ho.
5. Search/filter co ban.
6. Form dang ky tu van va CMS quan ly contact.
7. Docker Compose cho backend, PostgreSQL, MinIO.

### 12.2. Phase 2

1. Tin tuc/bai viet va category.
2. Bo loc phong thuy rule-based.
3. Chatbot Gemini API.
4. Goi y ca nhan hoa.
5. Dashboard thong ke co event tracking.

### 12.3. Phase 3

1. Activity log day du.
2. Xuat bao cao PDF/Excel.
3. SEO nang cao, sitemap, structured data.
4. i18n neu can.
5. CRM lead pipeline don gian.

## 13. Rui Ro Va Diem Can Lam Ro

| Hang muc | Van de | De xuat |
| --- | --- | --- |
| Frontend | SEO voi React SPA can cau hinh ky hon SSR | Bo sung sitemap, meta tags, structured data va prerender neu can |
| ORM | Tai lieu ghi Alembic la ORM | Can chot SQLAlchemy lam ORM, Alembic lam migration |
| Thong ke | Chua co bang luu visits/events | Bo sung `analytics_events` truoc khi lam dashboard that |
| Log hoat dong | Use case nhac log nhung DB chua co | Bo sung `activity_logs` |
| Phong thuy | Cong thuc tinh cung menh can chuan hoa | Can co bang/cong thuc nghiep vu duoc khach hang chap nhan |
| Gemini | Phu thuoc API ngoai | Can fallback, timeout, retry va han muc chi phi |
| Anh | URL public MinIO can policy phu hop | Chot bucket policy public/private va signed URL neu can |

## 14. Checklist Nghiem Thu

### Public Website

- Trang chu hien du lieu du an noi bat va tin moi.
- Danh sach du an loc va phan trang dung.
- Chi tiet du an hien gallery, tien ich, mat bang, can ho.
- Chi tiet can ho hien dung gia, huong, trang thai.
- Search tra dung ket qua theo nhieu tieu chi.
- Form lien he validate va luu DB.
- Chatbot tra loi fallback khi Gemini loi.

### CMS

- Dang nhap thanh cong voi user hop le.
- Sai mat khau nhieu lan bi khoa theo quy dinh.
- Admin quan ly user duoc, editor khong vao trang user.
- Editor tao/sua du an va can ho duoc.
- Admin xoa mem du an duoc.
- Upload anh dung dinh dang thanh cong, sai dinh dang bi tu choi.
- Contact request doi trang thai va gan nhan vien duoc.

### Backend/API

- Swagger hien day du endpoint.
- Endpoint public khong yeu cau token.
- Endpoint CMS yeu cau role dung.
- Validation loi tra HTTP status va message ro rang.
- Rate limit hoat dong cho login/contact/chat.
- Migration tao du database schema.

### Bao Mat/Hieu Nang

- Mat khau khong luu plain text.
- Cookie/token co cau hinh an toan production.
- HTML bai viet duoc sanitize.
- API search co index phu hop cho district, price, direction, status.
- Anh lazy load tren frontend.

## 15. Dinh Nghia Hoan Thanh

Mot tinh nang duoc xem la hoan thanh khi:

- Co UI/UX day du theo acceptance criteria.
- Co API/backend xu ly nghiep vu va validation.
- Co database migration neu thay doi schema.
- Co phan quyen dung voi actor lien quan.
- Co loading, empty, error state.
- Da test manual luong chinh va luong loi.
- Khong lam hong cac luong da co.
