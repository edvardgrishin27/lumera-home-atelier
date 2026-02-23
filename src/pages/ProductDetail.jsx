import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import OrderModal from '../components/OrderModal';

const ProductDetail = () => {
    const { slug } = useParams();
    const { content } = useContent();
    const products = content.products;
    const product = products.find(p => p.slug === slug) || products[0];
    const containerRef = useRef(null);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [isOrderOpen, setIsOrderOpen] = useState(false);

    // Color & Size options (demo data)
    const colors = product?.colors || [];
    const sizes = product?.sizes || [];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );

            gsap.utils.toArray('.parallax-media').forEach((media) => {
                gsap.to(media, {
                    yPercent: 20,
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

        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return () => ctx.revert();
    }, [slug]);

    if (!product) return <div className="pt-40 text-center">Загрузка...</div>;

    const gallery = product.gallery || [product.image, product.image, product.image, product.image];

    const isVideo = (url) => url && url.match(/\.(mp4|webm|ogg)$/i);

    return (
        <div ref={containerRef} className="bg-background min-h-screen">
            <SEO
                title={product.name}
                description={product.description}
                image={product.image}
                url={`/product/${product.slug}`}
                type="product"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description,
                    "image": product.image,
                    "url": `https://lumerahome.ru/product/${product.slug}`,
                    "brand": { "@type": "Brand", "name": "Lumera Home Atelier" },
                    "offers": {
                        "@type": "Offer",
                        "price": product.price,
                        "priceCurrency": "RUB",
                        "availability": "https://schema.org/InStock"
                    }
                }}
            />

            {/* Top Section: Refined 2026 Premium Style */}
            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto content-layer">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Left: Gallery with Cinematic Touches */}
                    <div className="lg:col-span-8 reveal">
                        <div className="aspect-[4/3] bg-surface mb-4 overflow-hidden relative group cursor-zoom-in rounded-2xl shadow-elevated">
                            {isVideo(gallery[activeImage]) ? (
                                <video
                                    src={gallery[activeImage]}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={gallery[activeImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-spring group-hover:scale-105"
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    width="1000"
                                    height="750"
                                />
                            )}
                            {/* Subtle Cinematic Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {gallery.map((media, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    aria-label={`Просмотр медиа ${idx + 1}`}
                                    className={`aspect-square bg-surface cursor-pointer rounded-xl overflow-hidden relative transition-all duration-500 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary block border-none ${activeImage === idx ? 'ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-md' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                                >
                                    {isVideo(media) ? (
                                        <div className="w-full h-full relative">
                                            <video src={media} className="w-full h-full object-cover" muted playsInline />
                                            {/* Play Icon Overlay for Thumbnails */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={media} className="w-full h-full object-cover" alt={`Миниатюра галереи ${idx + 1}`} loading="lazy" decoding="async" width="250" height="250" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Sticky Info with Tight Typography */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-32 reveal">
                            <div className="border-b border-primary/10 pb-8 mb-8">
                                <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight tracking-tightest text-primary">{product.name}</h1>
                                <p className="text-xs uppercase tracking-[0.2em] text-secondary mb-6">{product.category}</p>
                                <p className="text-2xl font-serif text-primary opacity-90">{product.price.toLocaleString()} ₽</p>
                            </div>

                            <div className="space-y-8">
                                <p className="text-base leading-relaxed opacity-80 font-serif text-primary">
                                    {product.description}
                                </p>

                                <div className="space-y-4 py-4 border-t border-b border-primary/10">
                                    <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-secondary">
                                        <span>Характеристики</span>
                                        <span>См</span>
                                    </div>
                                    <p className="font-serif text-primary">{product.specs}</p>

                                    {product.details && product.details.map((detail, i) => (
                                        <div key={i} className="pt-2">
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-secondary mb-1">{detail.label}</div>
                                            <div className="font-serif text-primary">{detail.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Color Selector Workspace */}
                                {colors.length > 0 && (
                                    <div className="space-y-4 py-6 border-t border-primary/5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">Цвет</span>
                                            <span className="text-sm font-serif text-primary opacity-70">
                                                {colors[selectedColor]?.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            {colors.map((color, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedColor(i)}
                                                    aria-label={`Выбрать цвет ${color.name}`}
                                                    className={`w-10 h-10 rounded-full transition-all duration-500 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ${selectedColor === i ? 'ring-2 ring-offset-4 ring-primary scale-110 shadow-md' : 'hover:scale-110 opacity-70 hover:opacity-100 hover:shadow-sm'}`}
                                                    style={{ backgroundColor: color.hex }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selector Workspace */}
                                {sizes.length > 0 && (
                                    <div className="space-y-3 py-6 border-t border-primary/5">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">Габариты (Ш×Г×В)</span>
                                            <span className="text-xs font-serif text-primary opacity-70 transition-all">
                                                {sizes[selectedSize]?.value}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {sizes.map((size, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedSize(i)}
                                                    aria-label={`Выбрать размер ${size.label}`}
                                                    className={`px-4 py-2.5 text-[11px] font-sans tracking-wide rounded-full transition-all duration-300 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border ${selectedSize === i ? 'bg-accent text-white border-accent shadow-md scale-105' : 'bg-transparent text-primary border-primary/20 hover:border-accent/50 hover:bg-primary/5'}`}
                                                >
                                                    {size.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Premium CTA Button */}
                                <button
                                    onClick={() => setIsOrderOpen(true)}
                                    className="w-full bg-accent text-white py-5 text-xs uppercase tracking-[0.2em] rounded-full hover:bg-accent/80 transition-transform duration-500 ease-spring text-center shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                                >
                                    Оформить заказ
                                </button>

                                <p className="text-[10px] text-center text-secondary uppercase tracking-[0.2em]">
                                    Индивидуальное изготовление от 45 дней
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Boca Style (Mood) */}
            <div className="w-full bg-surface py-20 lg:py-40">
                <div className="px-6 md:px-12 mb-20 text-center reveal">
                    <span className="text-xs uppercase tracking-[0.3em] text-accent block mb-4">Mood</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-thin">В интерьере</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8">

                    {product.video && (
                        <div className="md:col-span-2 aspect-video overflow-hidden relative reveal group">
                            <video
                                className="w-full h-full object-cover parallax-media scale-110"
                                autoPlay
                                loop
                                muted
                                playsInline
                                poster={product.image}
                            >
                                <source src={product.video} type="video/mp4" />
                            </video>
                            <div className="absolute bottom-8 left-8 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-xs uppercase tracking-widest">Live View</p>
                            </div>
                        </div>
                    )}

                    <div className="aspect-[3/4] overflow-hidden reveal">
                        <img src={gallery[1] || product.image} className="w-full h-full object-cover parallax-media scale-110" alt="Detail 1" loading="lazy" decoding="async" width="800" height="1067" />
                    </div>

                    <div className="aspect-[3/4] bg-background p-12 flex flex-col justify-center items-center text-center reveal">
                        <h3 className="text-3xl font-serif mb-4 italic">"Детали создают совершенство"</h3>
                        <p className="opacity-50 text-sm max-w-xs">Каждый шов, каждый изгиб выверен с точностью до миллиметра.</p>
                    </div>

                    <div className="aspect-square md:aspect-[4/3] overflow-hidden md:col-span-2 reveal">
                        <img src={gallery[2] || product.image} className="w-full h-full object-cover parallax-media scale-110" alt="Detail 2" loading="lazy" decoding="async" width="1200" height="900" />
                    </div>

                </div>
            </div>

            <OrderModal
                isOpen={isOrderOpen}
                onClose={() => setIsOrderOpen(false)}
                product={product}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
            />
        </div>
    );
};

export default ProductDetail;
