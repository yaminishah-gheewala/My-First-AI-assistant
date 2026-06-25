// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Mobile hamburger — toggle nav-links visibility
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navCta = document.querySelector('.nav-cta');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.cssText = open
      ? ''
      : 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:rgba(8,12,20,0.97);padding:24px;gap:20px;border-bottom:1px solid rgba(99,130,255,0.12);z-index:99';
  });
}

// Subtle scroll shadow on nav
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 10
    ? '0 4px 24px rgba(0,0,0,0.5)'
    : '';
}, { passive: true });

// Animate feature cards on scroll (IntersectionObserver)
const cards = document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .step');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = entry.target.style.transform.replace('translateY(24px)', 'translateY(0)') || '';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.transform = 'translateY(24px)';
    observer.observe(card);
  });
}

// CTA form submission feedback
const ctaForm = document.querySelector('.cta-form');
if (ctaForm) {
  ctaForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = ctaForm.querySelector('input');
    const btn = ctaForm.querySelector('button');
    if (!input.value.includes('@')) {
      input.style.borderColor = '#f87171';
      input.focus();
      return;
    }
    btn.textContent = '✓ You\'re on the list!';
    btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
    btn.disabled = true;
    input.disabled = true;
  });
}
