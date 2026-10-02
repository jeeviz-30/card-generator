function copyEmbedCode(slug) {
  const embedCode = `<iframe src="${window.location.origin}/embed/${slug}" width="380" height="480" frameborder="0" style="border-radius:16px; overflow:hidden;"></iframe>`;
  navigator.clipboard.writeText(embedCode).then(() => {
    showToast('Embed HTML code copied to clipboard!');
  });
}

function copyProfileLink(slug) {
  const link = `${window.location.origin}/profile/${slug}`;
  navigator.clipboard.writeText(link).then(() => {
    showToast('Shareable Profile URL copied to clipboard!');
  });
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
