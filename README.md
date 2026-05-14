<div align="center">

# ptpofficialxd**DB**

**A premium, glass-morphed Adminer skin — modern UI, EN/TH toggle, light/dark themes.**
**Adminer skin โทนพรีเมียม — UI ทันสมัย, สลับ EN/TH, รองรับธีมสว่าง/มืด.**

[![Adminer](https://img.shields.io/badge/Adminer-5.4.2-22C55E?style=flat-square)](https://www.adminer.org/)
[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=flat-square&logo=php&logoColor=white)](https://www.php.net/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-F4F4F5?style=flat-square)](./LICENSE)

[**English**](#english) · [**ไทย**](#ไทย)

</div>

---

<a id="english"></a>

## English

A heavily customized [Adminer](https://www.adminer.org/) deployment built for production. Same battle-tested DB management engine underneath — wrapped in a modern glassmorphism interface with first-class bilingual support, persistent theming, and a security-first PHP wrapper that avoids leaking connection strings in markup.

### Features

- **EN / TH toggle** — replaces Adminer's native `<select>` dropdown with a compact two-button switch; mounted in the sidebar header next to the version chip.
- **Light & Dark themes** — applied before first paint (no FOUC), persisted in `localStorage`. Floating sun/moon toggle in the bottom-right.
- **Premium login screen** — glass-morphed card with green accent glow, gradient title, rounded inputs with green focus ring, "Remember me" stacked above the submit button.
- **Custom wordmark** — `ptpofficialxd` (silver gradient) + `DB` (green gradient with soft halo), version rendered as a discreet `v5.4.2` pill.
- **Brand-link safety** — the sidebar brand href is stripped of all connection parameters at runtime, so inspecting the DOM never reveals the server / db / table you're on.
- **Auto cache-busting** — `<link href="adminer.css?v=<hash>">` derived from file `mtime + size`; deploys invalidate browser cache without a hard-refresh.
- **Modular client-side architecture** — drop a `60-foo.js` into `scripts/` and it gets inlined automatically with the per-request CSP nonce. No PHP edits.
- **Optimized Docker layers** — CSS → scripts → PHP ordering keeps the build cache hot when only styles change.

### Screenshots

| Dark mode | Light mode |
| --- | --- |
| ![dark](./docs/dark.png) | ![light](./docs/light.png) |

| Login | Mobile |
| --- | --- |
| ![login](./docs/login.png) | ![mobile](./docs/mobile.png) |

### Quick Start

```bash
git clone https://github.com/ptpofficialxd/db-admin.git
cd db-admin
docker build -t ptpofficialxd-db .
docker run --rm -p 8080:8080 ptpofficialxd-db
```

Open <http://localhost:8080> and connect to any MySQL / MariaDB / PostgreSQL / SQLite database Adminer supports.

### Deployment (Render.com)

`render.yaml` is wired for auto-deploy: push to `main`, Render rebuilds the Docker image and rolls it out. No secrets in the image — connection details are entered at the login screen.

### Project Structure

```
db-admin/
├── adminer.css              Theme + brand + components (single file)
├── index.php                Adminer subclass: injects scripts + versioned CSS
├── Dockerfile               adminer:5.4.2 base + COPY layers
├── render.yaml              Render service definition
└── scripts/
    ├── 00-theme-bootstrap.js    pre-paint theme application
    ├── 10-theme-toggle.js       sun/moon floating button
    ├── 20-lang-toggle.js        EN/TH switch + header-actions container
    ├── 30-brand.js              wordmark, title, brand-link, version chip
    ├── 40-logout.js             logout pill relocation
    └── 50-login.js              login form i18n patches + body marker
```

### Customizing

Each `scripts/[0-9]*.js` module is a self-contained IIFE that registers its own `DOMContentLoaded` handler. Files load in alphabetical order, so dependencies between modules are explicit:

```js
// scripts/60-confetti.js
(function () {
    'use strict';
    function init() {
        // your DOM tweaks here
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

Rebuild the image, redeploy — no PHP edits required.

### Tech Stack

| Layer | Technology |
| --- | --- |
| DBMS UI | Adminer 5.4.2 |
| Runtime | PHP 8.4 (built-in server) on Alpine |
| Container | Docker (multi-stage capable) |
| Hosting | Render.com (auto-deploy) |
| Frontend | Vanilla JS · Vanilla CSS · CSS `:has()`, `:is()`, `backdrop-filter` |

### Credits

- Built on top of [vrana/adminer](https://github.com/vrana/adminer) by Jakub Vrána.
- Theme inspiration: [m-ristau/adminer-filamentish](https://github.com/m-ristau/adminer-filamentish).
- Customizations, glass-morphism, brand, bilingual layer: [@ptpofficialxd](https://github.com/ptpofficialxd).

### License

MIT — see [LICENSE](./LICENSE).

---

<a id="ไทย"></a>

## ไทย

โปรเจค [Adminer](https://www.adminer.org/) ที่ customize หนักๆ สำหรับใช้งานจริงบน production — เครื่องยนต์จัดการฐานข้อมูลตัวเดียวกับ Adminer ของแท้ ห่อด้วย UI แบบ glassmorphism ทันสมัย รองรับสองภาษา (EN/TH) สลับธีมสว่าง/มืดได้ พร้อม PHP wrapper ที่ออกแบบมาเน้นความปลอดภัย ไม่ให้ connection string รั่วผ่าน HTML

### ฟีเจอร์

- **สลับ EN / TH** — เปลี่ยน `<select>` dropdown ของ Adminer เป็นปุ่ม 2 ตัวขนาดกะทัดรัด อยู่มุมขวาบนของ sidebar ข้างๆ version chip
- **ธีมสว่าง / มืด** — apply ก่อน paint แรก (ไม่มี FOUC) จดจำผ่าน `localStorage` มีปุ่มลอยรูปดวงอาทิตย์/พระจันทร์ที่มุมขวาล่าง
- **หน้า Login พรีเมียม** — การ์ดแบบ glassmorphism halo สีเขียว, gradient title, input ขอบโค้งพร้อม focus ring สีเขียว, "Remember me" จัดวางบนปุ่ม submit
- **Custom wordmark** — `ptpofficialxd` (gradient เงิน-เทา) + `DB` (gradient เขียวพร้อม halo เรืองแสง), เลขเวอร์ชั่นแสดงเป็น pill เล็กๆ `v5.4.2`
- **Brand-link ปลอดภัย** — href ของ brand ในแถบข้างถูก strip parameters ของ connection ทั้งหมดก่อนแสดง คน inspect dom ก็ไม่เห็นว่าเปิด server / db / table อะไรอยู่
- **Cache-busting อัตโนมัติ** — `<link href="adminer.css?v=<hash>">` คำนวณจาก `mtime + size` ของไฟล์ deploy ปุ๊บ browser โหลด CSS ใหม่อัตโนมัติ ไม่ต้อง hard-refresh
- **Client-side แบบ modular** — แค่หย่อนไฟล์ `60-foo.js` ลง `scripts/` มันจะถูก inline พร้อม CSP nonce อัตโนมัติ ไม่ต้องแก้ PHP
- **Docker layer เหมาะกับ cache** — เรียง CSS → scripts → PHP ทำให้แก้แค่ style แล้ว build ใหม่จะ hit cache สูงสุด

### ภาพหน้าจอ

| Dark mode | Light mode |
| --- | --- |
| ![dark](./docs/dark.png) | ![light](./docs/light.png) |

| Login | Mobile |
| --- | --- |
| ![login](./docs/login.png) | ![mobile](./docs/mobile.png) |

### เริ่มใช้งานเร็ว

```bash
git clone https://github.com/ptpofficialxd/db-admin.git
cd db-admin
docker build -t ptpofficialxd-db .
docker run --rm -p 8080:8080 ptpofficialxd-db
```

เปิด <http://localhost:8080> แล้ว login ได้ทันที รองรับ MySQL / MariaDB / PostgreSQL / SQLite ตามที่ Adminer รองรับ

### Deploy (Render.com)

ไฟล์ `render.yaml` ตั้งค่า auto-deploy ไว้แล้ว — push ขึ้น branch `main` Render จะ rebuild Docker image แล้ว roll out ให้เอง ไม่มี secret อยู่ใน image — กรอก connection ตอน login เท่านั้น

### โครงสร้างโปรเจค

```
db-admin/
├── adminer.css              ธีม + brand + components (ไฟล์เดียว)
├── index.php                Adminer subclass: inject scripts + CSS แบบมีเวอร์ชั่น
├── Dockerfile               base adminer:5.4.2 + COPY layers
├── render.yaml              Render service definition
└── scripts/
    ├── 00-theme-bootstrap.js    apply theme ก่อน paint
    ├── 10-theme-toggle.js       ปุ่มลอย sun/moon
    ├── 20-lang-toggle.js        ปุ่ม EN/TH + container
    ├── 30-brand.js              wordmark, title, brand-link, version chip
    ├── 40-logout.js             ย้าย logout pill เข้า sidebar
    └── 50-login.js              patch i18n + ติด marker บน body
```

### การ Customize

แต่ละไฟล์ `scripts/[0-9]*.js` เป็น IIFE แยกอิสระ register `DOMContentLoaded` handler ของตัวเอง โหลดเรียงตามชื่อไฟล์ (ตัวเลขนำหน้า) — ถ้า module ไหนต้องรอ module อื่นก็ตั้งเลขให้สูงกว่า:

```js
// scripts/60-confetti.js
(function () {
    'use strict';
    function init() {
        // ใส่ DOM tweak ของคุณตรงนี้
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

Build image ใหม่ → redeploy เสร็จ ไม่ต้องแตะ PHP เลย

### Tech Stack

| Layer | เทคโนโลยี |
| --- | --- |
| DBMS UI | Adminer 5.4.2 |
| Runtime | PHP 8.4 (built-in server) บน Alpine |
| Container | Docker |
| Hosting | Render.com (auto-deploy) |
| Frontend | Vanilla JS · Vanilla CSS · CSS `:has()`, `:is()`, `backdrop-filter` |

### เครดิต

- ต่อยอดจาก [vrana/adminer](https://github.com/vrana/adminer) โดย Jakub Vrána
- แรงบันดาลใจธีม: [m-ristau/adminer-filamentish](https://github.com/m-ristau/adminer-filamentish)
- Customization, glassmorphism, brand, ระบบสองภาษา: [@ptpofficialxd](https://github.com/ptpofficialxd)

### License

MIT — ดูที่ [LICENSE](./LICENSE)

---

<div align="center">

Made with focus and a lot of CSS by [**@ptpofficialxd**](https://github.com/ptpofficialxd)

</div>
