// Hide ".html" in the address bar: GitHub Pages serves /research and /research.html alike
if (/^https?:$/.test(location.protocol) && /\.html$/.test(location.pathname)) {
    history.replaceState(null, '', location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '') + location.search + location.hash);
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu: closes on link click, outside click or Esc
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
        const icon = toggle.querySelector('i');
        const setMenu = open => {
            menu.classList.toggle('hidden', !open);
            toggle.setAttribute('aria-expanded', String(open));
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-xmark', open);
        };
        const isOpen = () => !menu.classList.contains('hidden');
        toggle.addEventListener('click', () => setMenu(!isOpen()));
        menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
        document.addEventListener('click', e => {
            if (isOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && isOpen()) { setMenu(false); toggle.focus(); }
        });
    }

    // Nav scrolled state + background net dims as you scroll (readability)
    const nav = document.getElementById('site-nav');
    const scrim = document.getElementById('bg-scrim');
    // Active section: last section whose top passed 45% of the viewport; at the page bottom prefer the clicked anchor, else the last section
    const sections = ['home', 'research', 'timeline', 'awards', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
    // Only in-page anchor links; cross-page links keep the highlight set in the markup
    const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
    const updateActive = () => {
        if (!sections.length) return;
        let current = sections[0];
        sections.forEach(sec => { if (sec.getBoundingClientRect().top <= window.innerHeight * 0.45) current = sec; });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            const target = document.getElementById(location.hash.slice(1));
            const top = target && sections.includes(target) ? target.getBoundingClientRect().top : -1;
            current = top >= 0 && top < window.innerHeight && target.id !== 'home' ? target : sections[sections.length - 1];
        }
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current.id));
    };
    let ticking = false;
    const onScroll = () => {
        ticking = false;
        nav.classList.toggle('is-scrolled', window.scrollY > 24);
        scrim.style.opacity = Math.min(0.55, window.scrollY / window.innerHeight * 0.55).toFixed(3);
        updateActive();
    };
    window.addEventListener('hashchange', updateActive);
    window.addEventListener('resize', updateActive);
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window) {
        // Scroll reveal (siblings appear in sequence)
        const io = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        }), { rootMargin: '0px 0px -8% 0px' });
        document.querySelectorAll('.reveal').forEach(el => {
            const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
            el.style.setProperty('--rd', (siblings.indexOf(el) % 4) * 90 + 'ms');
            io.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});

// Animated net background: load three.js + Vanta after page load so first paint is not blocked;
// skipped with reduced motion or Save-Data, leaving the static gradient
(function () {
    const mm = q => window.matchMedia && window.matchMedia(q).matches;
    const hasWebGL = (() => {
        try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); }
        catch (e) { return false; }
    })();
    if (!hasWebGL || mm('(prefers-reduced-motion: reduce)') || (navigator.connection && navigator.connection.saveData)) return;
    const load = (src, integrity) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.integrity = integrity;
        s.crossOrigin = 'anonymous';
        s.referrerPolicy = 'no-referrer';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
    const start = () => {
        load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', 'sha512-334uBDwY0iZ2TklV1OtDtBW9vp7jjP7SWRzT7Ehu1fdtPIjTpCwTSFb8HI/YBau9L1/kRBEOALrS229Kry4yFQ==')
            .then(() => load('https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js', 'sha512-lH/5/byfwH0bqySiiSINJJoEoWFEBGKgOwsnAlZZPviNJI1DDBVXjPHgEkM0fowfOp6NMBAN4ROAYjx+uEkEjQ=='))
            .then(() => {
                const small = window.innerWidth < 768;
                window.vantaEffect = VANTA.NET({
                    el: '#vanta-bg',
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.50,        // lower render resolution on phones to save power
                    color: 0x00f3ff,          // neon blue
                    backgroundColor: 0x050b14, // deep background
                    points: small ? 6.00 : 10.00,
                    maxDistance: small ? 16.00 : 20.00,
                    spacing: small ? 20.00 : 18.00,
                    showDots: true
                });
            })
            .catch(e => console.warn('Vanta background skipped:', e));
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start);
})();
