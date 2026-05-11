# PROJECT STRUCTURE

Tai lieu nay mo ta cau truc thu muc chuan cho du an AMG News.

## Tong Quan

```text
amg-land-web/
  backend/
    app/
      api/
        v1/
          endpoints/
          router.py
      core/
      db/
      integrations/
      models/
      repositories/
      schemas/
      services/
      modules/
        auth/
        users/
        projects/
        apartments/
        amenities/
        posts/
        contacts/
        chat/
        stats/
      utils/
      main.py
    alembic/
      versions/
    tests/
      unit/
      integration/
    README.md
  frontend/
    src/
      app/
        public/
        admin/
      assets/
      components/
        layout/
        ui/
      config/
      features/
        auth/
        projects/
        apartments/
        amenities/
        posts/
        contacts/
        chat/
        stats/
      hooks/
      lib/
      services/
      styles/
      types/
    public/
    tests/
    README.md
  packages/
    shared/
      src/
        constants/
        contracts/
        types/
      README.md
  infra/
    docker/
    nginx/
    scripts/
  docs/
    adr/
  tests/
    e2e/
```

## Nguyen Tac Kien Truc

- Tach frontend va backend thanh hai thu muc rieng: `frontend/` va `backend/`.
- Backend di theo modular monolith: moi domain nam trong `app/modules`, cac lop dung chung nam trong `core`, `db`, `repositories`, `services`.
- Frontend tach theo feature: moi nghiep vu lon co thu muc rieng trong `src/features`.
- Contract/schema dung chung dat trong `packages/shared` de tranh lech kieu du lieu giua web va API.
- Ha tang va tai lieu quyet dinh kien truc tach rieng trong `infra` va `docs/adr`.

## Backend: `backend`

| Thu muc | Muc dich |
| --- | --- |
| `app/main.py` | Entry point FastAPI |
| `app/api/v1` | Router tong va endpoint version v1 |
| `app/core` | Config, security, logging, exception handlers |
| `app/db` | Session, base model, migration helpers |
| `app/models` | SQLAlchemy models |
| `app/schemas` | Pydantic request/response schemas |
| `app/repositories` | Data access layer |
| `app/services` | Business logic dung chung |
| `app/modules` | Module theo domain nghiep vu |
| `app/integrations` | Gemini, MinIO, email, external services |
| `alembic` | Database migrations |
| `tests` | Unit va integration tests cho backend |

## Frontend: `frontend`

| Thu muc | Muc dich |
| --- | --- |
| `src/app` | Route/page layer cho React frontend |
| `src/components/ui` | Component UI dung chung |
| `src/components/layout` | Header, footer, sidebar, shell layout |
| `src/features` | Module UI theo nghiep vu |
| `src/services` | API clients |
| `src/lib` | Helper/framework adapters |
| `src/hooks` | React hooks dung chung |
| `src/types` | TypeScript types rieng frontend |
| `src/config` | App config, route config, env mapping |
| `public` | Static assets public |
| `tests` | Component/unit tests frontend |

## Quy Uoc Module Backend

Moi module trong `app/modules/<module_name>` nen co cau truc:

```text
module_name/
  router.py
  schemas.py
  service.py
  repository.py
  dependencies.py
```

Voi module phuc tap, co the tach thanh nhieu file nho hon. Voi module don gian, chi can cac file thuc su dung den.

## Quy Uoc Feature Frontend

Moi feature trong `src/features/<feature_name>` nen co cau truc:

```text
feature_name/
  components/
  hooks/
  services/
  types.ts
  index.ts
```

Feature chi expose API can thiet qua `index.ts`, tranh import sau vao file noi bo cua feature khac.

## Ghi Chu Trien Khai

- MVP nen bat dau voi `auth`, `projects`, `apartments`, `contacts`.
- `posts`, `chat`, `stats` co the lam sau neu can chia phase.
- Frontend giu theo React.js nhu cong nghe da chot trong spec; `src/app` la route/page layer va co the mapping sang React Router.
