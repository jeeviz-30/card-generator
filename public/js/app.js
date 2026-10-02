document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profileForm');
  const previewContainer = document.getElementById('cardPreviewContainer');
  
  // Inputs
  const inputName = document.getElementById('fullName');
  const inputTitle = document.getElementById('jobTitle');
  const inputBio = document.getElementById('bio');
  const inputSkills = document.getElementById('skills');
  const inputAvatar = document.getElementById('avatarUrl');
  const selectTheme = document.getElementById('themeStyle');
  const inputGithub = document.getElementById('githubUrl');
  const inputLinkedin = document.getElementById('linkedinUrl');
  const inputTwitter = document.getElementById('twitterUrl');
  const inputPortfolio = document.getElementById('portfolioUrl');

  // Real-time server-synced or client preview update
  function updatePreview() {
    if (!previewContainer) return;

    const name = inputName ? inputName.value.trim() || 'Jane Doe' : 'Jane Doe';
    const title = inputTitle ? inputTitle.value.trim() || 'Full-Stack Developer' : 'Full-Stack Developer';
    const bio = inputBio ? inputBio.value.trim() || 'Passionate about building server-rendered web applications, elegant UI designs, and scalable Node.js architectures.' : 'Passionate about building server-rendered web applications, elegant UI designs, and scalable Node.js architectures.';
    const skills = inputSkills ? inputSkills.value.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : ['Node.js', 'Express', 'SQLite', 'HTML5', 'CSS3'];
    const avatar = inputAvatar && inputAvatar.value.trim() ? inputAvatar.value.trim() : generateInitialsAvatar(name);
    const theme = selectTheme ? selectTheme.value : 'dark-purple';

    const github = inputGithub ? inputGithub.value.trim() : '';
    const linkedin = inputLinkedin ? inputLinkedin.value.trim() : '';
    const twitter = inputTwitter ? inputTwitter.value.trim() : '';
    const portfolio = inputPortfolio ? inputPortfolio.value.trim() : '';

    // Calculate live score
    let score = 0;
    if (name && name !== 'Jane Doe') score += 20;
    if (title && title !== 'Full-Stack Developer') score += 20;
    if (bio && bio.length > 10) score += 20;
    if (skills.length > 0) score += 20;
    if (inputAvatar && inputAvatar.value.trim()) score += 10;
    if (github || linkedin || twitter || portfolio) score += 10;

    const skillsHTML = skills.length > 0
      ? skills.map(skill => `<span class="skill-badge">${escapeHTML(skill)}</span>`).join('')
      : '<span class="empty-skills">No skills added</span>';

    let socialHTML = '';
    if (github) {
      socialHTML += `<a href="${formatSocial(github, 'github')}" target="_blank" class="social-btn github">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
        GitHub
      </a>`;
    }
    if (linkedin) {
      socialHTML += `<a href="${formatSocial(linkedin, 'linkedin')}" target="_blank" class="social-btn linkedin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
        LinkedIn
      </a>`;
    }
    if (twitter) {
      socialHTML += `<a href="${formatSocial(twitter, 'twitter')}" target="_blank" class="social-btn twitter">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
        Twitter
      </a>`;
    }
    if (portfolio) {
      socialHTML += `<a href="${formatSocial(portfolio, 'portfolio')}" target="_blank" class="social-btn portfolio">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        Website
      </a>`;
    }

    previewContainer.innerHTML = `
      <div class="user-profile-card theme-${theme}">
        <div class="card-header-banner">
          <span class="badge badge-pending">⚡ Live Preview</span>
        </div>
        <div class="card-body">
          <div class="avatar-wrapper">
            <img src="${avatar}" alt="${escapeHTML(name)}" class="profile-avatar" />
          </div>
          <div class="user-info">
            <h2 class="user-name">${escapeHTML(name)}</h2>
            <p class="user-title">${escapeHTML(title)}</p>
          </div>
          <p class="user-bio">${escapeHTML(bio)}</p>
          
          <div class="skills-section">
            <h4 class="section-label">Skills & Expertise</h4>
            <div class="skills-container">${skillsHTML}</div>
          </div>
          
          ${socialHTML ? `
            <div class="social-links-section">
              <h4 class="section-label">Connect</h4>
              <div class="social-btns-container">${socialHTML}</div>
            </div>
          ` : ''}
        </div>
        
        <div class="card-footer">
          <div class="completeness-bar-container">
            <div class="completeness-bar" style="width: ${score}%;"></div>
          </div>
          <div class="card-footer-info">
            <span class="completeness-text">${score}% Card Strength</span>
            <span class="view-link">Ready to Save &rarr;</span>
          </div>
        </div>
      </div>
    `;
  }

  // Helpers
  function escapeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatSocial(url, type) {
    if (url.startsWith('http')) return url;
    if (url.startsWith('@')) url = url.substring(1);
    if (type === 'github') return `https://github.com/${url}`;
    if (type === 'linkedin') return `https://linkedin.com/in/${url}`;
    if (type === 'twitter') return `https://x.com/${url}`;
    return `https://${url}`;
  }

  function generateInitialsAvatar(name) {
    const initials = name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs>
      <rect width="120" height="120" rx="60" fill="url(#g)"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Segoe UI, sans-serif" font-size="42" font-weight="700">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Listeners for live input previewing
  const formInputs = [inputName, inputTitle, inputBio, inputSkills, inputAvatar, selectTheme, inputGithub, inputLinkedin, inputTwitter, inputPortfolio];
  formInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updatePreview);
      input.addEventListener('change', updatePreview);
    }
  });

  // Preset avatar click handler
  document.querySelectorAll('.preset-avatar-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.preset-avatar-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      const avatarSrc = option.getAttribute('data-avatar');
      if (inputAvatar) {
        inputAvatar.value = avatarSrc;
        updatePreview();
      }
    });
  });

  // Initial preview render
  updatePreview();
});
