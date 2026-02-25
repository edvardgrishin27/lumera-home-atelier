import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const StarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 0L11.0206 6.97937L18 9L11.0206 11.0206L9 18L6.97937 11.0206L0 9L6.97937 6.97937L9 0Z" />
    </svg>
);

const Reviews = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const reviews = content.home?.reviews || [];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
            );

            ScrollTrigger.batch('.review-card-page', {
                onEnter: batch => gsap.fromTo(batch,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', overwrite: true }
                ),
                start: "top 88%"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background w-full overflow-hidden pb-24 md:pb-0">
            <SEO
                title="Отзывы клиентов — Lumera Home Atelier"
                description="Отзывы клиентов о премиальной мебели Lumera Home Atelier. Реальные впечатления покупателей о качестве, доставке и сервисе."
                url="/reviews"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Отзывы' },
                ]}
            />

            <div className="pt-16 md:pt-40 pb-32 px-6 md:px-20">
                {/* Header */}
                <div className="max-w-[1600px] mx-auto mb-20 reveal">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 block">Отзывы</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-thin text-primary tracking-tightest leading-[0.9] mb-8">
                        Что говорят<br />наши клиенты
                    </h1>
                    <p className="text-xl font-serif text-primary/60 max-w-lg leading-relaxed">
                        Каждый отзыв — подтверждение того, что мы делаем свою работу с любовью к деталям.
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <article
                            key={review.id}
                            className="review-card-page group relative border border-primary/[0.08] rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[320px] bg-surface hover:shadow-elevated transition-shadow duration-500"
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
                                <p className="font-serif text-lg md:text-xl leading-relaxed text-primary/70 italic">
                                    &ldquo;{review.text}&rdquo;
                                </p>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-primary/[0.06]">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-sans font-medium shrink-0">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <span className="block text-sm text-primary/90 font-sans">{review.name}</span>
                                    <span className="block text-xs text-secondary font-sans mt-0.5">{review.date}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Empty State */}
                {reviews.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl font-serif text-secondary">Отзывы скоро появятся</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
