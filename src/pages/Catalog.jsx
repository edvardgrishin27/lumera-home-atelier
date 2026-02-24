import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

const Catalog = () => {
    const [filter, setFilter] = useState('All');
    const containerRef = useRef(null);
    const { content } = useContent();
    const products = content.products;

    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    const categories = ['All', 'Sofas', 'Armchairs', 'Tables', 'Chairs'];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.product-card',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [filter]);

    return (
        <div ref={containerRef} className="pt-32 pb-20 px-6 md:px-12 min-h-screen bg-background">
            <SEO
                title="Каталог мебели — купить премиальную мебель из Китая"
                description="Каталог премиальной мебели Lumera Home Atelier — диваны, кресла, столы, стулья из Китая под заказ. Доставка по России."
                url="/catalog"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Каталог' },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": "Каталог мебели Lumera",
                    "numberOfItems": products.length,
                    "itemListElement": products.map((p, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "url": `https://lumerahome.ru/product/${p.slug}`,
                        "name": p.name
                    }))
                }}
            />
            <div className="max-w-[1800px] mx-auto content-layer">
                <header className="mb-20 flex flex-col items-center">
                    <h1 className="text-6xl md:text-8xl font-serif font-thin mb-12 text-primary tracking-tight">Коллекция</h1>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 border-t border-b border-primary/10 py-6 w-full md:w-auto px-12">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`text-xs uppercase tracking-[0.2em] transition-all duration-300 ease-spring hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full px-4 py-2 border ${filter === cat ? 'text-primary font-bold bg-primary/10 border-primary/20' : 'text-primary/50 hover:bg-primary/5 border-transparent'}`}
                            >
                                {cat === 'All' ? 'Все' : cat}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                    {filteredProducts.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            className="product-card group block opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl transition-all duration-500 ease-spring hover:-translate-y-2"
                        >
                            {/* Card Image - with 2026 Layered Shadow & Cinematic Overlay */}
                            <div className="bg-surface aspect-[4/3] overflow-hidden mb-6 relative rounded-2xl shadow-elevated group-hover:shadow-floating transition-shadow duration-500">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="600"
                                />
                                {/* Cinematic gradient for depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>

                            <div className="pt-4 px-2">
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent transition-colors duration-300 ease-spring">{product.name}</h3>
                                    <span className="text-lg font-serif text-primary/90">
                                        {product.price.toLocaleString()} ₽
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] text-secondary uppercase tracking-widest">{product.category}</span>
                                    <p className="text-sm text-primary/70 font-serif leading-relaxed border-t border-primary/10 pt-4 mt-2">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 opacity-50 font-serif text-xl">
                        В этой категории пока нет товаров.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
