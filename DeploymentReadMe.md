# Vaulta — Pledge Management System

Vaulta is a full-stack pledge management application built for jewellery businesses. It helps manage customer records, pledged articles, interest calculations, billing, and more — replacing manual bookkeeping with a fast, reliable digital system.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + JavaScript      |
| Styling    | TailwindCSS v4                    |
| Backend    | Node.js + Express.js              |
| Database   | Supabase (PostgreSQL)             |

---

## Project Structure

```
vaulta/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── context/      # React context providers
│   └── ...
├── server/               # Express backend
│   ├── routes/           # API route definitions
│   ├── controllers/      # Route handler logic
│   ├── middleware/        # Auth, validation, etc.
│   └── lib/              # Supabase client, helpers
└── README.md
```

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A Supabase account and project (free tier works)

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in your project name, database password, and region
4. Wait for the project to be ready (~2 minutes)

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `server/lib/schema.sql`
4. Click **Run**

This will create all required tables, indexes, and functions.

### 3. Get Your Supabase Keys

1. Go to **Project Settings → API**
2. Copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Environment Setup

### Server (`server/.env`)

Create a file at `server/.env` with the following:

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_random_secret_string_here
```

> For `JWT_SECRET`, use any long random string. You can generate one at https://generate-secret.vercel.app/32

### Client (`client/.env`)

Create a file at `client/.env` with the following:

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Installation & Running

### 1. Install Dependencies

Open two terminals.

**Terminal 1 — Server:**
```bash
cd vaulta/server
npm install
```

**Terminal 2 — Client:**
```bash
cd vaulta/client
npm install
```

### 2. Start the Application

**Terminal 1 — Start Server:**
```bash
cd vaulta/server
npm run dev
```
Server runs at: `http://localhost:5000`

**Terminal 2 — Start Client:**
```bash
cd vaulta/client
npm run dev
```
Client runs at: `http://localhost:5173`

### 3. Open in Browser

Go to `http://localhost:5173` in your browser.

- First time: You'll see the **Landing Page** → click **Get Started** → **Create Account**
- After first run: The landing page won't show again. You'll go straight to Login.

---

## First Time Setup After Login

After creating your account and logging in:

1. Go to **Settings**
2. Set your **Bill Number prefix** (e.g., `J.1500`)
3. Set your **Threshold value** for H/S/O column
4. Configure **Mandatory fields** as per your needs
5. Start creating bills from **New Bill** section

---

## Features Overview

### 🏠 Landing Page
- Shown only once (first time the app is opened)
- Explains the application with a "Get Started" button

### 🔐 Auth
- Create Account with name, email, mobile, password
- Login with mobile number + password
- Forgot password via email link

### 📋 New Bill
- Full customer details form
- Multiple article/jewel cards (add as many as needed)
- Indian number formatting for amounts
- Save, Print, and Clear functionality
- Gold/Silver toggle

### 👥 Customers
- Auto-created customer cards from bills
- Customer loyalty rating (1–10) based on behaviour
- Click any card to auto-fill New Bill with customer details
- Search, filter by rating and status

### 🗄️ Database
- Full tabular view of all bills
- Millions of rows handled with B-Tree + GIN indexes + pagination
- Global fast search across all columns
- Filter, sort, rearrange
- Release / Renew / Edit / Delete actions
- Detailed Bill View with:
  - Interest calculator with slider
  - Transaction history (interest payments + principal payments)
  - All bills linked to that customer (right side panel)

### ⚙️ Settings
- Mandatory fields toggle per field
- Threshold value for H/S/O (updates entire database on change)
- Data backup (Google Drive + local Excel)
- Late bills filter and export

### 👤 Account
- User profile details
- Change password
- Full activity log with pagination and download

### 📊 Dashboard
- Total bills, active, released stats
- Today's stats
- Custom date range stats
- Charts (bills created/released by day/month/year)
- Download stats

---

## PWA (Progressive Web App)

Vaulta is installable as a desktop/mobile app:

- On Desktop (Chrome): Click the install icon in the address bar
- On Mobile (Chrome/Safari): Use "Add to Home Screen"

This makes it feel like a native app without needing an app store.

---

## Color Palette

| Name         | Hex       | Usage                          |
|--------------|-----------|--------------------------------|
| Navy         | `#2F3A55` | Primary text, headers          |
| Slate Blue   | `#5C6B8A` | Secondary elements, icons      |
| Warm Gray    | `#6E6F73` | Muted text, placeholders       |
| Linen        | `#E7E2DE` | Borders, dividers, cards       |
| Off White    | `#F5F6F3` | Background                     |

---

## Bill Number Logic

- User sets initial bill number in Settings (e.g., `J.1500`)
- Each new bill auto-increments (e.g., `J.1501`, `J.1502`...)
- If a bill (only the latest) is deleted, its number is reused
- User can change prefix anytime — only affects new bills

---

## H/S/O Column Logic

- **S (Shop)**: Principal amount < threshold value
- **H (Home) or O (Others)**: Principal amount ≥ threshold value (user fills manually)
- When threshold changes in Settings: entire database H/S/O column is recalculated automatically

---

## Interest Calculation Formula

```
Interest = (Principal ÷ 100) × Interest Rate % × Number of Months
```

- Gold default rate: 2.0%
- Silver default rate: 4.0%
- If months elapsed = 0, use 1 month for calculation
- Slider allows exploring different rates in real-time

---

## Support

This app was built with love as a gift. For any issues, check the browser console or server terminal for error messages.

---

## Print Bill Setup (Important)

Vaulta uses your physical pawn ticket design as the print template. To enable bill printing:

### Step 1 — Prepare the template image

