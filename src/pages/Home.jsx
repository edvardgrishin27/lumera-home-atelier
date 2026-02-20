import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';

const Home = () => {
    const containerRef = useRef(null);
    const heroImgRef = useRef(null);
    const { content } = useContent();
    const products = content.products;
    const home = content.home;

    // Get exactly 9 products for 3 rows x 3 columns
    const hitProducts = [...products, ...products.slice(0, Math.max(0, 9 - products.length))].slice(0, 9);



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

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="w-full bg-background overflow-hidden bg-noise">

            {/* Hero Section */}
            <section className="hero-container content-layer relative h-[100vh] w-full bg-background flex flex-col justify-center px-8 md:px-20 pt-20">
                <div className="z-10 mix-blend-exclusion text-white md:mix-blend-normal md:text-primary relative max-w-[90vw] pointer-events-none">
                    <h1 className="text-[13vw] leading-[0.85] font-serif font-thin tracking-tightest overflow-hidden">
                        <span className="block hero-word">{home.heroTitle1}</span>
                        <span className="block hero-word ml-[10vw] italic text-accent">{home.heroTitle2}</span>
                        <span className="block hero-word">{home.heroTitle3}</span>
                    </h1>
                </div>
                <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0 overflow-hidden">
                    <img ref={heroImgRef} src={home.heroImage} alt="Hero Interior" className="w-full h-[120%] object-cover -mt-[10%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-10" />
                    <div className="absolute inset-0 bg-black/5 md:bg-transparent z-10 mix-blend-multiply" />
                </div>

                {/* Description Text - Moved down to avoid overlapping the massive H1 */}
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

                    <Link to="/catalog" className="flex items-center gap-4 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-2 pr-4 transition-all hover:bg-primary/5">
                        <span className="text-xs uppercase tracking-[0.2em] group-hover:opacity-100 opacity-60 transition-opacity">{home.hitsLink || 'Перейти в каталог'}</span>
                        <div className="w-10 h-10 border border-primary/30 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300 ease-spring">
                            →
                        </div>
                    </Link>
                </div>

                {/* Grid Container 3 cols x infinite rows */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 px-6 md:px-20">
                    {hitProducts.map((product, idx) => (
                        <Link
                            key={idx}
                            to={`/product/${product.id}`}
                            className="hit-card opacity-0 translate-y-10 group cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl transition-all duration-500 ease-spring hover:-translate-y-2"
                        >
                            {/* Image Container with Layered Shadow */}
                            <div className="aspect-[4/5] overflow-hidden mb-6 bg-surface relative rounded-xl shadow-elevated group-hover:shadow-floating transition-shadow duration-500">
                                <img
                                    src={product.image}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-105"
                                    alt={product.name}
                                />
                                {/* Cinematic Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply" />

                                {/* Quick View Tag */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-spring transform translate-y-4 group-hover:translate-y-0">
                                    <div className="bg-surface/95 backdrop-blur-sm px-6 py-2 text-[10px] uppercase tracking-widest text-primary rounded-full shadow-lg whitespace-nowrap border border-primary/10">
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

            {/* Philosophy Quote */}
            <section className="py-40 px-6 md:px-20 text-center bg-background relative z-10 content-layer border-t border-primary/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-primary/10"></div>
                <p
                    className="font-serif text-3xl md:text-5xl leading-relaxed max-w-4xl mx-auto text-primary whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                        __html: (home.quoteText || 'Мебель не должна доминировать над пространством.\nОна должна создавать тишину, в которой слышен голос вашей жизни.').replace(/тишину/g, '<span class="text-accent italic px-1">тишину</span>')
                    }}
                />
            </section>

        </div>
    );
};

export default Home;
