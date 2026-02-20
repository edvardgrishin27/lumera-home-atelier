import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from './components/Header';
import Footer from './components/Footer';
import CustomCursor from './components/Cursor';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import B2B from './pages/B2B';
import Admin from './pages/Admin';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Request from './pages/Request';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

gsap.registerPlugin(ScrollTrigger);

function App() {
    const location = useLocation();

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

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        window.scrollTo(0, 0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, []);

    // Hide Header/Footer/Cursor on admin panel pages
    const isSpecialPage = location.pathname.startsWith('/panel/');

    return (
        <div className="antialiased text-primary bg-background min-h-screen relative selection:bg-accent selection:text-white">
            {!isSpecialPage && <CustomCursor />}
            {!isSpecialPage && <Header />}
            <main>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/b2b" element={<B2B />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/request" element={<Request />} />

                    {/* Hidden admin panel — accessible only via secret UUID */}
                    <Route path="/panel/:uuid/login" element={<Login />} />
                    <Route path="/panel/:uuid/admin" element={<Admin />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            {!isSpecialPage && <Footer />}
        </div>
    );
}

export default App;
