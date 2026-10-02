# User Profile Card Generator 🚀

A full-stack, server-processed web application built with **Node.js**, **Express**, **EJS**, and **SQLite** (`better-sqlite3`). This project processes user form inputs on the server, performs string manipulation and data sanitization, generates dynamic HTML profile cards, and persists profile records in a local SQLite database.

![User Profile Card Generator](https://raw.githubusercontent.com/user-profile-card-generator/preview.png)

---

## 🎯 Features & Objectives

- **Form-Based Data Capture**: Captures user details including Full Name, Job Title, Bio, Skills (comma-separated), Avatar URL / Preset selection, Card Theme styles, and Social Media Links.
- **Server-Side Form Processing**:
  - HTML entity sanitization to prevent XSS attacks.
  - String manipulation (trimming, capitalizations, auto-formatting `@handles` to full HTTPS URLs).
  - Parsing skills string into dynamic tag array badges.
  - Generating unique URL slugs for shareable profile links.
  - Calculating profile completeness strength score (0% - 100%).
- **Dynamic HTML Card Rendering**:
  - Server-rendered HTML profile card component with customizable visual themes (`Dark Purple`, `Cyberpunk Neon`, `Aurora Violet`, `Emerald Pro`).
  - Auto-generated SVG avatars for profiles without uploaded images.
  - Live interactive client preview synchronized with real-time form inputs.
- **SQLite Database Persistence**:
  - Zero-config persistent SQL storage in `database/profiles.db`.
  - Stored profiles gallery with real-time search & filter functionality.
  - Individual profile view, shareable URLs, embeddable iframe HTML code, and record deletion.

---

## 🛠️ Project Structure

```
workora2/
├── db.js                     # SQLite Database connection & Profile model
├── server.js                 # Express server & route handlers
├── utils/
│   └── cardGenerator.js      # Server-side string manipulation & HTML card generator
├── views/
│   ├── index.ejs             # Main dashboard (Form + Requirements + Live Preview)
│   ├── profile.ejs           # Individual profile card view & export tools
│   ├── gallery.ejs           # Database profiles gallery with search & filters
│   └── components/
│       ├── navbar.ejs        # Navigation bar header
│       └── footer.ejs        # App footer
└── public/
    ├── css/
    │   └── styles.css        # Dark glassmorphic futuristic CSS styling
    └── js/
        ├── app.js            # Client live preview script
        └── cardExport.js     # Shareable link & embed code helper
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/user-profile-card-generator.git
cd user-profile-card-generator
npm install
```

### 3. Run the Server
Start the Express server:

```bash
npm start # or node server.js
```

The application will launch at `http://localhost:3000`.

---

## 🌐 Deploy to Render.com

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/jeeviz-30/card-generator`.
3. Configure the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Click **Create Web Service**. Your live web app will be deployed automatically!

---

## 📡 API & Server Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Main dashboard with HTML form & live dynamic card preview |
| `POST` | `/api/profiles` | Process form data, sanitize strings, store in SQLite DB & redirect |
| `GET` | `/gallery` | Browse all saved profile cards with search filter (`?q=keyword`) |
| `GET` | `/profile/:slug` | View dynamic HTML profile card page by slug |
| `GET` | `/embed/:slug` | Render raw card HTML for iframe embed integration |
| `POST` | `/api/profiles/:id/delete` | Delete profile record from SQLite database |
| `GET` | `/api/profiles/:slug` | JSON API endpoint returning profile object & card HTML |

---

## 🛡️ Key Technical Implementations

### Server-Side String Manipulation & Formatting
```javascript
// Sanitizes input string to prevent XSS
function sanitizeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Converts Twitter/X handle or URL into normalized link
function formatSocialLink(type, input) {
  if (!input) return '';
  let cleanInput = input.trim();
  if (cleanInput.startsWith('@')) cleanInput = cleanInput.substring(1);
  if (type === 'twitter') return `https://x.com/${cleanInput}`;
  return cleanInput;
}
```

---

## 📄 License
ISC License.
