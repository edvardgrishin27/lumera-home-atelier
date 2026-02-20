import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const NotFound = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Staggered entrance
            gsap.fromTo('.nf-reveal',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
            );

            // Floating 404 number — subtle drift
            gsap.to('.nf-float', {
                y: -8,
                duration: 3,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });

            // Gold accent line drawing in
            gsap.fromTo('.nf-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 1.2, ease: 'power3.inOut', delay: 0.8 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background bg-noise flex items-center justify-center px-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle radial gradient for depth */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-[120px]" />
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.02] rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="content-layer text-center max-w-2xl mx-auto relative z-10">
                {/* Big 404 number */}
                <div className="nf-reveal nf-float relative mb-8">
                    <h1 className="text-[clamp(8rem,25vw,14rem)] leading-none font-serif font-thin text-primary/[0.06] select-none tracking-tightest">
                        404
                    </h1>
                    {/* Gold accent overlay on the numbers */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[clamp(2rem,5vw,3.5rem)] font-serif font-thin text-accent/40 tracking-[0.3em] uppercase">
                            Error
                        </span>
                    </div>
                </div>

                {/* Gold divider line */}
                <div className="nf-line origin-center mb-10 mx-auto w-24 h-[1px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                {/* Main message */}
                <p className="nf-reveal text-[10px] uppercase tracking-[0.3em] text-secondary mb-6">
                    Страница не найдена
                </p>

                <h2 className="nf-reveal text-2xl md:text-4xl font-serif text-primary mb-4 leading-tight tracking-tight">
                    Эта страница переехала<br className="hidden md:block" /> или не существует
                </h2>

                <p className="nf-reveal text-sm text-secondary/80 font-serif leading-relaxed max-w-md mx-auto mb-12">
                    Но мы можем помочь найти то, что вы ищете.
                    Начните с главной страницы.
                </p>

                {/* CTA Buttons */}
                <div className="nf-reveal flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] transition-all duration-500 ease-spring shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        На главную
                    </Link>

                    <Link
                        to="/catalog"
                        className="inline-flex items-center gap-3 bg-transparent text-primary px-8 py-4 rounded-full text-xs uppercase tracking-[0.2em] border border-primary/30 hover:border-accent hover:text-accent transition-all duration-500 ease-spring hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                        Каталог
                    </Link>
                </div>

                {/* Decorative bottom tag */}
                <div className="nf-reveal mt-20">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-primary/20 font-sans">
                        Lumera Home Atelier
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
