const express = require('express');
const path = require('path');
const ProfileModel = require('./db');
const {
  sanitizeHTML,
  formatSocialLink,
  parseSkills,
  generateSlug,
  calculateCompleteness,
  generateDefaultAvatar,
  generateDynamicHTMLCard
} = require('./utils/cardGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Seed Initial Sample Profile Data if database is empty
function seedDatabaseIfEmpty() {
  const existing = ProfileModel.getAll();
  if (existing.length === 0) {
    const seedData = [
      {
        full_name: 'Sarah Connor',
        job_title: 'Full-Stack Node.js Developer',
        bio: 'Building high-performance server-side APIs, database systems, and interactive UI components.',
        skills: JSON.stringify(['Node.js', 'Express', 'SQLite', 'EJS', 'REST APIs', 'CSS3']),
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        theme_style: 'dark-purple',
        github_url: 'https://github.com/sarahconnor',
        linkedin_url: 'https://linkedin.com/in/sarahconnor-dev',
        twitter_url: 'https://x.com/sarah_node',
        portfolio_url: 'https://sarahconnor.dev',
        completeness_score: 100,
        slug: 'sarah-connor-seed1'
      },
      {
        full_name: 'Marcus Vance',
        job_title: 'DevOps & Backend Engineer',
        bio: 'Specialist in cloud architectures, microservices, containerization, and automated CI/CD pipelines.',
        skills: JSON.stringify(['Docker', 'Kubernetes', 'Go', 'Node.js', 'PostgreSQL', 'AWS']),
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        theme_style: 'cyberpunk',
        github_url: 'https://github.com/marcusvance',
        linkedin_url: 'https://linkedin.com/in/marcusvance',
        twitter_url: 'https://x.com/marcus_ops',
        portfolio_url: 'https://marcusvance.io',
        completeness_score: 90,
        slug: 'marcus-vance-seed2'
      }
    ];

    seedData.forEach(p => ProfileModel.create(p));
    console.log('🌱 Seeded default sample profiles into database.');
  }
}

seedDatabaseIfEmpty();

// Routes

// 1. Home Dashboard Route
app.get('/', (req, res) => {
  const profiles = ProfileModel.getAll();
  res.render('index', { profiles, error: null });
});

// 2. Server-side Form Processing Route
app.post('/api/profiles', (req, res) => {
  try {
    const {
      full_name,
      job_title,
      bio,
      skills,
      avatar_url,
      theme_style,
      github_url,
      linkedin_url,
      twitter_url,
      portfolio_url
    } = req.body;

    // Server-side validation
    if (!full_name || !full_name.trim() || !job_title || !job_title.trim()) {
      const profiles = ProfileModel.getAll();
      return res.status(400).render('index', {
        profiles,
        error: 'Full Name and Job Title are required fields.'
      });
    }

    // Server-side String Manipulation & Formatting
    const cleanedName = sanitizeHTML(full_name.trim());
    const cleanedTitle = sanitizeHTML(job_title.trim());
    const cleanedBio = sanitizeHTML((bio || '').trim());
    
    // Parse skills input string into dynamic tag array
    const parsedSkills = parseSkills(skills);
    const skillsJSON = JSON.stringify(parsedSkills);

    // Format Social Links safely
    const formattedGithub = formatSocialLink('github', github_url);
    const formattedLinkedin = formatSocialLink('linkedin', linkedin_url);
    const formattedTwitter = formatSocialLink('twitter', twitter_url);
    const formattedPortfolio = formatSocialLink('portfolio', portfolio_url);

    // Generate unique slug
    const slug = generateSlug(cleanedName);

    // Calculate completeness score
    const completeness_score = calculateCompleteness({
      full_name: cleanedName,
      job_title: cleanedTitle,
      bio: cleanedBio,
      skills: parsedSkills,
      avatar_url: avatar_url,
      github_url: formattedGithub,
      linkedin_url: formattedLinkedin,
      twitter_url: formattedTwitter,
      portfolio_url: formattedPortfolio
    });

    const profileData = {
      slug,
      full_name: cleanedName,
      job_title: cleanedTitle,
      bio: cleanedBio,
      skills: skillsJSON,
      avatar_url: (avatar_url || '').trim(),
      theme_style: theme_style || 'dark-purple',
      github_url: formattedGithub,
      linkedin_url: formattedLinkedin,
      twitter_url: formattedTwitter,
      portfolio_url: formattedPortfolio,
      completeness_score
    };

    // Store created profile record in SQLite Database
    const profileId = ProfileModel.create(profileData);
    console.log(`✅ Stored new profile in database with ID: ${profileId}, Slug: ${slug}`);

    // Redirect to dynamic profile page
    res.redirect(`/profile/${slug}`);
  } catch (err) {
    console.error('Server error processing form:', err);
    const profiles = ProfileModel.getAll();
    res.status(500).render('index', {
      profiles,
      error: 'Failed to create profile card due to server error: ' + err.message
    });
  }
});

// 3. Profiles Gallery Route
app.get('/gallery', (req, res) => {
  const searchQuery = req.query.q || '';
  const profiles = searchQuery ? ProfileModel.search(searchQuery) : ProfileModel.getAll();

  // Generate dynamic HTML string for each profile card
  const cardHTMLs = {};
  profiles.forEach(p => {
    cardHTMLs[p.id] = generateDynamicHTMLCard(p);
  });

  res.render('gallery', { profiles, cardHTMLs, searchQuery });
});

// 4. Single Profile View Route (Server Dynamic HTML rendering)
app.get('/profile/:slug', (req, res) => {
  const profile = ProfileModel.getBySlug(req.params.slug);
  if (!profile) {
    return res.status(404).send('Profile Not Found');
  }

  // Generate dynamic HTML card string on server
  const cardHTML = generateDynamicHTMLCard(profile);

  res.render('profile', { profile, cardHTML });
});

// 5. Iframe Embed Card Route
app.get('/embed/:slug', (req, res) => {
  const profile = ProfileModel.getBySlug(req.params.slug);
  if (!profile) {
    return res.status(404).send('Profile Not Found');
  }
  const cardHTML = generateDynamicHTMLCard(profile);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="/css/styles.css">
      <style>body { background: transparent; padding: 0; margin: 0; font-family: sans-serif; }</style>
    </head>
    <body>
      ${cardHTML}
    </body>
    </html>
  `);
});

// 6. Delete Profile Route
app.post('/api/profiles/:id/delete', (req, res) => {
  const deleted = ProfileModel.delete(req.params.id);
  res.redirect('/gallery');
});

// 7. API JSON Endpoint
app.get('/api/profiles/:slug', (req, res) => {
  const profile = ProfileModel.getBySlug(req.params.slug);
  if (!profile) return res.status(404).json({ error: 'Not found' });
  const cardHTML = generateDynamicHTMLCard(profile);
  res.json({ profile, cardHTML });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 User Profile Card Generator server running on http://localhost:${PORT}`);
});
