import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import OrderModal from '../components/OrderModal';
import RequestModal from '../components/RequestModal';

gsap.registerPlugin(ScrollTrigger);

/* ─── Fullscreen Lightbox with smooth animation ─── */
const Lightbox = ({ images, activeIndex, onClose, onPrev, onNext, productName }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [animState, setAnimState] = useState('entering'); // entering | open | leaving
    const [imgTransition, setImgTransition] = useState(false);

    // Entrance animation
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setAnimState('open'));
        });
    }, []);

    // Close with animation
    const handleClose = useCallback(() => {
        setAnimState('leaving');
        setTimeout(onClose, 400);
    }, [onClose]);

    // Image transition on index change
    useEffect(() => {
        setImgTransition(true);
        const t = setTimeout(() => setImgTransition(false), 50);
        return () => clearTimeout(t);
    }, [activeIndex]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [handleClose, onPrev, onNext]);

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? onNext() : onPrev();
        }
        setTouchStart(null);
    };

    const isVideo = (url) => url && url.match(/\.(mp4|webm|ogg)$/i);
    const isOpen = animState === 'open';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop — smooth fade */}
            <div
                className={`absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-400 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDuration: '400ms' }}
                onClick={handleClose}
            />

            {/* Close button */}
            <button
                onClick={handleClose}
                aria-label="Закрыть просмотр"
                className={`absolute top-6 right-6 z-[102] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Counter */}
            <div className={`absolute top-7 left-1/2 -translate-x-1/2 z-[102] text-white/60 text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                style={{ transitionDelay: isOpen ? '250ms' : '0ms' }}>
                {activeIndex + 1} / {images.length}
            </div>

            {/* Prev Arrow */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    aria-label="Предыдущее фото"
                    className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[102] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}

            {/* Next Arrow */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    aria-label="Следующее фото"
                    className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[102] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                    style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            )}

            {/* Image — smooth scale + fade entrance */}
            <div
                className={`relative z-[101] w-full h-full flex items-center justify-center p-16 md:p-24 transition-all duration-500 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleClose}
            >
                <div className={`transition-opacity duration-300 ${imgTransition ? 'opacity-0' : 'opacity-100'}`}>
                    {isVideo(images[activeIndex]) ? (
                        <video
                            src={images[activeIndex]}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            autoPlay muted loop playsInline
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <img
                            src={images[activeIndex]}
                            alt={`${productName} — фото ${activeIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg select-none"
                            draggable={false}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
            </div>

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[102] flex gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}>
                    {images.map((_, i) => (
                        <button
                            key={i}
                            aria-label={`Фото ${i + 1}`}
                            onClick={(e) => { e.stopPropagation(); }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Sticky Product Bar (appears BELOW the main header) ─── */
const StickyProductBar = ({ product, visible, onOrder }) => {
    const [topPx, setTopPx] = useState(0);
    useEffect(() => {
        const measure = () => {
            const header = document.querySelector('header');
            if (header) {
                // Use Math.ceil to avoid sub-pixel gaps on retina/mobile screens
                setTopPx(Math.ceil(header.getBoundingClientRect().bottom));
            }
        };
        measure();
        window.addEventListener('resize', measure);
        window.addEventListener('scroll', measure, { passive: true });
        return () => {
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure);
        };
    }, []);

    return (
    <div
        className={`fixed left-0 w-full z-[51] transition-opacity duration-500 ease-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ top: `${topPx}px` }}
    >
        {/* Top accent separator */}
        <div className="h-px w-full bg-accent/30" />
        <div className="bg-surface/95 backdrop-blur-md border-b border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:bg-[rgba(38,38,38,0.98)] dark:border-[rgba(255,255,255,0.08)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-3.5 flex items-center justify-between gap-4">
                {/* Left: product image + name + price */}
                <div className="flex items-center gap-4 min-w-0">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-elevated"
                        width="48"
                        height="48"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-serif text-primary truncate leading-tight">{product.name}</p>
                        <p className="text-base font-serif text-accent font-medium">Цена по запросу</p>
                    </div>
                </div>

                {/* Right: CTA */}
                <button
                    onClick={onOrder}
                    className="flex-shrink-0 px-7 py-3 bg-accent text-white text-[10px] uppercase tracking-[0.15em] rounded-full hover:bg-accent/80 transition-transform duration-300 ease-out shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_20px_rgba(196,162,101,0.5)] hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                >
                    Оставить заявку
                </button>
            </div>
        </div>
    </div>
    );
};

