import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';
import RequestModal from '../components/RequestModal';
import { mediaUrl } from '../utils/mediaUrl';

/* ─── Маппинг категорий EN → RU (строится динамически из content.catalog.categories) ─── */
const buildCategoryMap = (categories) => {
    const map = { All: 'Все' };
    if (categories && Array.isArray(categories)) {
        categories.forEach(c => { map[c.key] = c.label; });
    }
    return map;
};

/* ═════════════════════════════════════════════════════════
   SVG-иконки
═════════════════════════════════════════════════════════ */
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* ═════════════════════════════════════════════════════════
   Компонент: Активные теги фильтров (удаляемые)
═════════════════════════════════════════════════════════ */
const ActiveFilters = ({ filters, onRemove, onClearAll }) => {
    if (filters.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {filters.map((f, i) => (
                <button
                    key={i}
                    onClick={() => onRemove(f)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-[10px] uppercase tracking-[0.15em] rounded-full hover:bg-accent/20 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
                >
                    {f.label}
                    <CloseIcon />
                </button>
            ))}
            <button
                onClick={onClearAll}
                className="text-[10px] uppercase tracking-[0.15em] text-secondary hover:text-primary transition-colors duration-200 ml-2 cursor-pointer"
            >
                Сбросить всё
            </button>
        </div>
    );
};

/* ═════════════════════════════════════════════════════════
   Компонент: Карточка товара
═════════════════════════════════════════════════════════ */
const ProductCard = ({ product, categoryMap = {} }) => {
    return (
        <Link
            to={`/product/${product.slug}`}
            className="product-card group block opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl transition-transform duration-500 ease-spring hover:-translate-y-2"
        >
            <div className="bg-surface aspect-[4/3] overflow-hidden mb-6 relative rounded-2xl shadow-elevated group-hover:shadow-floating transition-shadow duration-500">
                <img
                    src={mediaUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
            <div className="pt-4 px-2">
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent transition-colors duration-300 ease-spring">{product.name}</h3>
                    <span className="text-lg font-serif text-primary/90">Цена по запросу</span>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-secondary uppercase tracking-widest">{categoryMap[product.category] || product.category}</span>
                    <p className="text-sm text-primary/70 font-serif leading-relaxed border-t border-primary/10 pt-4 mt-2">
                        {product.description}
                    </p>
                </div>
            </div>
        </Link>
    );
};

/* ═════════════════════════════════════════════════════════
   ГЛАВНЫЙ КОМПОНЕНТ: КАТАЛОГ
═════════════════════════════════════════════════════════ */
const Catalog = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const products = content.products;

    // ── Динамический маппинг категорий из админки ──
    const CATEGORY_MAP = useMemo(() => buildCategoryMap(content.catalog?.categories), [content.catalog?.categories]);

    const [isRequestOpen, setIsRequestOpen] = useState(false);

    // ── Состояния фильтров ──
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    // ── Извлечение данных для фильтров ──
    const categories = useMemo(() => Object.keys(CATEGORY_MAP), [CATEGORY_MAP]);

    // ── Подсчёт товаров по категориям ──
    const categoryCounts = useMemo(() => {
        const counts = {};
        categories.forEach(cat => {
            counts[cat] = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
        });
        return counts;
    }, [products, categories]);

    // ── Фильтрация + сортировка ──
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Поиск по имени и описанию
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                (CATEGORY_MAP[p.category] || p.category).toLowerCase().includes(q)
            );
        }

        // Категория
        if (category !== 'All') {
            result = result.filter(p => p.category === category);
        }

        return result;
    }, [products, search, category]);

    // ── Активные теги фильтров ──
    const activeFilters = useMemo(() => {
        const tags = [];
        if (category !== 'All') {
            tags.push({ type: 'category', value: category, label: CATEGORY_MAP[category] || category });
        }
        if (search.trim()) {
            tags.push({ type: 'search', value: search, label: `«${search}»` });
        }
        return tags;
    }, [category, search]);

    const removeFilter = useCallback((filter) => {
        switch (filter.type) {
            case 'category': setCategory('All'); break;
            case 'search': setSearch(''); break;
        }
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearch('');
        setCategory('All');
    }, []);

    // ── GSAP: анимация появления карточек (smooth premium feel) ──
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Small delay to let DOM settle after filter change
            gsap.fromTo('.product-card',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out', overwrite: true, delay: 0.05 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, [filteredProducts]);

    // ── GSAP: анимация reveal при загрузке ──
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.catalog-reveal',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.15 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-32 pb-20 px-6 md:px-12 min-h-screen bg-background">
            <SEO
                title="Каталог мебели из Китая — цены, фото | Купить с доставкой"
                description="Каталог мебели из Китая с ценами и фото — диваны, кресла, столы, кровати под заказ. Доставка по Москве и России. Каталог Lumera Home Atelier."
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

                {/* ═══ HEADER: Заголовок + Поиск ═══ */}
                <header className="mb-12 md:mb-16 catalog-reveal">
                    <h1 className="text-6xl md:text-8xl font-serif font-thin mb-10 text-primary tracking-tight text-center">
                        Коллекция
                    </h1>

                    {/* Поиск */}
                    <div className="max-w-xl mx-auto relative mb-10">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Поиск по каталогу..."
                            className="w-full pl-11 pr-10 py-3.5 bg-surface border border-primary/8 rounded-2xl text-sm text-primary placeholder:text-secondary/40 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-colors duration-300"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary transition-colors duration-200 cursor-pointer"
                            >
                                <CloseIcon />
                            </button>
                        )}
                    </div>

                    {/* Категории — горизонтальные пиллы */}
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 catalog-reveal">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-full border transition-colors duration-300 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-accent ${
                                    category === cat
                                        ? 'text-white bg-accent border-accent shadow-elevated'
                                        : 'text-primary/60 border-primary/12 hover:border-accent/40 hover:text-accent hover:bg-accent/5'
                                }`}
                            >
                                {CATEGORY_MAP[cat]}
                                <span className={`ml-1.5 text-[10px] ${category === cat ? 'text-white/70' : 'text-secondary/50'}`}>
                                    {categoryCounts[cat]}
                                </span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* Активные теги фильтров */}
                <ActiveFilters
                    filters={activeFilters}
                    onRemove={removeFilter}
                    onClearAll={clearAllFilters}
                />

                {/* ═══ СЕТКА ТОВАРОВ (полная ширина) ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} categoryMap={CATEGORY_MAP} />
                    ))}
                </div>

                {/* Пустое состояние */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-24">
                        <div className="mb-6">
                            <svg className="w-16 h-16 mx-auto text-primary/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <p className="font-serif text-2xl text-primary/40 mb-4">Ничего не найдено</p>
                        <p className="text-sm text-secondary/60 mb-8">Попробуйте изменить параметры поиска или сбросить фильтры</p>
                        <button
                            onClick={clearAllFilters}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-accent/20 transition-colors duration-200 cursor-pointer"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}

                {/* ═══ CTA: Не нашли что искали? ═══ */}
                <section className="mt-16 md:mt-28 mb-4 catalog-reveal">
                    <div className="relative bg-surface rounded-3xl p-8 md:p-16 text-center overflow-hidden">
                        {/* Decorative accent line */}
                        <div className="w-10 h-px bg-accent mx-auto mb-6 md:mb-8" />

                        <h2 className="text-3xl md:text-5xl font-serif font-light text-primary mb-4 md:mb-6 tracking-tight">
                            Не нашли что искали?
                        </h2>
                        <p className="text-secondary font-sans text-sm md:text-lg leading-relaxed max-w-xl mx-auto mb-8 md:mb-12">
                            У&nbsp;нас миллионы товаров доступны под заказ&nbsp;— просто напишите нам,
                            и&nbsp;мы подберём именно то, что вам нужно
                        </p>
                        <button
                            onClick={() => setIsRequestOpen(true)}
                            className="inline-flex items-center gap-3 bg-accent hover:bg-accent/85 active:scale-95 text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-xs uppercase tracking-[0.18em] shadow-[0_4px_20px_rgba(196,162,101,0.3)] hover:shadow-[0_0_30px_rgba(196,162,101,0.5)] hover:-translate-y-0.5 transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent cursor-pointer"
                        >
                            Оставить заявку
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </section>
            </div>

            <RequestModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
        </div>
    );
};

export default Catalog;
