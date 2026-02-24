import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { content } = useContent();
    const containerRef = useRef(null);

    const post = content.blog.posts?.find(p => p.slug === slug);

    useEffect(() => {
        if (!post) return;

        let ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [post]);

    if (!post) {
        return (
            <div className="min-h-screen pt-40 flex flex-col justify-center items-center bg-background text-primary">
                <h1 className="text-3xl font-serif mb-4">Статья не найдена</h1>
                <button onClick={() => navigate('/blog')} className="text-xs uppercase tracking-widest text-accent hover:text-primary transition-colors">
                    Вернуться в блог
                </button>
            </div>
        );
    }

    // Since we don't have full rich HTML content in the current data model,
    // we extrapolate the excerpt to look like a full post for demonstration,
    // or just display what we have beautifully.
    return (
        <div ref={containerRef} className="pt-32 pb-20 px-6 md:px-12 lg:px-20 min-h-screen bg-background w-full">
            <SEO
                title={`${post.title} — статья в блоге Lumera`}
                description={`${post.excerpt?.slice(0, 140)}... Читайте в блоге Lumera Home Atelier.`}
                image={post.image}
                url={`/blog/${post.slug}`}
                type="article"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Блог', url: '/blog' },
                    { name: post.title },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": post.title,
                    "description": post.excerpt,
                    "image": post.image,
                    "datePublished": post.date,
                    "author": { "@type": "Organization", "name": "Lumera Home Atelier" },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Lumera Home Atelier",
                        "url": "https://lumerahome.ru"
                    },
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://lumerahome.ru/blog/${post.slug}`
                    }
                }}
            />
            <div className="max-w-4xl mx-auto content-layer">

                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-secondary hover:text-primary transition-colors mb-12 reveal"
                >
                    <span className="text-xl">←</span> Назад к статьям
                </button>

                <div className="mb-12 reveal">
                    <div className="flex gap-4 items-center mb-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold px-3 py-1 bg-accent/10 rounded-full">{post.category}</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">{post.date}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-thin text-primary tracking-tight leading-tight mb-8">
                        {post.title}
                    </h1>
                </div>

                <div className="aspect-[16/9] w-full bg-surface overflow-hidden relative mb-16 rounded-2xl shadow-elevated reveal">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        width="1200"
                        height="675"
                    />
                </div>

                {/* Blog content: uses post.content (trusted HTML from admin CMS) if available, otherwise shows default placeholder */}
                {post.content ? (
                    <div
                        className="blog-content max-w-none reveal"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                ) : (
                    <div className="prose prose-lg prose-p:font-serif prose-p:text-primary/80 prose-p:leading-relaxed max-w-none text-xl reveal">
                        <p className="first-letter:text-7xl first-letter:font-serif first-letter:text-accent first-letter:mr-3 first-letter:float-left">
                            {post.excerpt}
                        </p>
                        <p className="mt-8">
                            В современных интерьерах, где каждый квадратный метр рассматривается как инвестиция в качество жизни, подход к выбору мебели кардинально меняется. Мы отходим от концепции &laquo;просто купить диван&raquo; и приходим к осознанному коллекционированию эмоций и форм.
                        </p>
                        <p className="mt-4">
                            Материалы играют здесь первую скрипку. То, к чему мы прикасаемся каждый день, формирует наше внутреннее состояние. Именно поэтому фабрики, с которыми мы сотрудничаем, уделяют столько внимания тактильности: брашированный дуб, который хранит тепло рук мастера, нежнейшая кожа анилинового крашения, натуральный камень с его неповторимым рисунком вен.
                        </p>

                        <div className="my-12 p-8 border-l-2 border-accent bg-surface/50 rounded-r-2xl italic font-serif text-2xl text-primary text-center">
                            &laquo;Истинная роскошь сегодня — это не избыток, а безупречность в деталях и право на визуальную тишину.&raquo;
                        </div>

                        <p>
                            Современный коллекционный дизайн не кричит о своем статусе. Он проявляется в идеальных пропорциях, в сложных, многослойных оттенках и в том, как предмет взаимодействует со светом в течение дня. Это искусство, которое живет вместе с вами.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BlogPost;
