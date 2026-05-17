# Travel Buddy

Travel Buddy is a full-stack ride-sharing and travel-companion platform. Passengers can search trips, chat with other travelers, create shared bookings, and complete payments. Taxi drivers can register, get verified by an admin, accept rides on a map, and manage their profile. Admins oversee driver verification, platform reports, and flagged accounts.

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, React Router 7, Redux Toolkit, React Hook Form, Yup, Bootstrap / Reactstrap, Leaflet, Axios |
| **Backend** | Node.js, Express 5, Mongoose, bcrypt, Multer, Nodemailer |
| **Database** | MongoDB (Atlas or local) |

---

## Project structure

```
travelbuddy/
├── travelbuddy-client/     # React SPA (port 3000)
│   └── src/
│       ├── components/   # UI pages (User, Driver, Admin, Chat, etc.)
│       ├── slices/         # Redux state (user, driver, admin)
│       └── store/          # Redux store
│
└── travelbuddy-server/     # Express API (port 7500)
    ├── index.js            # Main server & most REST routes
    ├── routes/             # auth, driver, payment, chat routes
    ├── models/             # Mongoose schemas
    ├── controllers/        # Chat controller
    └── uploads/            # Profile pics & driver documents (created at runtime)
```

---

## Features

### Passengers (users)
- Register and log in at `/login` (User tab)
- Search trips and start conversations in **Chat** (polling-based messaging, voice-to-text via Web Speech API)
- Create **bookings** with fare split among participants
- Pay via card or cash flow (`/payment-method` → card/cash screens)
- View **My Bookings** and leave **Feedback** after a completed trip
- In-app **Notifications** (bell icon in header)

### Taxi drivers
- Register at `/driver-register` (via `/user-type` → Taxi Driver)
- Log in at `/login` (Driver tab) after admin verification
- **Driver dashboard** (`/driver-dashboard`):
  - **Profile** — view/edit name, phone, vehicle; upload profile photo; share live location
  - **Available Rides** — map + list of bookings ready for pickup
  - **My Rides** — accepted bookings

### Admins
- Log in at `/login` (Admin tab) → `/admin`
- Approve, reject, suspend, or remove drivers
- View driver documents (PDF uploads)
- Review flagged drivers and feedback
- **Platform Reports** — summary metrics and driver trip activity table

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm**
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or a local instance
- **Gmail app password** (optional) — for password-reset emails via Nodemailer

---

## Getting started

### 1. Clone and install

```bash
cd travelbuddy/travelbuddy-server
npm install

cd ../travelbuddy-client
npm install
```

### 2. Configure the server

Copy the example environment file and fill in your values:

```bash
cd travelbuddy-server
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `7500`) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:3000`) |
| `SESSION_SECRET` | Express session secret |
| `JWT_SECRET` | JWT secret (if used by auth routes) |
| `EMAIL_USER` | Gmail address for transactional email |
| `EMAIL_PASS` | Gmail [app password](https://support.google.com/accounts/answer/185833) |

### 3. Run the application

**Terminal 1 — API**

```bash
cd travelbuddy-server
npm run dev
```

**Terminal 2 — React app**

```bash
cd travelbuddy-client
npm start
```

| App | URL |
|-----|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:7500 |

The client expects the API at `http://localhost:7500` (see `BASE_URL` / `SERVER` constants in slices and components). Update those if you deploy to another host.

---

## Main routes (frontend)

| Path | Description |
|------|-------------|
| `/` | Welcome / landing |
| `/user-type` | Choose passenger or taxi driver signup |
| `/register` | Passenger registration |
| `/driver-register` | Driver registration (documents upload) |
| `/login` | Unified login (User / Driver / Admin) |
| `/home` | User home after login |
| `/search` | Search trips |
| `/chat` | Messaging |
| `/booking` | Create / manage booking |
| `/my-bookings` | User booking list |
| `/notifications` | Notification center |
| `/driver-dashboard` | Driver profile, map, rides |
| `/admin` | Admin dashboard |
| `/about` | About page |

Legacy paths `/driver-login` and `/admin-login` redirect to `/login`.

---

## Booking flow (overview)

1. Users find a trip and chat to coordinate.
2. Trip owner creates a booking (`pending` → `confirmed` as participants join/pay).
3. When both sides have paid, status moves to **`driver_ready`**.
4. A verified driver accepts the ride → **`driver_accepted`**.
5. Trip is marked **`completed`**; users can submit **feedback**.

Booking statuses: `pending`, `confirmed`, `paid`, `driver_ready`, `driver_accepted`, `completed`.

---

## API overview

Most endpoints live in `travelbuddy-server/index.js`. Modular routes:

- `/auth` — authentication helpers (`routes/authRoutes.js`)
- `/driver` — driver-specific routes (`routes/driverRoutes.js`)
- `/payment` — payments (`routes/paymentRoutes.js`)
- `/chat` — send message, conversations, message history (`routes/chatRoutes.js`)

Examples:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/register` | Passenger signup |
| `POST` | `/login` | Passenger login |
| `POST` | `/driverRegister` | Driver signup |
| `POST` | `/driverLogin` | Driver login (returns full profile) |
| `GET` | `/driver/profile/:driverId` | Full driver profile |
| `POST` | `/adminLogin` | Admin login |
| `GET` | `/bookings/available` | Rides open for drivers |
| `GET` | `/bookings/driver/:driverId` | Driver’s accepted bookings |
| `GET` | `/notifications/:email` | User notifications |

Static uploads are served from `/uploads/`.

---

## Admin account

Admin records are stored in the `travel-buddy-admins` MongoDB collection. There is no bundled seed script in this repo. To create an admin:

1. Hash a password with bcrypt (e.g. cost 10).
2. Insert a document:

```json
{
  "adminName": "Admin",
  "adminEmail": "admin@example.com",
  "adminPassword": "<bcrypt_hash>"
}
```

Then log in at `/login` using the **Admin** tab.

---

## Driver verification

New drivers register with `status: pending_verification`. An admin must approve them in the admin dashboard before they can log in. Rejected or suspended drivers are blocked at login with an explanatory message.

---

## Development notes

- **Sessions** — User, driver, and admin sessions are stored in Redux and persisted to `localStorage` (`tb_user_session`, `tb_driver_session`, `tb_admin_session`).
- **Chat** — Uses HTTP polling (not WebSockets) for messages and conversations.
- **Maps** — Driver “Available Rides” uses Leaflet + OpenStreetMap; addresses are geocoded via Nominatim (rate-limited).
- **Email** — Password reset depends on valid `EMAIL_USER` / `EMAIL_PASS`; SMTP timeouts will not stop the rest of the API.
- **Production** — Plan to centralize API base URL (env variable), add route protection on the server, and configure HTTPS + secure cookies before going live.

---

## Scripts

**Client (`travelbuddy-client`)**

| Command | Description |
|---------|-------------|
| `npm start` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm test` | Run tests |

**Server (`travelbuddy-server`)**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with nodemon |

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| `Database not connected` | `MONGODB_URI` in `.env`, network access to Atlas |
| CORS errors | `CLIENT_URL` matches the React app origin |
| Driver profile shows "—" | Restart server; dashboard fetches `/driver/profile/:id` on load |
| Reset email not sent | Gmail app password, firewall, `EMAIL_*` vars |
| Map markers missing | Nominatim rate limits; wait between geocode requests |

---

## License

ISC (per `travelbuddy-server/package.json`). Update this section if you add a different license for the full project.
