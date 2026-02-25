import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThemeToggle from './ui/ThemeToggle';

gsap.registerPlugin(ScrollTrigger);

// Smooth scroll to top — dispatches event for Lenis to animate elegantly
const scrollToTopSmooth = () => {
    window.dispatchEvent(new CustomEvent('scrollToTop', { detail: { smooth: true } }));
};

// Page title mapping for mobile native-style header
const PAGE_TITLES = {
    '/catalog': 'Каталог',
    '/b2b': 'Бизнесу',
    '/about': 'О нас',
    '/blog': 'Блог',
    '/contact': 'Контакты',
    '/workflow': 'Этапы работы',
    '/reviews': 'Отзывы',
    '/delivery': 'Доставка',
    '/returns': 'Возврат',
    '/guarantee': 'Гарантии',
    '/request': 'Заявка',
};

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const headerRef = useRef(null);
    const logoTextRef = useRef(null);
    const subTextRef = useRef(null);
    const navRef = useRef(null);
    const mobileLogoRef = useRef(null);
    const mobileSubRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dynamicTitle, setDynamicTitle] = useState('');

    // Determine mobile header mode
    const isHome = location.pathname === '/';
    const isProductPage = location.pathname.startsWith('/product/');
    const isBlogPost = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';
    const showMobileBackButton = !isHome; // Show back button on all pages except home
    const mobileTitle = PAGE_TITLES[location.pathname] || dynamicTitle || '';

    // Listen for dynamic page title updates (e.g. from ProductDetail)
    useEffect(() => {
        const handler = (e) => setDynamicTitle(e.detail || '');
        window.addEventListener('setPageTitle', handler);
        return () => window.removeEventListener('setPageTitle', handler);
    }, []);

    // Reset dynamic title on route change
    useEffect(() => {
        setDynamicTitle('');
    }, [location.pathname]);

    // Handle nav link click — if already on this page, smooth scroll to top
    const handleNavClick = (e, path) => {
        if (location.pathname === path) {
            e.preventDefault();
            scrollToTopSmooth();
        }
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('lumera_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('lumera_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('lumera_theme', 'light');
        }
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial entrance
            gsap.from(headerRef.current, { y: -100, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 });

            // Scroll Animation: Shrink Logo ONLY
            ScrollTrigger.create({
                start: 'top top',
                end: 100,
                onUpdate: (self) => {
                    const progress = self.progress;
                    // Scale logo from 1.0 down to 0.6
                    const scale = 1 - (progress * 0.4);
                    // Opacity of subtext fades out
                    const subOpacity = 1 - (progress * 2);

                    gsap.set(logoTextRef.current, { scale: scale, transformOrigin: 'left center' });
                    gsap.set(subTextRef.current, { opacity: Math.max(0, subOpacity), height: Math.max(0, (1 - progress) * 20) });
                }
            });
        }, headerRef);

        return () => ctx.revert();
    }, []);

    // Mobile logo scroll animation (home page only) — shrink logo + fade subtext
    useEffect(() => {
        if (!isHome || !mobileLogoRef.current) return;
        const trigger = ScrollTrigger.create({
            start: 'top top',
            end: 80,
            onUpdate: (self) => {
                const p = self.progress;
                const scale = 1 - (p * 0.25);
                gsap.set(mobileLogoRef.current, { scale, transformOrigin: 'center center' });
                if (mobileSubRef.current) {
                    const subOpacity = 1 - (p * 2.5);
                    gsap.set(mobileSubRef.current, { opacity: Math.max(0, subOpacity), height: Math.max(0, (1 - p) * 14) });
                }
            }
        });
        return () => trigger.kill();
    }, [isHome]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Каталог', path: '/catalog' },
        { name: 'Этапы работы', path: '/workflow' },
        { name: 'Бизнесу', path: '/b2b' },
        { name: 'О нас', path: '/about' },
        { name: 'Блог', path: '/blog' },
    ];

    return (
        <>
            {/* ═══ DESKTOP HEADER ═══ */}
            <header
                ref={headerRef}
                className="fixed top-0 left-0 w-full z-50 hidden md:flex px-8 lg:px-12 py-4 justify-between items-center transition-colors duration-300 bg-background/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
            >
                {/* Logo Section - Shrinks on scroll */}
                <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="relative z-50 group origin-left">
                    <div ref={logoTextRef} className="text-5xl font-serif font-light tracking-tight text-primary nowrap whitespace-nowrap">
                        LUMERA
                    </div>
                    <div ref={subTextRef} className="text-xs font-sans tracking-[0.4em] uppercase opacity-60 text-primary overflow-hidden pl-1">
                        Home Atelier
                    </div>
                </Link>

                {/* Center Nav - Gallery Style Links */}
                <nav ref={navRef} className="flex items-center gap-8 lg:gap-12">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={(e) => handleNavClick(e, link.path)}
                            className={`text-xs font-sans tracking-[0.2em] uppercase relative group py-2
                  ${location.pathname === link.path ? 'text-primary opacity-100' : 'text-primary opacity-60 hover:opacity-100'}`}
                        >
                            {link.name}
                            <span className={`absolute bottom-0 left-0 h-[1px] bg-accent transition-all duration-300
                  ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Right - Theme Toggle */}
                <div className="flex items-center">
                    <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
                </div>
            </header>

            {/* ═══ MOBILE HEADER — Native app style ═══ */}
            <header className="fixed top-0 left-0 w-full z-50 md:hidden bg-background/95 backdrop-blur-xl border-b border-primary/5">
                <div className="flex items-center justify-between h-12 px-4">
                    {/* Left slot: Back button or spacer */}
                    <div className="w-10 flex items-center justify-start">
                        {showMobileBackButton ? (
                            <button
                                onClick={() => navigate(-1)}
                                aria-label="Назад"
                                className="w-9 h-9 flex items-center justify-center -ml-1 text-primary active:scale-90 transition-transform duration-150"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                        ) : (
                            <div className="w-9" />
                        )}
                    </div>

                    {/* Center: Full logo on home, page title elsewhere */}
                    <div className="flex-1 flex items-center justify-center min-w-0">
                        {isHome ? (
                            <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="text-center flex flex-col items-center">
                                <span ref={mobileLogoRef} className="text-lg font-serif font-light tracking-tight text-primary inline-block leading-none">LUMERA</span>
                                <span ref={mobileSubRef} className="text-[7px] font-sans tracking-[0.35em] uppercase opacity-50 text-primary overflow-hidden leading-none mt-0.5">Home Atelier</span>
                            </Link>
                        ) : (
                            <span className="text-sm font-sans font-medium text-primary truncate tracking-wide">
                                {mobileTitle || (isBlogPost ? 'Статья' : '')}
                            </span>
                        )}
                    </div>

                    {/* Right slot: Theme toggle */}
                    <div className="w-10 flex items-center justify-end">
                        <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} className="scale-[0.85] origin-right" />
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
