import { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from './components/Header';
import Footer from './components/Footer';
import CustomCursor from './components/Cursor';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const B2B = lazy(() => import('./pages/B2B'));
const Admin = lazy(() => import('./pages/admin/index'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const Request = lazy(() => import('./pages/Request'));
const Login = lazy(() => import('./pages/Login'));
const Delivery = lazy(() => import('./pages/Delivery'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Workflow = lazy(() => import('./pages/Workflow'));
const Returns = lazy(() => import('./pages/Returns'));
const Guarantee = lazy(() => import('./pages/Guarantee'));
const NotFound = lazy(() => import('./pages/NotFound'));

gsap.registerPlugin(ScrollTrigger);

function App() {
    const location = useLocation();
    const lenisRef = useRef(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        lenis.on('scroll', ScrollTrigger.update);

        const tickerCallback = (time) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);
        gsap.ticker.lagSmoothing(0);

        window.scrollTo(0, 0);

        // Listen for scrollToTop events from Header nav clicks
        const handleScrollToTop = (event) => {
            if (lenisRef.current) {
                const isSmooth = event?.detail?.smooth;
                if (isSmooth) {
                    // Premium smooth scroll — elegant animation when clicking current page link
                    lenisRef.current.scrollTo(0, {
                        duration: 1.8,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    });
                } else {
                    lenisRef.current.scrollTo(0, { immediate: true });
                }
            }
        };
        window.addEventListener('scrollToTop', handleScrollToTop);

        return () => {
            window.removeEventListener('scrollToTop', handleScrollToTop);
            gsap.ticker.remove(tickerCallback);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Scroll to top on every route change — reset both Lenis and native scroll
    useEffect(() => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Yandex.Metrika SPA page hit tracking
        if (typeof window.ym === 'function') {
            window.ym(106984679, 'hit', window.location.href);
        }
    }, [location.pathname]);

    // Hide Header/Footer/Cursor on admin panel pages
    const isSpecialPage = location.pathname.startsWith('/panel/');

    return (
        <div className="antialiased text-primary bg-background min-h-screen relative selection:bg-accent selection:text-white">
            {!isSpecialPage && <CustomCursor />}
            {!isSpecialPage && <Header />}
            <main>
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/b2b" element={<B2B />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/request" element={<Request />} />
                        <Route path="/delivery" element={<Delivery />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/workflow" element={<Workflow />} />
                        <Route path="/returns" element={<Returns />} />
                        <Route path="/guarantee" element={<Guarantee />} />

                        {/* Hidden admin panel — accessible only via secret UUID */}
                        <Route path="/panel/:uuid/login" element={<Login />} />
                        <Route path="/panel/:uuid/admin" element={<Admin />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
            {!isSpecialPage && <Footer />}
        </div>
    );
}

export default App;
