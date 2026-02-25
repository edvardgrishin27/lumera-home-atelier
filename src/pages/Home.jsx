import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const StarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 0L11.0206 6.97937L18 9L11.0206 11.0206L9 18L6.97937 11.0206L0 9L6.97937 6.97937L9 0Z" />
    </svg>
);

const Home = () => {
    const containerRef = useRef(null);
    const heroImgRef = useRef(null);
    const { content } = useContent();
    const products = content.products;
    const home = content.home;

    // Get exactly 9 products for 3 rows x 3 columns
    const hitProducts = [...products, ...products.slice(0, Math.max(0, 9 - products.length))].slice(0, 9);

    const reviews = home.reviews || [];
    const whyItems = home.whyItems || [];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Intro Animation
            const tl = gsap.timeline();
            tl.from('.hero-word', {
                y: 150,
                opacity: 0,
                duration: 1.5,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.2
            })
                .from('.hero-desc', {
                    opacity: 0,
                    y: 20,
                    duration: 1,
                    ease: 'power2.out'
                }, '-=1');

            // Parallax
            gsap.to(heroImgRef.current, {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero-container',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // Grid Reveal Animation
            ScrollTrigger.batch('.hit-card', {
                onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, overwrite: true }),
                start: "top 85%"
            });

            // Reviews Section Animations
            ScrollTrigger.batch('.review-card', {
                onEnter: batch => gsap.fromTo(batch,
                    { opacity: 0, y: 60 },
                    { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', overwrite: true }
                ),
                start: "top 88%"
            });

            // Why Section Animations
            ScrollTrigger.batch('.why-item', {
                onEnter: batch => gsap.fromTo(batch,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', overwrite: true }
                ),
                start: "top 88%"
            });

            // Section titles reveal
            gsap.utils.toArray('.section-reveal').forEach((el) => {
                gsap.fromTo(el,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Build aggregate review schema for SEO
    const reviewSchemas = reviews.length > 0 ? [{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Lumera Home Atelier",
        "url": "https://lumerahome.ru",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": String(reviews.length),
            "reviewCount": String(reviews.length)
        },
        "review": reviews.map(r => ({
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": r.name
            },
            "datePublished": "2026-01-15",
            "reviewBody": r.text,
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": String(r.rating),
                "bestRating": "5"
            }
        }))
    }] : [];

    /* Quote HTML with accent styling on the word "тишину".
       Safe: content comes from defaultContent in ContentContext (trusted CMS defaults),
       not from untrusted user input. No sanitization needed. */
    const quoteHtml = (home.quoteText || 'Мебель не должна доминировать над пространством.\nОна должна создавать тишину, в которой слышен голос вашей жизни.').replace(/тишину/g, '<span class="text-accent italic px-1">тишину</span>');

    return (
        <div ref={containerRef} className="w-full bg-background overflow-hidden">
            <SEO
                title="Мебель из Китая под заказ — дизайнерские диваны, кресла, столы"
                description="Lumera Home Atelier — премиальная мебель из Китая с доставкой по России. Дизайнерские диваны, кресла, столы, кровати от ведущих фабрик. Каталог с ценами."
                url="/"
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Lumera Home Atelier",
                        "url": "https://lumerahome.ru",
                        "description": "Дизайнерская мебель из Китая под заказ — диваны, кресла, столы, кровати с доставкой по России",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://lumerahome.ru/catalog?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FurnitureStore",
                        "name": "Lumera Home Atelier",
                        "url": "https://lumerahome.ru",
                        "telephone": "8 (499) 877-16-78",
                        "email": "info@lumerahome.ru",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Москва",
                            "addressCountry": "RU"
                        },
                        "priceRange": "₽₽₽",
                        "sameAs": ["https://t.me/lumera"]
                    },
                    ...reviewSchemas
                ]}
            />

            {/* Hero Section */}
            <section className="hero-container content-layer relative h-[100vh] w-full bg-background flex flex-col justify-center px-8 md:px-20 pt-32 md:pt-40">
                <div className="z-10 mix-blend-exclusion text-white md:mix-blend-normal md:text-primary relative max-w-[90vw] pointer-events-none">
                    <h1 className="text-[13vw] leading-[0.85] font-serif font-thin tracking-tightest overflow-hidden">
                        <span className="block hero-word">{home.heroTitle1}</span>
                        <span className="block hero-word ml-[10vw] italic text-accent">{home.heroTitle2}</span>
                        <span className="block hero-word">{home.heroTitle3}</span>
                    </h1>
                </div>
                <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0 overflow-hidden">
                    <img ref={heroImgRef} src={home.heroImage} alt="Дизайнерская мебель из Китая — интерьер гостиной Lumera Home Atelier" className="w-full h-[120%] object-cover -mt-[10%]" loading="eager" fetchPriority="high" decoding="async" width="1200" height="800" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-10" />
                    <div className="absolute inset-0 bg-black/5 md:bg-transparent z-10 mix-blend-multiply" />
                </div>

                {/* Description Text */}
                <div className="relative z-20 hero-desc max-w-sm mt-12 md:mt-24">
                    <div className="text-xl md:text-2xl font-serif leading-relaxed opacity-70 mix-blend-difference text-white md:mix-blend-normal md:text-primary">
                        {home.heroDescription}
                    </div>
                </div>
            </section>

            {/* Hit Sales Section - 3x3 Grid */}
            <section className="py-32 bg-surface min-h-[80vh] relative z-10">
                <div className="px-6 md:px-20 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
                    <h2 className="text-5xl md:text-6xl font-serif font-light text-primary tracking-tight">{home.hitsTitle || 'Хиты продаж'}</h2>

                    <Link to="/catalog" className="flex items-center gap-4 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2 pr-4 transition-opacity duration-300 hover:opacity-100 opacity-80">
                        <span className="text-xs uppercase tracking-[0.2em] group-hover:opacity-100 opacity-60 transition-opacity duration-300">{home.hitsLink || 'Перейти в каталог'}</span>
                        <div className="w-10 h-10 border border-primary/30 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors duration-300 ease-spring">
                            →
                        </div>
                    </Link>
                </div>

                {/* Grid Container 3 cols x infinite rows */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 px-6 md:px-20">
                    {hitProducts.map((product, idx) => (
                        <Link
                            key={idx}
                            to={`/product/${product.slug}`}
                            className="hit-card opacity-0 translate-y-10 group cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl transition-shadow duration-500 ease-spring"
                        >
                            {/* Image Container with Layered Shadow */}
                            <div className="aspect-[4/5] overflow-hidden mb-6 bg-surface relative rounded-xl shadow-elevated group-hover:shadow-floating transition-shadow duration-500">
                                <img
                                    src={product.image}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-105"
                                    alt={product.name}
                                    loading="lazy"
                                    decoding="async"
                                    width="600"
                                    height="750"
                                />
                                {/* Cinematic Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Quick View Tag */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-spring transform translate-y-4 group-hover:translate-y-0">
                                    <div className="bg-accent/90 backdrop-blur-sm px-6 py-2 text-[10px] uppercase tracking-widest text-white rounded-full shadow-[0_4px_15px_rgba(196,162,101,0.4)] whitespace-nowrap">
                                        {home.productView || 'Подробнее'}
                                    </div>
                                </div>
                            </div>

                            {/* Info Below */}
                            <div className="flex justify-between items-start px-2">
                                <div>
                                    <h3 className="text-xl font-serif text-primary group-hover:text-accent transition-colors duration-300 mb-1">{product.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-secondary">{product.category}</p>
                                </div>
                                <span className="text-sm font-serif text-primary opacity-80 whitespace-nowrap">{product.price.toLocaleString()} ₽</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Philosophy Quote — uses dangerouslySetInnerHTML for accent styling.
                Content source: trusted defaultContent in ContentContext.jsx, not user input. */}
            <section className="py-40 px-6 md:px-20 text-center bg-background relative z-10 content-layer">
                <p
                    className="font-serif text-3xl md:text-5xl leading-relaxed max-w-4xl mx-auto text-primary whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: quoteHtml }} // eslint-disable-line react/no-danger
                />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                TESTIMONIALS SECTION — Dark surface, 3 review cards
            ═══════════════════════════════════════════════════════════════ */}
            {reviews.length > 0 && (
                <section className="relative z-10 py-28 md:py-36 bg-[#0e0e0e] overflow-hidden">
                    {/* Subtle grain texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }} />

                    <div className="px-6 md:px-20 relative">
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-20 section-reveal">
                            <h2 className="text-5xl md:text-7xl font-serif font-thin text-white/95 tracking-tightest leading-[0.9]">
                                {home.reviewsTitle || 'Отзывы клиентов'}
                            </h2>

                            <Link
                                to="/reviews"
                                className="flex items-center gap-4 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2 pr-4 transition-opacity duration-300 hover:opacity-100 opacity-70 shrink-0"
                            >
                                <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 group-hover:text-white/80 transition-colors duration-300">
                                    {home.reviewsLink || 'Все отзывы'}
                                </span>
                                <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors duration-300 ease-spring text-white/60">
                                    →
                                </div>
                            </Link>
                        </div>

                        {/* Reviews Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="review-card group relative border border-white/[0.08] rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[340px] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14] transition-colors duration-500"
                                >
                                    {/* Stars */}
                                    <div>
                                        <div className="flex gap-1.5 mb-8">
                                            {Array.from({ length: review.rating }).map((_, i) => (
                                                <span key={i} className="text-accent">
                                                    <StarIcon />
                                                </span>
                                            ))}
                                        </div>

                                        {/* Review Text */}
                                        <p className="font-serif text-lg md:text-xl leading-relaxed text-white/70 italic">
                                            &ldquo;{review.text}&rdquo;
                                        </p>
                                    </div>

                                    {/* Author */}
                                    <div className="flex items-center gap-4 mt-10 pt-8 border-t border-white/[0.06]">
                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-sans font-medium shrink-0">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block text-sm text-white/90 font-sans">{review.name}</span>
                                            <span className="block text-xs text-white/35 font-sans mt-0.5">{review.date}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                WHY CHOOSE US SECTION — Dark continuation, 4-column grid
            ═══════════════════════════════════════════════════════════════ */}
            {whyItems.length > 0 && (
                <section className="relative z-10 py-28 md:py-36 bg-[#0e0e0e] overflow-hidden border-t border-white/[0.04]">
                    {/* Subtle grain texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }} />

                    <div className="px-6 md:px-20 relative">
                        {/* Section Title */}
                        <div className="mb-20 md:mb-28 section-reveal">
                            <h2 className="text-5xl md:text-7xl font-serif font-thin text-white/95 tracking-tightest leading-[0.9]">
                                {home.whyTitle || 'Почему Lumera'}
                            </h2>
                        </div>

                        {/* 4-Column Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
                            {whyItems.map((item, idx) => (
                                <div key={idx} className="why-item">
                                    {/* Number */}
                                    <span className="block text-accent text-sm font-sans tracking-widest mb-4 opacity-80">
                                        {item.number}
                                    </span>

                                    {/* Title */}
                                    <h3 className="text-xl md:text-2xl font-serif font-light text-white/95 mb-5 leading-snug">
                                        {item.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm font-sans text-white/45 leading-relaxed max-w-xs">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
};

export default Home;
