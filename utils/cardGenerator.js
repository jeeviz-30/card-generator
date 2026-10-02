const crypto = require('crypto');

/**
 * Server-side String Manipulation and Formatting Utilities
 */

// Escape HTML to prevent XSS vulnerabilities
function sanitizeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Format and normalize social links
function formatSocialLink(type, input) {
  if (!input || !input.trim()) return '';
  let cleanInput = input.trim();
  
  if (cleanInput.startsWith('http://') || cleanInput.startsWith('https://')) {
    return cleanInput;
  }

  // Remove leading @ if user typed @username
  if (cleanInput.startsWith('@')) {
    cleanInput = cleanInput.substring(1);
  }

  switch (type) {
    case 'github':
      return `https://github.com/${cleanInput}`;
    case 'linkedin':
      return cleanInput.includes('linkedin.com') ? `https://${cleanInput}` : `https://linkedin.com/in/${cleanInput}`;
    case 'twitter':
      return `https://x.com/${cleanInput}`;
    case 'portfolio':
      return `https://${cleanInput}`;
    default:
      return cleanInput;
  }
}

// Convert raw skills string (comma/newline separated) into clean array
function parseSkills(skillsInput) {
  if (!skillsInput) return [];
  if (Array.isArray(skillsInput)) return skillsInput.map(s => sanitizeHTML(s));
  
  if (typeof skillsInput === 'string' && skillsInput.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(skillsInput);
      if (Array.isArray(parsed)) return parsed.map(s => sanitizeHTML(s));
    } catch (e) {
      // Fall through to delimiter split
    }
  }

  return skillsInput
    .split(/[,;\n]+/)
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
    .map(skill => sanitizeHTML(skill));
}

// Generate URL slug from Full Name
function generateSlug(fullName) {
  const baseSlug = (fullName || 'profile')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');
  
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${baseSlug}-${randomSuffix}`;
}

// Calculate profile completeness score (0 - 100%)
function calculateCompleteness(data) {
  let points = 0;
  if (data.full_name && data.full_name.trim()) points += 20;
  if (data.job_title && data.job_title.trim()) points += 20;
  if (data.bio && data.bio.trim().length > 10) points += 20;
  if (data.skills && data.skills.length > 0) points += 20;
  if (data.avatar_url && data.avatar_url.trim()) points += 10;
  if (data.github_url || data.linkedin_url || data.twitter_url || data.portfolio_url) points += 10;
  return Math.min(100, points);
}

// Generate default SVG Avatar data URL if user didn't upload or provide an image
function generateDefaultAvatar(name) {
  const initials = (name || 'User')
    .split(' ')
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#avatarGrad)" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="42" font-weight="700">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Server-Side HTML Profile Card Generator
 * Returns dynamic HTML code for rendering profile card on server or previewing.
 */
function generateDynamicHTMLCard(profile) {
  let skillsList = [];
  if (typeof profile.skills === 'string') {
    try {
      const parsed = JSON.parse(profile.skills);
      skillsList = Array.isArray(parsed) ? parsed : parseSkills(profile.skills);
    } catch (e) {
      skillsList = parseSkills(profile.skills);
    }
  } else if (Array.isArray(profile.skills)) {
    skillsList = profile.skills;
  }
  
  const avatar = profile.avatar_url && profile.avatar_url.trim() ? profile.avatar_url : generateDefaultAvatar(profile.full_name);
  const theme = profile.theme_style || 'dark-purple';
  
  const formattedBio = sanitizeHTML(profile.bio || 'No bio provided.');
  const name = sanitizeHTML(profile.full_name || 'Anonymous User');
  const title = sanitizeHTML(profile.job_title || 'Software Engineer');

  const skillsHTML = skillsList.map(skill => `
    <span class="skill-badge">${skill}</span>
  `).join('');

  let socialHTML = '';
  if (profile.github_url) {
    socialHTML += `<a href="${profile.github_url}" target="_blank" rel="noopener" class="social-btn github" title="GitHub">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
      GitHub
    </a>`;
  }
  if (profile.linkedin_url) {
    socialHTML += `<a href="${profile.linkedin_url}" target="_blank" rel="noopener" class="social-btn linkedin" title="LinkedIn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
      LinkedIn
    </a>`;
  }
  if (profile.twitter_url) {
    socialHTML += `<a href="${profile.twitter_url}" target="_blank" rel="noopener" class="social-btn twitter" title="Twitter/X">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
      Twitter
    </a>`;
  }
  if (profile.portfolio_url) {
    socialHTML += `<a href="${profile.portfolio_url}" target="_blank" rel="noopener" class="social-btn portfolio" title="Portfolio">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      Website
    </a>`;
  }

  const statusBadge = profile.completeness_score === 100 
    ? `<span class="badge badge-complete">✓ Complete Profile</span>`
    : `<span class="badge badge-pending">⚡ Profile Active</span>`;

  return `
    <div class="user-profile-card theme-${theme}" data-slug="${profile.slug || ''}">
      <div class="card-header-banner">
        <div class="banner-overlay"></div>
        ${statusBadge}
      </div>
      <div class="card-body">
        <div class="avatar-wrapper">
          <img src="${avatar}" alt="${name}" class="profile-avatar" />
        </div>
        <div class="user-info">
          <h2 class="user-name">${name}</h2>
          <p class="user-title">${title}</p>
        </div>
        
        <p class="user-bio">${formattedBio}</p>
        
        <div class="skills-section">
          <h4 class="section-label">Skills & Expertise</h4>
          <div class="skills-container">
            ${skillsHTML.length > 0 ? skillsHTML : '<span class="empty-skills">No skills added</span>'}
          </div>
        </div>
        
        ${socialHTML ? `
          <div class="social-links-section">
            <h4 class="section-label">Connect</h4>
            <div class="social-btns-container">
              ${socialHTML}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="card-footer">
        <div class="completeness-bar-container" title="Profile Completeness: ${profile.completeness_score || 0}%">
          <div class="completeness-bar" style="width: ${profile.completeness_score || 0}%;"></div>
        </div>
        <div class="card-footer-info">
          <span class="completeness-text">${profile.completeness_score || 0}% Profile Strength</span>
          ${profile.slug ? `<a href="/profile/${profile.slug}" class="view-link">Share Profile &rarr;</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  sanitizeHTML,
  formatSocialLink,
  parseSkills,
  generateSlug,
  calculateCompleteness,
  generateDefaultAvatar,
  generateDynamicHTMLCard
};
