import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const Blog = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const blog = content.blog;

    // Use posts from context if they exist, otherwise fallback to local defaults to avoid breaking if not populated yet
    const posts = blog.posts || [];

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );

            gsap.utils.toArray('.parallax-img').forEach((img) => {
                gsap.to(img, {
                    scale: 1.15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.parentElement,
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
        <div ref={containerRef} className="pt-16 md:pt-40 pb-24 md:pb-20 px-6 md:px-12 lg:px-20 min-h-screen bg-background w-full overflow-hidden">
            <SEO
                title="Блог о мебели — как выбрать диван, кровать, тренды интерьера"
                description="Экспертные статьи: как выбрать диван, кровать, кресло. Тренды дизайна интерьера, обзоры материалов, рейтинги мебели. Блог Lumera Home Atelier."
                url="/blog"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Блог' },
                ]}
            />
            <div className="max-w-[1600px] mx-auto content-layer mb-32">
                <div className="mb-20 text-center reveal">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 block">{blog.subtitle}</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-thin text-primary tracking-tightest leading-[0.9] whitespace-pre-line">
                        {blog.mainTitle}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                    {posts.map((post, idx) => (
                        <Link to={`/blog/${post.slug}`} key={post.id} className={`reveal group cursor-pointer block ${idx % 2 !== 0 ? 'md:mt-32' : ''}`}>
                            <div className="aspect-[4/3] bg-surface overflow-hidden relative mb-8 rounded-2xl shadow-elevated group-hover:shadow-hover-glow transition-shadow duration-500">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover parallax-img transition-transform duration-1000 ease-spring group-hover:scale-105 origin-center"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="600"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">{post.category}</span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">{post.date}</span>
                            </div>

                            <h2 className="text-3xl font-serif text-primary mb-4 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                                {post.title}
                            </h2>
                            <p className="text-sm text-secondary leading-relaxed mb-6 line-clamp-3">
                                {post.excerpt}
                            </p>

                            <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-primary border-b border-primary/20 pb-1 hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full">
                                {blog.readMoreBtn}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
