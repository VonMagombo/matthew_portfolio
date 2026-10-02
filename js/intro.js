// Intro, played on every visit: a lens decrypts the CV under it, verifies it, then opens into the live hero.
// The gate and the fail-safe live inline in <head>; this file only runs the animation.
(function () {
  const root = document.documentElement;
  if (!root.classList.contains('intro-on')) return;

  const bail = () => {
    window.__mvmIntroRunning = false;
    if (window.__mvmIntroBail) window.__mvmIntroBail();
  };
  if (!window.gsap || !window.ScrambleTextPlugin || !window.DrawSVGPlugin) {
    bail();
    return;
  }
  gsap.registerPlugin(ScrambleTextPlugin, DrawSVGPlugin);

  // Real facts only, no contact details. Rows stay under 40 columns so the tags fit beside them.
  const DOC = [
    { text: 'MATTHEW VONROY MAGOMBO', kind: 'name' },
    { text: 'Computer Systems & Cloud Engineer', kind: 'sub' },
    { text: '' },
    { text: '// EXPERIENCE', kind: 'head' },
    { text: 'IT Intern · Central Vehicle Registry', id: 'cvr' },
    { text: 'CS Tutor · Opening Horizons Academy' },
    { text: '' },
    { text: '// CERTIFICATIONS', kind: 'head' },
    { text: 'Google Cybersecurity Professional', id: 'google' },
    { text: 'ALX Cybersecurity Programme' },
    { text: 'Kubernetes & Cloud Native (LFS250)', id: 'k8s' },
    { text: 'OCI 2025 AI Foundations Associate' },
    { text: 'Microsoft GitHub Copilot' },
    { text: '' },
    { text: '// EDUCATION', kind: 'head' },
    { text: 'BSc (Hons) Computer Systems Eng, 2.1' },
    { text: 'Midlands State University' },
  ];
  const HEX = '0123456789abcdef';

  // One glyph per non-space character, so ciphertext and plaintext share every column.
  const cipherOf = (text, row) =>
    text.replace(/\S/g, (c, i) => HEX[(i * 7 + row * 13 + c.charCodeAt(0)) % 16]);

  // This file can execute before <body> is parsed, so all DOM work waits for init().
  function init() {
    if (!root.classList.contains('intro-on')) return;
    window.__mvmIntroRunning = true;
    const overlay = document.getElementById('intro-root');
    const skipBtn = document.getElementById('intro-skip');
    const status = document.getElementById('intro-status');
    const doc = overlay.querySelector('.intro-doc');
    const cipherLayer = doc.querySelector('.doc-cipher');
    const plainLayer = doc.querySelector('.doc-plain');
    const tagLayer = doc.querySelector('.doc-tags');
    const reticle = doc.querySelector('.doc-reticle');
    const lens = overlay.querySelector('.intro-lens');

    const rowEl = (text, kind) => {
      const row = document.createElement('div');
      row.className = 'doc-row' + (kind ? ' is-' + kind : '');
      const span = document.createElement('span');
      span.textContent = text;
      row.append(span);
      return row;
    };
    // Nothing behind the overlay is reachable while it is up.
    const behind = [...document.body.children].filter((el) => el !== overlay && el.tagName !== 'SCRIPT');
    behind.forEach((el) => { el.inert = true; });
    status.textContent = 'Intro animation playing. Press Escape to skip.';

    const lensPos = { x: -999, y: -999 };
    const place = () => {
      overlay.style.setProperty('--lx', lensPos.x + 'px');
      overlay.style.setProperty('--ly', lensPos.y + 'px');
    };

    let ctx = null;
    let main = null;
    let exit = null;
    let done = false;

    function cleanup() {
      if (done) return;
      done = true;
      const hadFocus = overlay.contains(document.activeElement);
      root.classList.remove('intro-on', 'intro-hold');
      behind.forEach((el) => { el.inert = false; });
      removeEventListener('keydown', onKey);
      removeEventListener('resize', onResize);
      if (ctx) ctx.revert();
      overlay.remove();
      window.__mvmIntroRunning = false;
      if (hadFocus) {
        const first = document.querySelector('nav a');
        if (first) first.focus({ preventScroll: true });
      }
    }

    // The lens circle becomes a hole in the overlay and widens until the site fills the screen.
    function enter(fast) {
      if (done) return;
      if (exit) {
        exit.progress(1);
        return;
      }
      if (!ctx) {
        cleanup();
        return;
      }
      if (main) main.kill();
      const d = fast ? 0.4 : 0.8;
      const reach = Math.hypot(
        Math.max(lensPos.x, innerWidth - lensPos.x),
        Math.max(lensPos.y, innerHeight - lensPos.y)
      );
      ctx.add(() => {
        overlay.classList.add('is-portal');
        exit = gsap.timeline({ onComplete: cleanup })
          .to([lens, skipBtn], { opacity: 0, duration: d * 0.3 }, 0)
          .fromTo(overlay, { '--hole': '0px' }, { '--hole': reach + 'px', duration: d, ease: 'expo.inOut' }, 0)
          .call(() => root.classList.remove('intro-hold'), null, d * 0.6);
      });
    }

    function skip() {
      enter(true);
    }
    function onKey(e) {
      if (e.key === 'Escape') skip();
    }
    // Only a width change invalidates the layout; mobile browsers resize height as their toolbars move.
    const startWidth = innerWidth;
    function onResize() {
      if (innerWidth !== startWidth) skip();
    }
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      skip();
    });
    overlay.addEventListener('click', skip);
    overlay.addEventListener('wheel', skip, { passive: true, once: true });
    overlay.addEventListener('touchmove', skip, { passive: true, once: true });
    addEventListener('keydown', onKey);
    addEventListener('resize', onResize);

    // Never trap anyone behind the overlay, whatever goes wrong below.
    setTimeout(cleanup, 9000);

    function build() {
      DOC.forEach((row, i) => {
        cipherLayer.append(rowEl(cipherOf(row.text, i), row.kind));
        plainLayer.append(rowEl(row.text, row.kind));
      });

      const vw = innerWidth;
      const vh = innerHeight;
      const R = Math.round(Math.min(92, Math.max(52, Math.min(vw, vh) * 0.09)));
      const box = doc.getBoundingClientRect();
      overlay.style.setProperty('--lr', R + 'px');
      overlay.style.setProperty('--dx', box.left + 'px');
      overlay.style.setProperty('--dy', box.top + 'px');

      const frame = doc.querySelector('.intro-frame rect');
      frame.setAttribute('x', 0.5);
      frame.setAttribute('y', 0.5);
      frame.setAttribute('width', box.width - 1);
      frame.setAttribute('height', box.height - 1);

      const rows = [...cipherLayer.children];
      const index = (id) => DOC.findIndex((r) => r.id === id || r.kind === id);
      const span = (i) => rows[i].firstChild;
      const rowY = (i) => box.top + rows[i].offsetTop + rows[i].offsetHeight / 2;
      const left = (i) => ({ row: i, x: box.left + span(i).offsetLeft + R * 0.55, y: rowY(i) });
      const right = (i) => {
        const s = span(i);
        return { row: i, x: Math.max(left(i).x, box.left + s.offsetLeft + s.offsetWidth - R * 0.35), y: rowY(i) };
      };

      const flagged = vw < 640 ? ['google', 'k8s'] : ['cvr', 'google', 'k8s'];
      const tags = {};
      flagged.forEach((id) => {
        const i = index(id);
        const tag = document.createElement('div');
        tag.className = 'doc-tag';
        tag.style.top = rows[i].offsetTop + rows[i].offsetHeight / 2 + 'px';
        tag.innerHTML = '<span>[ verified ]</span>';
        tagLayer.append(tag);
        tags[i] = tag;
      });

      const cvr = index('cvr');
      const google = index('google');
      const k8s = index('k8s');
      const name = index('name');
      const path = [right(cvr), left(google), right(google), left(k8s), right(k8s)];
      const start = left(cvr);
      const nameSpan = span(name);
      const lock = {
        x: box.left + nameSpan.offsetLeft + nameSpan.offsetWidth / 2,
        y: rowY(name),
      };

      const pad = 8;
      Object.assign(reticle.style, {
        left: nameSpan.offsetLeft - pad + 'px',
        top: rows[name].offsetTop - pad / 2 + 'px',
        width: nameSpan.offsetWidth + pad * 2 + 'px',
        height: rows[name].offsetHeight + pad + 'px',
      });

      const prompt = overlay.querySelector('.intro-prompt .intro-type');
      const hash = overlay.querySelector('.intro-hash .intro-type');
      const ok = overlay.querySelector('.intro-hash b');
      const D = Math.max(vw, vh) * 0.6;

      lensPos.x = start.x - D;
      lensPos.y = start.y + D;
      place();

      ctx = gsap.context(() => {
        gsap.to(lens.querySelector('.lens-scan'), {
          attr: { y: 60 }, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true,
        });

        main = gsap.timeline({ onUpdate: place, onComplete: () => enter(false) });

        // Boot and document (0 to 0.7s)
        main
          .from(prompt, { width: 0, duration: 0.3, ease: `steps(${prompt.textContent.length})` }, 0)
          .from(frame, { drawSVG: 0, duration: 0.5, ease: 'power2.out' }, 0.2)
          .from(rows, { opacity: 0, duration: 0.25, stagger: 0.02 }, 0.25);

        // The lens slides in along its handle's axis (0.5 to 0.85s)
        main
          .to(lens, { opacity: 1, duration: 0.2 }, 0.5)
          .to(lensPos, { x: start.x, y: start.y, duration: 0.35, ease: 'back.out(1.4)' }, 0.5);

        // Scan in a Z pattern, tagging each credential as the lens leaves it (0.85 to ~1.9s)
        let t = 0.85;
        let prev = start;
        path.forEach((pt) => {
          const dur = pt.row === prev.row ? 0.22 : 0.18;
          main.to(lensPos, { x: pt.x, y: pt.y, duration: dur, ease: 'sine.inOut' }, t);
          t += dur;
          if (tags[pt.row] && pt.x !== prev.x) {
            main.fromTo(tags[pt.row], { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }, t + 0.04);
          }
          prev = pt;
        });

        // Lock onto the name, decrypt it in place and verify the file (~1.9 to 2.6s)
        main
          .to(lensPos, { x: lock.x, y: lock.y, duration: 0.3, ease: 'expo.out' }, t)
          .fromTo(reticle, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power3.out' }, t + 0.22)
          .call(() => rows[name].classList.add('is-clear'), null, t + 0.22)
          .to(nameSpan, { duration: 0.35, scrambleText: { text: DOC[name].text, chars: HEX, speed: 1 } }, t + 0.22)
          .to(hash, { width: 'auto', duration: 0.3, ease: `steps(${hash.textContent.length})` }, t + 0.3)
          .to(ok, { color: '#10b981', duration: 0.15 }, t + 0.62)
          .to({}, { duration: 0.1 });
      });
    }

    // Both layers must share the real font's metrics before anything is measured.
    const fontReady = document.fonts
      ? Promise.race([document.fonts.load('14px "JetBrains Mono"'), new Promise((r) => setTimeout(r, 600))])
      : Promise.resolve();

    const run = () => {
      if (done) return;
      try {
        build();
      } catch (err) {
        console.warn('Intro skipped:', err);
        if (ctx) ctx.revert();
        cleanup();
      }
    };

    fontReady.then(run, run);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
