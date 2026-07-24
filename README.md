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