1. Open your Canva pawn ticket design
2. Export it as a **PNG** (not PDF) at high resolution — select "Download → PNG → 2x or 3x"
3. Rename the downloaded file to exactly: `pawn_ticket_template.png`

### Step 2 — Place the template file

Put the file here inside the project:
```
vaulta/
└── client/
    └── public/
        └── pawn_ticket_template.png   ← place it here
```

Create the `public` folder inside `client/` if it doesn't exist.

### Step 3 — That's it

The print preview and print system will automatically use this image as the background, and overlay all the bill data on top of it in the correct positions.

### How printing works

1. Fill in the New Bill form and click **Save Bill**
2. Click **Print Bill** — a full-screen preview appears showing exactly how the ticket will look
3. Verify all fields are positioned correctly
4. Click **Print Now** — sends to your printer with the template as background

### Field positions on the template

| Field | Where it appears |
|-------|-----------------|
| Bill No. | After "Bill No." label |
| Date | After "Date:" label |
| Name | Customer initial + full name |
| W/o S/o D/o | Relation type + relation name |
| Phone | Customer mobile number |
| Address (line 1) | Door no. + street address |
| Address (line 2) | Area + pincode (before "Chennai") |
| Principal ₹ | After "Principal of the Loan ₹" |
| In words | Principal amount in Indian English words |
| Articles table | Description + condition tags per article |
| Gm. / Mg. | Net weight split into grams and milligrams |
| Present Value ₹ | Bottom-right of the articles table |

### Article table behaviour

- **1 article** — description + tags on one line, weight in Gm./Mg. columns
- **2–6 articles** — each on its own line with individual weights, total shown at end
- **7+ articles** — collapsed to "Gold/Silver Articles (N) — merged tags", total weight only

---

## Deployment Guide

### Option 1: Cloudflare Pages + Cloudflare Workers (Recommended — Free Forever)

Cloudflare's free tier has no expiry, no credit card required, and is extremely fast globally.

#### Step 1: Deploy the Frontend (Cloudflare Pages)

1. Push your project to a GitHub repository
2. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**
3. Connect your GitHub account and select your repository
4. Set build settings:
   - **Framework preset**: Vite
   - **Build command**: `cd client && npm install && npm run build`
   - **Build output directory**: `client/dist`
5. Add environment variables:
   - `VITE_API_URL` → your Cloudflare Worker URL (from Step 2)
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **Save and Deploy**

Your frontend will be live at `https://vaulta.pages.dev` (or your custom domain).

#### Step 2: Deploy the Backend (Cloudflare Workers)

Cloudflare Workers are serverless — no server to manage, scales infinitely, free tier is generous.

1. Install Wrangler CLI: `npm install -g wrangler`
2. Login: `wrangler login`
3. In your `server/` folder, create `wrangler.toml`:

```toml
name = "vaulta-api"
main = "index.js"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key"
JWT_SECRET = "your_jwt_secret"
CLIENT_URL = "https://vaulta.pages.dev"
```

4. Deploy: `cd server && wrangler deploy`
5. Your API is live at `https://vaulta-api.your-username.workers.dev`
6. Update `VITE_API_URL` in Cloudflare Pages to this URL

#### Step 3: Update Supabase CORS

In Supabase dashboard → Settings → API → add your Cloudflare Pages URL to allowed origins.

---

### Option 2: Netlify (Frontend) + Supabase Edge Functions (Backend)

If you want everything inside Supabase:

1. Go to your Supabase project → **Edge Functions** → **New Function**
2. Move each Express route to a Supabase Edge Function (Deno-based)
3. Deploy frontend to [Netlify](https://netlify.com) — connect GitHub, set build command to `cd client && npm run build`, publish directory to `client/dist`
4. Add environment variables in Netlify dashboard

---

### Option 3: Convert to a Desktop App (Electron)

Make Vaulta a proper `.exe` (Windows) or `.dmg` (Mac) installer:

#### Step 1: Install Electron

```bash
cd client
npm install --save-dev electron electron-builder concurrently wait-on
```

#### Step 2: Create electron/main.js

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Vaulta',
  });
  
  // In production, load the built app
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
```

#### Step 3: Add scripts to client/package.json

```json
"scripts": {
  "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron electron/main.js\"",
  "electron:build": "npm run build && electron-builder",
  "electron:build:win": "npm run build && electron-builder --win",
  "electron:build:mac": "npm run build && electron-builder --mac"
}
```

#### Step 4: Add electron-builder config to client/package.json

```json
"build": {
  "appId": "com.vaulta.app",
  "productName": "Vaulta",
  "files": ["dist/**/*", "electron/**/*"],
  "directories": { "output": "release" },
  "win": { "target": "nsis", "icon": "electron/icon.ico" },
  "mac": { "target": "dmg", "icon": "electron/icon.icns" }
}
```

#### Step 5: Build

```bash
# Windows installer (.exe)
npm run electron:build:win

# Mac installer (.dmg)  
npm run electron:build:mac
```

The installer file will be in `client/release/`. Share the `.exe` or `.dmg` with your dad — he double-clicks it and Vaulta installs like any other app.

**Note:** For Electron, the backend (Express server) must still be running separately, or you can bundle it using `electron-forge` with `@electron-forge/plugin-webpack`. The simplest approach is to keep the server deployed on Cloudflare Workers and have Electron just be a wrapper for the frontend.

---

### PWA Installation (Easiest — No Build Needed)

Once deployed on Cloudflare Pages:

- **Windows/Mac (Chrome)**: Visit the URL → click the install icon (⊕) in the address bar → "Install Vaulta"
- **Android**: Chrome → three-dot menu → "Add to Home Screen"
- **iPhone/iPad**: Safari → Share button → "Add to Home Screen"

Vaulta will appear on the home screen/desktop with its own icon and open in a full-screen window like a native app.

