// Theme toggle with preference persistence
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const storedTheme = localStorage.getItem('theme');

if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
} else {
  html.classList.remove('dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// Mobile menu toggle & accessible close handlers
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu() {
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }
}

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = mobileMenu.classList.toggle('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', (!isHidden).toString());
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

// Close mobile menu on internal link click
document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', () => closeMobileMenu());
});

// Scroll reveal observer
const revealElements = document.querySelectorAll('.reveal-on-scroll');
if ('IntersectionObserver' in window && revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
} else {
  // Fallback if IntersectionObserver is not supported
  revealElements.forEach(el => el.classList.add('is-visible'));
}

// Navigation active section tracking on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
  const scrollPosition = window.scrollY + 140;
  let currentSectionId = '';

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPosition >= top && scrollPosition < top + height) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href === `#${currentSectionId}`;
    link.classList.toggle('text-cyber-600', isActive);
    link.classList.toggle('dark:text-cyber-400', isActive);
    link.classList.toggle('text-slate-600', !isActive);
    link.classList.toggle('dark:text-slate-400', !isActive);
    link.classList.toggle('active', isActive);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('load', updateActiveNav);

// Copy to clipboard helper
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const textToCopy = btn.getAttribute('data-copy');
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalText = btn.getAttribute('data-original-label') || btn.innerHTML;
      btn.setAttribute('data-original-label', originalText);
      
      // Update label / UI
      const labelSpan = btn.querySelector('.copy-label') || btn;
      const prevLabel = labelSpan.textContent;
      labelSpan.textContent = 'Copied!';
      
      setTimeout(() => {
        labelSpan.textContent = prevLabel;
      }, 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  });
});


// Replay the intro (the button stays hidden without JS)
const replayIntro = document.getElementById('replayIntro');
if (replayIntro) {
  replayIntro.hidden = false;
  replayIntro.addEventListener('click', () => {
    window.location.assign(window.location.pathname);
  });
}
