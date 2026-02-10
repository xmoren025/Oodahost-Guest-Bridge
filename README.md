# Oodahost-Guest-Bridge
A lightweight web application that allows guests to report issues or make requests, which are then automatically synced with the operational tools. A React + Vite application for managing guest requests with automatic priority and category detection using smart keyword analysis.

## Features

- **Supabase Integration**: Store and manage guest data
- **ClickUp Integration**: Sync tasks with ClickUp workspace
- **Smart Priority Detection**: Automatically categorizes and prioritizes guest requests based on keywords
- **Real-time Backend Proxy**: Secure backend communication for ClickUp API

## Local Setup

### Prerequisites

- Node.js (v16+) and npm
- Supabase project credentials
- ClickUp API token and list ID

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd oodahost-guestBridge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install express axios dotenv cors
   ```

3. **Configure environment variables:**

   - **Frontend** — create/edit `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-public-key
     VITE_CLICKUP_API_BASE=/api/clickup
     ```

   - **Backend** — create/edit `src/backend/.env`:
     ```env
     CLICKUP_TOKEN=pk_your_clickup_token_here
     CLICKUP_LIST_ID=your_clickup_list_id
     PORT=5174
     ```

### Running the Project

#### Terminal 1: Start the backend proxy (ClickUp API)
```bash
node src/backend/server.js
```
Expected output: `ClickUp proxy server listening on port 5174`

#### Terminal 2: Start the frontend dev server
```bash
npm run dev
```
Expected output: `VITE v7.x.x ready in X ms`

#### Access the app
Open your browser and navigate to `http://localhost:5173` (or the URL shown in terminal)

### Building for Production
```bash
npm run build
npm run preview
```

---

## Priority Logic Explanation

The `src/utils/priorityLogic.js` module provides intelligent **automatic priority and category detection** for guest requests using keyword analysis.

### How It Works

#### 1. **Priority Levels (1-4)**

The system analyzes the request description and assigns a priority based on keyword weights:

| Level | Label | Score Range | Keywords | Color |
|-------|-------|-------------|----------|-------|
| 1 | **Urgent** | ≥ 20 | leak, flood, fire, smoke, emergency, gas | 🔴 Red |
| 2 | **High** | ≥ 10 | wifi, AC, heat, power, toilet, hot water | 🟠 Orange |
| 3 | **Normal** | ≥ 5 | towel, sheet, clean, noise, parking, key | 🔵 Blue |
| 4 | **Low** | < 5 | question, info, recommendation, pool | ⚫ Grey |

#### 2. **Category Detection**

The system automatically categorizes requests into one or more categories:

- **Maintenance**: electrical, plumbing, HVAC, appliances
- **Housekeeping**: linens, toiletries, cleaning, pests
- **Security**: danger, locks, suspicious activity, noise complaints
- **General**: questions, reservations, amenities

If multiple categories apply, they are combined (e.g., `"Maintenance & Housekeeping"`).

#### 3. **Multi-Segment Analysis**

Complex requests with multiple issues are analyzed individually:
- The system splits text by connectors: `"and"`, `"also"`, `"plus"`, `"&"`, etc.
- Each segment is scored independently
- The **total score** determines the final priority

#### Example

**Input**: "The AC is broken and there's a water leak"
- Segment 1: "AC is broken" → HIGH (weight 10)
- Segment 2: "water leak" → CRITICAL (weight 20)
- **Total Score**: 30 → **Priority 1 (Urgent)**, **Category**: "Maintenance", **Color**: Red

#### Usage

```javascript
import { analyzeRequest } from './utils/priorityLogic';

const result = analyzeRequest("The toilet is clogged and I need clean towels");
console.log(result);
// Output:
// {
//   priority: 2,
//   label: 'High',
//   color: 'orange',
//   category: 'Housekeeping & Maintenance'
// }
```

---

## Troubleshooting

- **Backend won't start**: Ensure `src/backend/.env` has `CLICKUP_TOKEN` set
- **Supabase connection error**: Check `.env` variables and ensure table names are correct
- **ClickUp requests fail**: Verify token and list ID in `src/backend/.env`
- **Port already in use**: Change `PORT` in `src/backend/.env` or terminal: `node src/backend/server.js --port 5175`

---

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express.js (proxy)
- **Databases**: Supabase (PostgreSQL)
- **Task Management**: ClickUp API
- **Build**: Vite
- **Linting**: ESLint

## License

MIT