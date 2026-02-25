import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const Returns = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const ret = content.returns || {};
    const sections = ret.sections || [];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.ret-header', { opacity: 0, y: 50, duration: 1.2, ease: 'power3.out', delay: 0.2 });
            gsap.from('.ret-section', { opacity: 0, y: 40, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.5 });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-background min-h-screen">
            <SEO
                title="Возврат и обмен — условия | Lumera Home Atelier"
                description="Условия возврата и обмена мебели. Индивидуальные заказы, права потребителей и порядок обращения."
                url="/returns"
            />

            <section className="pt-40 md:pt-48 pb-16 md:pb-20 px-6 md:px-20">
                <div className="ret-header max-w-4xl">
                    <span className="text-accent text-[10px] md:text-xs uppercase tracking-[0.3em] font-sans block mb-6">
                        {ret.label || 'Покупателям'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-primary leading-[1.05] tracking-tight mb-8">
                        {ret.title || 'Возврат и обмен'}
                    </h1>
                </div>
            </section>

            <section className="px-6 md:px-20 pb-32">
                <div className="max-w-3xl space-y-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className={`ret-section ${idx > 0 ? 'border-t border-primary/8 pt-10' : ''}`}>
                            <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">{section.title}</h2>
                            <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                                {section.text.split('\n').map((line, li) => {
                                    if (line.startsWith('•')) {
                                        return (
                                            <div key={li} className="flex items-start gap-3">
                                                <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                                <span>{line.slice(1).trim()}</span>
                                            </div>
                                        );
                                    }
                                    if (/^\d+\./.test(line)) {
                                        return (
                                            <div key={li} className="flex items-start gap-3">
                                                <span className="text-accent mt-1 shrink-0">{line.match(/^\d+/)[0]}.</span>
                                                <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                            </div>
                                        );
                                    }
                                    if (line.trim() === '') return null;
                                    return <p key={li}>{line}</p>;
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Back link */}
                    <div className="ret-section pt-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-accent text-sm font-sans hover:underline transition-colors">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            На главную
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Returns;
