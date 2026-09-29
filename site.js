// 地址栏隐藏 .html：GitHub Pages 同时支持 /research 与 /research.html，这里把旧链接显示为简洁地址
if (/^https?:$/.test(location.protocol) && /\.html$/.test(location.pathname)) {
    history.replaceState(null, '', location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '') + location.search + location.hash);
}

document.addEventListener('DOMContentLoaded', () => {
    // 移动端菜单：点击链接 / 点击外部 / Esc 均可收起
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

    // 导航栏滚动态 + 背景网络随滚动渐暗 (提升正文可读性)
    const nav = document.getElementById('site-nav');
    const scrim = document.getElementById('bg-scrim');
    // 当前板块高亮：取顶部越过视口 45% 的最后一个板块；滚到底时优先刚点击的锚点，否则为最后一个板块
    const sections = ['home', 'research', 'timeline', 'awards', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
    // 只处理本页锚点链接；跨页链接 (如 research.html) 保持页面自身设置的高亮
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
        // 滚动渐显 (同组元素依次出现)
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

// 动态网络背景：页面加载完成后再加载 three.js + Vanta，不阻塞首屏；
// 开启"减少动态效果"或省流量模式时跳过，保留静态渐变背景
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
                    scaleMobile: 1.50,        // 手机端降低渲染分辨率，省电
                    color: 0x00f3ff,          // 霓虹蓝
                    backgroundColor: 0x050b14, // 深背景
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
