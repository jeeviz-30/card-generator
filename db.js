const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbFilePath = process.env.DATABASE_PATH || path.join(__dirname, 'database', 'profiles.db');
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbFilePath);

// Initialize Database Table
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    bio TEXT,
    skills TEXT NOT NULL,
    avatar_url TEXT,
    theme_style TEXT DEFAULT 'dark-purple',
    github_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    portfolio_url TEXT,
    completeness_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Helper methods
const ProfileModel = {
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC');
    return stmt.all();
  },

  getBySlug: (slug) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE slug = ?');
    return stmt.get(slug);
  },

  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
    return stmt.get(id);
  },

  create: (profileData) => {
    const stmt = db.prepare(`
      INSERT INTO profiles (
        slug, full_name, job_title, bio, skills, avatar_url, theme_style,
        github_url, linkedin_url, twitter_url, portfolio_url, completeness_score
      ) VALUES (
        @slug, @full_name, @job_title, @bio, @skills, @avatar_url, @theme_style,
        @github_url, @linkedin_url, @twitter_url, @portfolio_url, @completeness_score
      )
    `);
    const info = stmt.run(profileData);
    return info.lastInsertRowid;
  },

  delete: (id) => {
    const stmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
    const profile = stmt.get(id);
    if (!profile) return false;
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    return profile;
  },

  search: (query) => {
    const searchPattern = `%${query}%`;
    const stmt = db.prepare(`
      SELECT * FROM profiles 
      WHERE full_name LIKE ? OR job_title LIKE ? OR skills LIKE ? OR bio LIKE ?
      ORDER BY created_at DESC
    `);
    return stmt.all(searchPattern, searchPattern, searchPattern, searchPattern);
  }
};

module.exports = ProfileModel;
