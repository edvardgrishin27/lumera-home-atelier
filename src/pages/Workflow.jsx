import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const stepIcons = [
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="16" cy="10" r="5" />
        <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" />
        <path d="M22 8l4-4m0 0h-4m4 0v4" />
    </svg>,
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="6" y="4" width="20" height="24" rx="2" />
        <path d="M10 10h12M10 14h12M10 18h8" />
        <path d="M18 22l2 2 4-4" />
    </svg>,
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="4" y="8" width="24" height="18" rx="2" />
        <path d="M4 14h24" />
        <circle cx="16" cy="21" r="3" />
        <path d="M12 4h8" />
    </svg>,
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="10" width="18" height="14" rx="1" />
        <path d="M20 14h6l4 6v4h-10" />
        <circle cx="9" cy="26" r="2.5" />
        <circle cx="25" cy="26" r="2.5" />
    </svg>,
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M16 4l3.09 6.26L26 11.27l-5 4.87 1.18 6.86L16 19.77l-6.18 3.23L11 16.14l-5-4.87 6.91-1.01L16 4z" />
    </svg>,
];

const Workflow = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const wf = content.workflow || {};

    const steps = wf.steps || [];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header animation
            gsap.from('.wf-header', {
                opacity: 0,
                y: 60,
                duration: 1.2,
                ease: 'power3.out',
                delay: 0.2,
            });

            // Steps stagger reveal
            ScrollTrigger.batch('.wf-step', {
                onEnter: (batch) =>
                    gsap.fromTo(
                        batch,
                        { opacity: 0, y: 80 },
                        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', overwrite: true }
                    ),
                start: 'top 88%',
            });

            // CTA reveal
            gsap.from('.wf-cta', {
                opacity: 0,
                y: 40,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.wf-cta',
                    start: 'top 88%',
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-background min-h-screen pb-24 md:pb-0">
            <SEO
                title="Этапы работы — как мы работаем | Lumera Home Atelier"
                description="5 прозрачных этапов работы: от консультации до доставки мебели из Китая. Контроль качества на каждом шаге."
                url="/workflow"
            />

            {/* Hero Header */}
            <section className="pt-16 md:pt-48 pb-16 md:pb-24 px-6 md:px-20">
                <div className="wf-header max-w-5xl">
                    <span className="text-accent text-[10px] md:text-xs uppercase tracking-[0.3em] font-sans block mb-6">
                        {wf.label || 'Как мы работаем'}
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-primary leading-[1.05] tracking-tight mb-8">
                        {wf.title || '5 прозрачных этапов'}<br />
                        <span className="text-accent italic">{wf.titleAccent || 'от идеи до интерьера'}</span>
                    </h1>
                    <p className="text-base md:text-lg text-secondary font-sans leading-relaxed max-w-2xl">
                        {wf.description || 'Каждый этап согласовывается с вами. Вы всегда знаете, что происходит с вашим заказом, получаете фотоотчёты и полный контроль на каждом шаге.'}
                    </p>
                </div>
            </section>

            {/* Steps Grid */}
            <section className="px-6 md:px-20 pb-24 md:pb-32">
                <div className="max-w-6xl mx-auto">
                    {steps.map((step, idx) => (
                        <div
                            key={step.number}
                            className={`wf-step flex flex-col md:flex-row gap-8 md:gap-16 py-12 md:py-16 ${
                                idx !== steps.length - 1 ? 'border-b border-primary/8' : ''
                            }`}
                        >
                            {/* Left: Number + Icon */}
                            <div className="md:w-48 shrink-0 flex items-start gap-6">
                                <span className="text-5xl md:text-6xl font-serif font-light text-accent/30 leading-none">
                                    {step.number}
                                </span>
                                <div className="text-accent/60 mt-2">
                                    {stepIcons[idx] || stepIcons[0]}
                                </div>
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-3xl font-serif font-light text-primary mb-4 leading-snug">
                                    {step.title}
                                </h3>
                                <p className="text-sm md:text-base text-secondary font-sans leading-relaxed max-w-xl">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="wf-cta px-6 md:px-20 pb-32">
                <div className="max-w-4xl mx-auto bg-[#0e0e0e] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                    {/* Grain texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }} />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-serif font-light text-white mb-6 leading-tight">
                            {wf.ctaTitle || 'Готовы начать?'}
                        </h2>
                        <p className="text-white/50 font-sans text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
                            {wf.ctaDescription || 'Оставьте заявку, и мы свяжемся с вами для бесплатной консультации. Поможем подобрать мебель под ваш интерьер и бюджет.'}
                        </p>
                        <Link
                            to="/request"
                            className="inline-flex items-center gap-3 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-full text-xs md:text-sm font-sans uppercase tracking-[0.15em] transition-all duration-300 ease-spring hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_30px_rgba(196,162,101,0.35)]"
                        >
                            {wf.ctaButton || 'Оставить заявку'}
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Workflow;
