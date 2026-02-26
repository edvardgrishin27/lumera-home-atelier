import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

gsap.registerPlugin(ScrollTrigger);

/* ─── Карточка основателя: компактный портрет + декоративная рамка ─── */
const FounderCard = ({ name, role, image, quote, bio, fullBio, expertise, reverse }) => {
    const [expanded, setExpanded] = useState(false);
    const fullBioRef = useRef(null);

    const handleToggle = () => {
        setExpanded(prev => !prev);
    };

    // Плавная анимация раскрытия через GSAP
    useEffect(() => {
        if (!fullBioRef.current) return;
        if (expanded) {
            gsap.fromTo(fullBioRef.current,
                { height: 0, opacity: 0 },
                { height: 'auto', opacity: 1, duration: 0.6, ease: 'power2.out' }
            );
        } else {
            gsap.to(fullBioRef.current,
                { height: 0, opacity: 0, duration: 0.4, ease: 'power2.in' }
            );
        }
    }, [expanded]);

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 items-center founder-card`}>

            {/* ── Компактный портрет с декоративным обрамлением ── */}
            <div className={`lg:col-span-5 ${reverse ? 'lg:order-2' : 'lg:order-1'} flex justify-center`}>
                <div className="relative group w-[200px] md:w-[320px] xl:w-[360px]">
                    {/* Декоративная золотая рамка — офсет за фото */}
                    <div
                        className={`absolute inset-0 rounded-[2rem] border border-accent/30 transition-transform duration-700 ease-out group-hover:translate-x-0 group-hover:translate-y-0 ${
                            reverse
                                ? '-translate-x-3 translate-y-3'
                                : 'translate-x-3 translate-y-3'
                        }`}
                        style={{ zIndex: 0 }}
                    />
                    {/* Мягкое золотое свечение за фото */}
                    <div
                        className="absolute -inset-4 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(196,162,101,0.08) 0%, transparent 70%)',
                            zIndex: 0,
                        }}
                    />
                    {/* Само фото — компактный портрет (эффекты как в каталоге) */}
                    <div
                        className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-surface shadow-elevated group-hover:shadow-floating transition-shadow duration-500"
                        style={{ zIndex: 1 }}
                    >
                        {image && (
                            <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover object-top transition-transform duration-700 ease-spring group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                                width="360"
                                height="480"
                            />
                        )}
                        {/* Кинематографический градиент на hover (как в каталоге) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                    {/* Имя поверх фото (мобайл) */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 lg:hidden" style={{ zIndex: 2 }}>
                        <span className="text-white/60 text-[9px] uppercase tracking-[0.3em] block mb-1">{role}</span>
                        <h3 className="text-white text-xl font-serif">{name}</h3>
                    </div>
                </div>
            </div>

            {/* ── Текстовый контент ── */}
            <div className={`lg:col-span-7 ${reverse ? 'lg:order-1' : 'lg:order-2'} flex flex-col justify-center`}>
                {/* Имя (десктоп) */}
                <div className="hidden lg:block mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-accent block mb-3">{role}</span>
                    <h3 className="text-4xl xl:text-5xl font-serif text-primary tracking-tight leading-[1.1]">{name}</h3>
                </div>

                {/* Цитата */}
                <blockquote className="relative pl-6 border-l-2 border-accent/40 mb-8">
                    <p className="text-lg md:text-xl font-serif italic text-primary/80 leading-relaxed">
                        &laquo;{quote}&raquo;
                    </p>
                </blockquote>

                {/* Краткая биография */}
                <p className="text-sm text-secondary leading-[1.8] mb-4">
                    {bio}
                </p>

                {/* Кнопка «Читать полностью» */}
                {fullBio && (
                    <button
                        onClick={handleToggle}
                        className="group/btn inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors duration-300 mb-6 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4 active:scale-[0.97]"
                    >
                        <span>{expanded ? 'Свернуть' : 'Читать полностью'}</span>
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}

                {/* Полная биография (раскрывающийся блок) */}
                {fullBio && (
                    <div
                        ref={fullBioRef}
                        className="overflow-hidden mb-6"
                        style={{ height: 0, opacity: 0 }}
                    >
                        <div className="border-l-2 border-accent/15 pl-6 py-2 space-y-4">
                            {fullBio.split('\n\n').map((paragraph, i) => (
                                <p key={i} className="text-sm text-secondary/90 leading-[1.8]">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Экспертиза */}
                <div className="border-t border-primary/10 pt-6">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent block mb-3">Экспертиза</span>
                    <p className="text-xs text-secondary/80 tracking-wide leading-relaxed">
                        {expertise}
                    </p>
                </div>
            </div>
        </div>
    );
};

const About = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const ab = content.about;

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Основные reveal-анимации
            gsap.fromTo('.reveal',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
            );

            // Параллакс на изображениях
            gsap.utils.toArray('.parallax-media').forEach((media) => {
                gsap.to(media, {
                    yPercent: 15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: media.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            });

            // Анимация карточек основателей по скроллу
            gsap.utils.toArray('.founder-card').forEach((card) => {
                gsap.fromTo(card,
                    { opacity: 0, y: 60 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            end: 'top 40%',
                            toggleActions: 'play none none none',
                        }
                    }
                );
            });

            // Анимация золотой линии-разделителя
            gsap.fromTo('.founders-divider',
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 1.5,
                    ease: 'power3.inOut',
                    scrollTrigger: {
                        trigger: '.founders-divider',
                        start: 'top 90%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-16 md:pt-40 px-5 md:px-20 pb-4 md:pb-0 bg-background w-full overflow-hidden">
            <SEO
                title="О компании Lumera Home Atelier — мебель из Китая на заказ"
                description="Lumera Home Atelier — ателье дизайнерской мебели из Китая. Мебель на заказ по индивидуальным проектам, авторские коллекции, доставка по России."
                url="/about"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'О нас' },
                ]}
            />

            {/* ═══════════════════════════════════════════════════════
                СЕКЦИЯ: ОСНОВАТЕЛИ — поверх всего контента
            ═══════════════════════════════════════════════════════ */}
            <div className="max-w-[1600px] mx-auto content-layer mb-12 md:mb-40">

                {/* Заголовок секции */}
                <div className="text-center mb-8 md:mb-28 reveal">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 block">
                        {ab.foundersLabel}
                    </span>
                    <h2 className="text-3xl md:text-7xl xl:text-8xl font-serif font-thin text-primary tracking-tightest leading-[0.95] mb-4 md:mb-6">
                        {(ab.foundersTitle || '').split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <br />}
                                {line}
                            </React.Fragment>
                        ))}
                    </h2>
                    <p className="text-base md:text-xl font-serif text-secondary max-w-lg mx-auto leading-relaxed">
                        {ab.foundersSubtitle}
                    </p>
                </div>

                {/* Основатель 1 — Вероника (первая) */}
                <FounderCard
                    name={ab.founder1Name}
                    role={ab.founder1Role}
                    image={ab.founder1Image}
                    quote={ab.founder1Quote}
                    bio={ab.founder1Bio}
                    fullBio={ab.founder1FullBio}
                    expertise={ab.founder1Expertise}
                    reverse={false}
                />

                {/* Золотой разделитель */}
                <div className="my-8 md:my-28 flex justify-center">
                    <div className="founders-divider h-px w-32 bg-gradient-to-r from-transparent via-accent/60 to-transparent origin-center" />
                </div>

                {/* Основатель 2 — Эдвард (второй) */}
                <FounderCard
                    name={ab.founder2Name}
                    role={ab.founder2Role}
                    image={ab.founder2Image}
                    quote={ab.founder2Quote}
                    bio={ab.founder2Bio}
                    fullBio={ab.founder2FullBio}
                    expertise={ab.founder2Expertise}
                    reverse={true}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════
                СЕКЦИЯ: О КОМПАНИИ — картинка слева, весь текст справа
            ═══════════════════════════════════════════════════════ */}
            <div className="max-w-[1600px] mx-auto content-layer mb-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">

                    {/* Левая колонка — только изображение */}
                    <div className="lg:col-span-5 reveal">
                        <div className="aspect-[4/5] bg-surface overflow-hidden relative rounded-2xl shadow-elevated transition-shadow duration-500 hover:shadow-hover-glow cursor-crosshair">
                            <img
                                src={ab.image1}
                                className="w-full h-full object-cover parallax-media scale-110"
                                alt="Ателье Lumera Home Atelier — мастерская дизайнерской мебели"
                                loading="lazy"
                                decoding="async"
                                width="800"
                                height="1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Правая колонка — весь текст сверху вниз */}
                    <div className="lg:col-span-7 flex flex-col gap-8 md:gap-10 reveal">

                        {/* Заголовок */}
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-3 block">{ab.title}</span>
                            <h1 className="text-4xl md:text-6xl xl:text-7xl font-serif font-thin mb-4 text-primary tracking-tightest leading-[0.9]">
                                Искусство<br />жить
                            </h1>
                            <p className="text-lg md:text-xl font-serif text-primary/70 leading-relaxed">
                                {ab.subtitle}
                            </p>
                        </div>

                        {/* Разделитель */}
                        <div className="w-16 h-px bg-accent/30" />

                        {/* Философия */}
                        <div>
                            <h2 className="text-xl md:text-2xl font-serif mb-3 text-primary">Философия</h2>
                            <p className="text-sm text-secondary leading-[1.8]">
                                {ab.description1}
                            </p>
                        </div>

                        {/* Подход */}
                        <div>
                            <h2 className="text-xl md:text-2xl font-serif mb-3 text-primary">Подход</h2>
                            <p className="text-sm text-secondary leading-[1.8]">
                                {ab.description2}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Статистика — полоска по центру */}
            <div className="border-t border-primary/10 reveal mt-10 md:mt-16">
                <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-12 md:gap-24 py-8 md:py-12">
                    <div className="text-center">
                        <span className="block text-2xl md:text-4xl font-serif text-primary mb-1">{ab.stats1Value}</span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-secondary">{ab.stats1Label}</span>
                    </div>
                    <div className="w-px h-10 bg-primary/10" />
                    <div className="text-center">
                        <span className="block text-2xl md:text-4xl font-serif text-primary mb-1">{ab.stats2Value}</span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-secondary">{ab.stats2Label}</span>
                    </div>
                    <div className="w-px h-10 bg-primary/10" />
                    <div className="text-center">
                        <span className="block text-2xl md:text-4xl font-serif text-primary mb-1">{ab.stats3Value}</span>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-secondary">{ab.stats3Label}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
