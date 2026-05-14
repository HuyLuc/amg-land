# ADR 0001: Monorepo Modular Architecture

## Status

Accepted

## Context

AMG News gom frontend public website, CMS, backend API, database migration, object storage va ha tang Docker. Du an dang o giai doan khoi tao, can cau truc ro rang de trien khai nhanh MVP nhung van giu kha nang mo rong.

## Decision

Su dung repository full-stack voi cac vung chinh:

- `frontend` cho frontend React.js.
- `backend` cho backend FastAPI.
- `packages/shared` cho contract/type/schema dung chung.
- `infra` cho Docker, nginx va script van hanh.
- `docs/adr` cho quyet dinh kien truc.

Backend di theo modular monolith thay vi microservices. Moi nghiep vu lon duoc gom thanh module rieng: auth, users, projects, apartments, amenities, posts, contacts, chat, stats.

## Consequences

Uu diem:

- De phat trien MVP trong mot repo duy nhat.
- Giam chi phi van hanh so voi microservices.
- Tach module du ro de sau nay co the extract service neu can.
- De chia se contract giua frontend va backend.

Trade-off:

- Can ky luat import va ownership module de tranh phu thuoc cheo.
- Khi repo lon, can tooling tot hon cho lint/test/cache.
