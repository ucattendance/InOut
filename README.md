# InOut

UC JZ attendance management software — employee check-in/check-out with live selfie capture and GPS-based office verification, plus an admin back office for HR (attendance, leave, payroll, letters, reports).

## Repos

| Repo | Path | What it is |
|---|---|---|
| Frontend (this repo) | `InOut` | React app — employee self-service + admin dashboard |
| Backend | `InOut-backend` | Node/Express API + MongoDB |

The frontend talks to the backend over the API — see [DEPLOY.md](DEPLOY.md) for live URLs and deploy steps.

## Tech stack

- **Frontend:** React 19 (CRA + craco), MUI + Tailwind, react-router-dom v7, axios, chart.js/recharts (dashboards), pdf-lib/jspdf/html2pdf (payslips & HR letters), xlsx (exports)
- **Backend:** Express 5, MongoDB (Mongoose), JWT auth, Multer + Cloudinary (image uploads), Swagger (`/api-docs`)

## Features

- **Employee side** (`/attendance`, `/apply-leave`, `/task-manager`, `/profile`): check-in/check-out with camera selfie + location, leave requests, task manager, profile
- **Admin side** (behind `AdminProtectedRoute` → `Layout`): dashboard, employee/user management, attendance logs, leave approvals, payroll/payslip generation, HR letters (offer, experience, relieving, internship offer & certificate), holidays, reports

## How the API is wired up

Backend entry point (`InOut-backend/index.js`) mounts these routers:

| Route prefix | Purpose |
|---|---|
| `/auth` | login/register/JWT |
| `/attendance` | check-in/out, attendance records |
| `/api/admin` | admin-only operations |
| `/users` | employee/user CRUD |
| `/api/tasks` | task manager |
| `/api/leaves` | leave requests |
| `/api/holidays` | holiday calendar |
| `/schedules` | shift schedules |
| `/api/payslips` | payroll |

Auth uses JWT (`middleware/auth.js`), role-gated with `middleware/role.js` (e.g. `role('admin')`). Frontend endpoint URLs are centralized in [src/utils/api.js](src/utils/api.js) (`API_ENDPOINTS`) — that's the single place to check what the frontend expects the API to expose.

## How the check-in photo is saved

1. **Capture** — [src/pages/employee/AttendancePage.jsx](src/pages/employee/AttendancePage.jsx) opens the device camera directly via `navigator.mediaDevices.getUserMedia`. There's no file picker — it's always a live webcam/phone-camera capture, shown through `CameraView`/`CameraModal` in `src/components/attendance/`. On "Capture", the video frame is drawn to a canvas, converted to a JPEG, and compressed (`src/utils/attendanceImage.js`).
2. **Upload** — the compressed photo is sent as `FormData` (along with `type`, `location`, `comment`) to `POST /attendance`.
3. **Storage** — on the backend, `middleware/upload.js` streams the file straight to **Cloudinary** (folder `attendance_images`) via `multer-storage-cloudinary` — photos are never written to local disk. `attendanceController.markAttendance` saves the resulting Cloudinary URL into the `image` field of the `Attendance` document.

## How location / geofencing works

1. **Capture** — right after the photo, `getLocation()` in `AttendancePage.jsx` calls `navigator.geolocation.getCurrentPosition(...)` and sends the coordinates as a plain `"latitude,longitude"` string in the same upload.
2. **Office matching** — the backend (`utils/officeMatch.js`) parses the coordinate string and compares it against a hardcoded office list (`config/officeLocation.js` — Pallikaranai/Velachery/Tirunelveli, each with lat/long + allowed radius) using haversine distance. If the employee is within radius, `isInOffice: true` and `officeName` is set to the matched branch; otherwise `officeName: 'Outside Office'`.
3. **Check-out consistency** — if an employee drifts slightly outside the radius between check-in and check-out (within 600m), the office label is kept consistent with the paired check-in instead of flipping to "Outside Office".
4. **Storage/display** — the raw `"lat,lon"` string plus the derived `isInOffice`/`officeName` are stored on the `Attendance` document. The admin attendance table (`AttendanceTable.jsx`) shows the raw coordinate text — there's currently no map view or reverse-geocoded address, just the number pair.

## Local development

```powershell
npm install
npm start
```

The dev server proxies API calls to the backend configured in `package.json` → `"proxy"`. To point at a locally running backend instead, start `InOut-backend` and update that proxy value.

## Deployment

See [DEPLOY.md](DEPLOY.md) — pushing to `main` auto-deploys the frontend to Hostinger and the backend to Render via GitHub Actions.
