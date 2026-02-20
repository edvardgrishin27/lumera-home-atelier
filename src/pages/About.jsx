import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';

const About = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const ab = content.about;

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
            );

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
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-40 px-6 md:px-20 min-h-screen bg-background bg-noise w-full overflow-hidden">
            <div className="max-w-[1600px] mx-auto content-layer mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Left Typography Column */}
                    <div className="lg:col-span-5 lg:sticky lg:top-40 h-fit reveal">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 block">{ab.title}</span>
                        <h1 className="text-6xl md:text-8xl font-serif font-thin mb-8 text-primary tracking-tightest leading-[0.9]">
                            Искусство<br />жить
                        </h1>
                        <p className="text-xl md:text-2xl font-serif max-w-md text-primary/80 leading-relaxed mb-12">
                            {ab.subtitle}
                        </p>
                    </div>

                    {/* Right Staggered Content Column */}
                    <div className="lg:col-span-7 space-y-32 mb-20">
                        {/* Section 1 */}
                        <div className="reveal">
                            <div className="aspect-[4/3] bg-surface overflow-hidden relative mb-8 rounded-2xl shadow-elevated transition-shadow duration-500 hover:shadow-hover-glow cursor-crosshair">
                                <img src={ab.image1} className="w-full h-full object-cover parallax-media scale-110" alt="Atelier Interior" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent mix-blend-multiply" />
                            </div>
                            <h2 className="text-3xl font-serif mb-4 text-primary">Философия</h2>
                            <p className="text-sm text-secondary leading-relaxed max-w-xl">
                                {ab.description1}
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="reveal ml-0 md:ml-20">
                            <h2 className="text-3xl font-serif mb-4 text-primary">Подход</h2>
                            <p className="text-sm text-secondary leading-relaxed max-w-xl">
                                {ab.description2}
                            </p>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-primary/10 pt-16 reveal">
                            <div>
                                <span className="block text-4xl md:text-5xl font-serif text-primary mb-2">{ab.stats1Value}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">{ab.stats1Label}</span>
                            </div>
                            <div>
                                <span className="block text-4xl md:text-5xl font-serif text-primary mb-2">{ab.stats2Value}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">{ab.stats2Label}</span>
                            </div>
                            <div>
                                <span className="block text-4xl md:text-5xl font-serif text-primary mb-2">{ab.stats3Value}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">{ab.stats3Label}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
