# FitZone Gym Knowledge Hub & Administration Control Center

An immersive, full-stack fitness knowledge platform and gym administration console built with **React (Vite)**, **Express**, and **TypeScript**. Features a beautiful front-end client interface with a cinematic media-stabilized walkthrough console, alongside a secure, modern, dark/light-toggle administration board with live analytics, member roster registrations, inventory stock control, and persistent database storage.

---

## 🚀 Key Features

### 1. High-Impact Client Frontpage
- **Cinematic Media Walkthrough Terminal**: Real-time interactive media controller supporting multi-track custom video loops, high-res fallback frames, mute/play states, and a simulated scientific HUD stabilizer.
- **Dynamic Nutrition Hub & Scientific Calculators**: Full calorie, macronutrient, and compound formula calculators for physique profiling.
- **Store Checkout Simulation**: Direct item checkout modal featuring **Stripe** and **Easypaisa** payment simulations that instantly emit transaction audit events to the administrative database.

### 2. Fully Redesigned Admin Console (`/admin.html`)
- **Adaptive Dark/Light Mode**: Full theme state switcher built natively with Tailwind and local storage memory.
- **Modular beginner-friendly management panels**:
  - **Analytics Overview**: Visually appealing, CSS-grid-driven monthly revenue growth charts and payment gateway breakdown metrics.
  - **Members Registry**: Safe client member status indicators (Active vs Expired), custom registration triggers, and instant revoke action macros.
  - **Inventory Catalog Management**: Dynamic stock price updates, instant card additions, and item removal hooks.
  - **Transaction History**: Real-time payment tracing and processing audits.
  - **System Activity Logs**: High-security server tracking tracing user signups, sign-ins, database seedings, and financial actions.

### 3. Smart Database Engine (Cloud MongoDB + Safe JSON Fallback)
- **MongoDB Cloud Integration**: Configured to connect directly to your MongoDB Atlas cluster.
- **Auto-Seeding**: Empty databases automatically seed themselves from pre-configured local schema defaults on first run.
- **Fail-Fast Resilient Fallback**: If `MONGODB_URI` is missing or fails to connect (due to incorrect IP whitelists, firewall blocks, or expired credentials), the server **automatically falls back to a highly stable, offline, local JSON file-based database schema** located in `/data/` to keep your application 100% functional.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Motion Animations, Lucide Icons.
- **Backend**: Node.js, Express, tsx (Typescript Execution), esbuild (Production bundling).
- **Database**: MongoDB Driver (with local JSON filesystem storage fallback).

---

## 📂 Project Structure
```text
├── data/                       # Local JSON database files (automatically created on fallback)
│   ├── articles.json           # Nutritional and coaching static guidelines
│   ├── plans.json              # Gym pricing options and passes
│   ├── products.json           # Initial supplement store stock
│   ├── mongodb_users.json      # Offline user account database registry fallback
│   └── mongodb_members.json    # Offline membership database registry fallback
├── src/
│   ├── admin/                  # Administration Dashboard frontend component tree
│   │   ├── components/
│   │   │   └── AdminDashboard.tsx
│   │   ├── AdminApp.tsx
│   │   └── admin.tsx           # Entry point for admin bundle
│   ├── users/                  # General Client application components
│   │   └── components/
│   │       └── Hero.tsx        # High-impact media walkthrough hero
│   ├── db/
│   │   └── mongodb.ts          # Resilient MongoDB connector & fallback CRUD helper
│   └── types.ts                # Typings shared across client and admin spaces
├── server.ts                   # Express server with API endpoints
├── index.html                  # Core user application layout
├── admin.html                  # Core administrator application layout
└── vite.config.ts              # Bundler configuration (compiles user & admin assets)
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in your root directory (refer to `.env.example`):

```env
# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=fitzone_super_secret_jwt_key_2026

# Administrator Credentials
ADMIN_EMAIL=admin
ADMIN_PASSWORD=fitzone2026

# Database Configuration (Optional)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/fitzone?retryWrites=true&w=majority
MONGODB_DB=fitzone

# Production URLs (CORS validation & routing)
FRONTEND_URL=https://fitzone-gym.vercel.app
APP_URL=https://fitzone-gym-backend.onrender.com
```

---

## 🚀 Local Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Servers (Port 3000)
```bash
npm run dev
```
Open your browser and navigate to:
- **Client Site**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin.html`

---

## 🔒 Default Administrator Credentials
To access the Admin Console (`/admin.html`), authenticate with:
- **Username**: `admin`
- **Password**: `fitzone2026`

*To change these credentials, configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment variables.*

---

## 📦 Production Builds & Deployment

### 1. Backend Deployment (Render)
Deploy the Express server to Render:
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Configure build and start settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Add the following **Environment Variables** in Render's dashboard:
   - `PORT`: Set dynamically by Render.
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: A strong random string for secure JWT token signing.
   - `ADMIN_EMAIL`: Your admin username/email (e.g. `admin`).
   - `ADMIN_PASSWORD`: Your secure admin password.
   - `MONGO_URI`: Your production MongoDB Atlas cluster URI.
   - `MONGODB_DB`: Your production database name.
   - `FRONTEND_URL`: The URL of your Vercel frontend (e.g., `https://your-app.vercel.app`) to authorize cross-origin API calls.

### 2. Frontend Deployment (Vercel)
Deploy the React client SPA to Vercel:
1. Create a new project on Vercel and link your repository.
2. In the build configurations:
   - **Framework Preset**: `Vite` (or `Other` with defaults)
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
3. Add the following **Environment Variable** in Vercel's dashboard:
   - `VITE_API_URL`: The Render Web Service backend URL (e.g., `https://your-backend.onrender.com`).
   - Note: The global fetch interceptor built into the frontend will automatically route API requests to this address and secure credentials.

