import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Smooth scroll to top — dispatches event for Lenis to animate elegantly
const scrollToTopSmooth = () => {
    window.dispatchEvent(new CustomEvent('scrollToTop', { detail: { smooth: true } }));
};

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const headerRef = useRef(null);
    const logoTextRef = useRef(null);
    const subTextRef = useRef(null);
    const navRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <header
            ref={headerRef}
            className="fixed top-0 left-0 w-full z-50 px-8 md:px-12 py-4 flex justify-between items-center transition-colors duration-300 bg-background/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        >
            {/* Logo Section - Shrinks on scroll */}
            <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="relative z-50 group origin-left">
                <div ref={logoTextRef} className="text-3xl md:text-5xl font-serif font-light tracking-tight text-primary nowrap whitespace-nowrap">
                    LUMERA
                </div>
                <div ref={subTextRef} className="text-[10px] md:text-xs font-sans tracking-[0.4em] uppercase opacity-60 text-primary overflow-hidden pl-1">
                    Home Atelier
                </div>
            </Link>

            {/* Center Nav - Gallery Style Links */}
            <nav ref={navRef} className="hidden md:flex items-center gap-8 lg:gap-12">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        onClick={(e) => handleNavClick(e, link.path)}
                        className={`text-xs font-sans tracking-[0.2em] uppercase relative group py-2
              ${location.pathname === link.path ? 'text-primary opacity-100' : 'text-primary opacity-60 hover:opacity-100'}`}
                    >
                        {link.name}
                        {/* Active/Hover Underline */}
                        <span className={`absolute bottom-0 left-0 h-[1px] bg-accent transition-all duration-300
              ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}
                        />
                    </Link>
                ))}
            </nav>

            {/* Right - CTA Button & Theme Toggle */}
            <div className="hidden md:flex items-center gap-6">
                <button
                    onClick={toggleTheme}
                    aria-label="Переключить тему"
                    className="text-primary hover:text-accent border border-primary/20 hover:border-accent/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-full p-2.5"
                >
                    {isDarkMode ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
                <Link
                    to="/request"
                    aria-label="Оставить заявку на премиальную мебель"
                    className="px-7 py-3 bg-accent text-white text-[10px] md:text-xs font-sans uppercase tracking-widest transition-all duration-300 ease-out rounded-full shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)] hover:bg-accent/85 hover:-translate-y-1 active:scale-95 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                    onClick={(e) => { setIsMenuOpen(false); handleNavClick(e, '/request'); }}
                >
                    Оставить заявку
                </Link>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-6">
                <button
                    onClick={toggleTheme}
                    aria-label="Переключить тему"
                    className="text-primary hover:text-accent border border-primary/20 hover:border-accent/40 transition-colors duration-300 rounded-full p-2.5"
                >
                    {isDarkMode ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                    aria-expanded={isMenuOpen}
                    className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[7px] -mr-2"
                >
                    <span className={`block w-7 h-[1.5px] bg-primary transition-transform duration-300 ease-out origin-center ${isMenuOpen ? 'translate-y-[4.25px] rotate-45' : ''}`} />
                    <span className={`block w-7 h-[1.5px] bg-primary transition-transform duration-300 ease-out origin-center ${isMenuOpen ? '-translate-y-[4.25px] -rotate-45' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Menu Drawer */}
            <nav
                className={`fixed top-0 right-0 h-[100dvh] w-[min(80vw,320px)] z-40 bg-background shadow-floating pt-28 px-8 pb-10 flex flex-col md:hidden transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                aria-label="Мобильное меню"
            >
                <div className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={(e) => { setIsMenuOpen(false); handleNavClick(e, link.path); }}
                            className={`text-sm font-sans tracking-[0.15em] uppercase py-3.5 border-b border-primary/10 transition-opacity duration-200
                                ${location.pathname === link.path ? 'text-accent opacity-100' : 'text-primary opacity-70 active:opacity-100'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto pt-6">
                    <Link
                        to="/request"
                        onClick={(e) => { setIsMenuOpen(false); handleNavClick(e, '/request'); }}
                        className="block w-full text-center px-7 py-4 bg-accent text-white text-xs font-sans uppercase tracking-widest rounded-full shadow-[0_4px_15px_rgba(196,162,101,0.25)] active:scale-95 transition-transform duration-200"
                    >
                        Оставить заявку
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