const ProductDetail = () => {
    const { slug } = useParams();
    const { content } = useContent();
    const products = content.products;
    const product = products.find(p => p.slug === slug) || products[0];
    const containerRef = useRef(null);
    const ctaRef = useRef(null);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const colors = product?.colors || [];
    const sizes = product?.sizes || [];

    const gallery = product?.gallery || [product?.image, product?.image, product?.image, product?.image];

    const isVideo = (url) => url && url.match(/\.(mp4|webm|ogg)$/i);

    // Lightbox handlers
    const openLightbox = useCallback((idx) => {
        setLightboxIndex(idx);
        setLightboxOpen(true);
    }, []);
    const closeLightbox = useCallback(() => setLightboxOpen(false), []);
    const prevLightbox = useCallback(() => {
        setLightboxIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
    }, [gallery.length]);
    const nextLightbox = useCallback(() => {
        setLightboxIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
    }, [gallery.length]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );

            gsap.utils.toArray('.parallax-media').forEach((media) => {
                gsap.to(media, {
                    yPercent: 20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: media.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });

        }, containerRef);

        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return () => ctx.revert();
    }, [slug]);

    // Sticky bar: show only when CTA is fully scrolled above viewport
    useEffect(() => {
        if (!ctaRef.current) return;

        let ticking = false;
        const checkCTA = () => {
            if (!ctaRef.current) return;
            const rect = ctaRef.current.getBoundingClientRect();
            // Show bar only when the bottom of CTA is above the header area (scrolled past)
            const shouldShow = rect.bottom < 0;
            setShowStickyBar(shouldShow);
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(checkCTA);
            }
        };

        // Initial check after layout settles (don't show on load)
        const timer = setTimeout(() => {
            window.addEventListener('scroll', onScroll, { passive: true });
        }, 600);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', onScroll);
        };
    }, [slug]);

    if (!product) return <div className="pt-40 text-center">Загрузка...</div>;

    return (
        <div ref={containerRef} className="bg-background min-h-screen">
            <SEO
                title={`${product.name} — купить из Китая с доставкой | Lumera Home Atelier`}
                description={`${product.name} — купить в Lumera Home Atelier. ${product.category === 'Sofas' ? 'Дизайнерский диван' : product.category === 'Armchairs' ? 'Дизайнерское кресло' : product.category === 'Tables' ? 'Дизайнерский стол' : 'Мебель'} из Китая под заказ. Цена по запросу. Доставка по России от 45 дней.`}
                image={product.image}
                url={`/product/${product.slug}`}
                type="product"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Каталог', url: '/catalog' },
                    { name: product.name },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description,
                    "image": product.gallery || [product.image],
                    "url": `https://lumerahome.ru/product/${product.slug}`,
                    "brand": { "@type": "Brand", "name": "Lumera Home Atelier" },
                    "category": product.category,
                    "offers": {
                        "@type": "Offer",
                        "availability": "https://schema.org/InStock",
                        "seller": {
                            "@type": "Organization",
                            "name": "Lumera Home Atelier"
                        },
                        "url": `https://lumerahome.ru/product/${product.slug}`
                    }
                }}
            />

            {/* Sticky Product Bar */}
            <StickyProductBar
                product={product}
                visible={showStickyBar}
                onOrder={() => setIsOrderOpen(true)}
            />

            {/* Top Section */}
            <div className="pt-32 pb-8 px-6 md:px-12 max-w-[1600px] mx-auto content-layer">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* Left: Gallery — more compact */}
                    <div className="lg:col-span-7 reveal">
                        <div
                            className="aspect-[4/3] bg-surface mb-3 overflow-hidden relative group cursor-zoom-in rounded-2xl shadow-elevated"
                            onClick={() => openLightbox(activeImage)}
                        >
                            {isVideo(gallery[activeImage]) ? (
                                <video
                                    src={gallery[activeImage]}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={gallery[activeImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-spring group-hover:scale-105"
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    width="1000"
                                    height="750"
                                />
                            )}
                            {/* Hover overlay with zoom icon */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-end justify-center pb-6">
                                <span className="text-white/80 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                    </svg>
                                    Увеличить
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {gallery.map((media, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    aria-label={`Просмотр медиа ${idx + 1}`}
                                    className={`aspect-square bg-surface cursor-pointer rounded-xl overflow-hidden relative transition-all duration-500 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary block border-none ${activeImage === idx ? 'ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-md' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                >
                                    {isVideo(media) ? (
                                        <div className="w-full h-full relative">
                                            <video src={media} className="w-full h-full object-cover" muted playsInline />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={media} className="w-full h-full object-cover" alt={`${product.name} — фото ${idx + 1}`} loading="lazy" decoding="async" width="250" height="250" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Sticky Info — reorganized order */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-32 reveal">
                            {/* Title + Price */}
                            <div className="border-b border-primary/10 pb-6 mb-6">
                                <h1 className="text-4xl md:text-5xl font-serif mb-3 leading-tight tracking-tightest text-primary">{product.name}</h1>
                                <p className="text-xs uppercase tracking-[0.2em] text-secondary mb-4">{product.category}</p>
                                <p className="text-2xl font-serif text-accent">Цена по запросу</p>
                            </div>

                            {/* 3. Characteristics */}
                            {Array.isArray(product.details) && product.details.length > 0 && (
                                <div className="space-y-3 pb-6 mb-6 border-b border-primary/5">
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-secondary">Характеристики</div>
                                    {product.details.map((detail, i) => (
                                        <div key={i} className="flex justify-between items-baseline gap-4">
                                            <span className="text-[10px] uppercase tracking-[0.15em] text-secondary">{detail.label}</span>
                                            <span className="font-serif text-primary text-right">{detail.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Specs (краткие размеры) */}
                            {product.specs && (
                                <div className="pb-6 mb-6 border-b border-primary/5">
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-2">Размеры</div>
                                    <span className="font-serif text-primary">{product.specs}</span>
                                </div>
                            )}

                            {/* Description */}
                            <p className="text-base leading-relaxed opacity-80 font-serif text-primary mb-8">
                                {product.description}
                            </p>

                            {/* CTA Button */}
                            <div ref={ctaRef}>
                                <button
                                    onClick={() => setIsOrderOpen(true)}
                                    className="w-full bg-accent text-white py-5 text-xs uppercase tracking-[0.2em] rounded-full hover:bg-accent/80 transition-transform duration-500 ease-spring text-center shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                                >
                                    Оставить заявку
                                </button>
                            </div>

                            <p className="text-[10px] text-center text-secondary uppercase tracking-[0.2em] mt-4">
                                Индивидуальное изготовление от 45 дней
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Mood — minimal gap */}
            <div className="w-full bg-surface py-10 lg:py-16">
                <div className="px-6 md:px-12 mb-10 text-center reveal">
                    <span className="text-xs uppercase tracking-[0.3em] text-accent block mb-3">Mood</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-thin">В интерьере</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8">

                    {product.video && (
                        <div className="md:col-span-2 aspect-video overflow-hidden relative reveal group">
                            <video
                                className="w-full h-full object-cover parallax-media scale-110"
                                autoPlay
                                loop
                                muted
                                playsInline
                                poster={product.image}
                            >
                                <source src={product.video} type="video/mp4" />
                            </video>
                            <div className="absolute bottom-8 left-8 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-xs uppercase tracking-widest">Live View</p>
                            </div>
                        </div>
                    )}

                    <div className="aspect-[3/4] overflow-hidden reveal">
                        <img src={gallery[1] || product.image} className="w-full h-full object-cover parallax-media scale-110" alt={`${product.name} — вид сбоку`} loading="lazy" decoding="async" width="800" height="1067" />
                    </div>

                    <div className="aspect-[3/4] bg-background p-12 flex flex-col justify-center items-center text-center reveal">
                        <h3 className="text-3xl font-serif mb-4 italic">"{content.catalog?.interiorQuote || 'Детали создают совершенство'}"</h3>
                        <p className="opacity-50 text-sm max-w-xs">{content.catalog?.interiorSubtext || 'Каждый шов, каждый изгиб выверен с точностью до миллиметра.'}</p>
                    </div>

                    <div className="aspect-square md:aspect-[4/3] overflow-hidden md:col-span-2 reveal">
                        <img src={gallery[2] || product.image} className="w-full h-full object-cover parallax-media scale-110" alt={`${product.name} — детали и текстура`} loading="lazy" decoding="async" width="1200" height="900" />
                    </div>

                </div>
            </div>

            {/* ═══ CTA: Не нашли что искали? ═══ */}
            <section className="w-full bg-background py-12 md:py-20 pb-28 md:pb-20">
                <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
                    <div className="relative bg-surface rounded-3xl p-8 md:p-16 overflow-hidden">
                        <div className="w-10 h-px bg-accent mx-auto mb-6 md:mb-8" />
                        <h2 className="text-3xl md:text-5xl font-serif font-light text-primary mb-4 md:mb-6 tracking-tight">
                            Не нашли что искали?
                        </h2>
                        <p className="text-secondary font-sans text-sm md:text-lg leading-relaxed max-w-xl mx-auto mb-8 md:mb-12">
                            У&nbsp;нас миллионы товаров доступны под заказ&nbsp;— просто напишите нам,
                            и&nbsp;мы подберём именно то, что вам нужно
                        </p>
                        <button
                            onClick={() => setIsRequestOpen(true)}
                            className="inline-flex items-center gap-3 bg-accent hover:bg-accent/85 active:scale-95 text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-xs uppercase tracking-[0.18em] shadow-[0_4px_20px_rgba(196,162,101,0.3)] hover:shadow-[0_0_30px_rgba(196,162,101,0.5)] hover:-translate-y-0.5 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent cursor-pointer"
                        >
                            Оставить заявку
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>
            </section>

            <RequestModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />

            {/* Lightbox */}
            {lightboxOpen && (
                <Lightbox
                    images={gallery}
                    activeIndex={lightboxIndex}
                    onClose={closeLightbox}
                    onPrev={prevLightbox}
                    onNext={nextLightbox}
                    productName={product.name}
                />
            )}

            <OrderModal
                isOpen={isOrderOpen}
                onClose={() => setIsOrderOpen(false)}
                product={product}
            />
        </div>
    );
};

export default ProductDetail;
