import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import SEO from '../components/SEO';

/* ─── Маппинг категорий EN → RU (строится динамически из content.catalog.categories) ─── */
const buildCategoryMap = (categories) => {
    const map = { All: 'Все' };
    if (categories && Array.isArray(categories)) {
        categories.forEach(c => { map[c.key] = c.label; });
    }
    return map;
};

/* ─── Маппинг сортировок ─── */
const SORT_OPTIONS = [
    { value: 'popular', label: 'По популярности' },
    { value: 'price-asc', label: 'Цена: по возрастанию' },
    { value: 'price-desc', label: 'Цена: по убыванию' },
    { value: 'name-asc', label: 'По алфавиту: А-Я' },
    { value: 'name-desc', label: 'По алфавиту: Я-А' },
];

/* ─── Capitalize first letter ─── */
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ─── Метки details, которые являются материалами ─── */
const MATERIAL_LABELS = ['Материал каркаса', 'Обивка', 'Наполнитель', 'Материал'];

/* ─── Извлечение уникальных материалов из details товаров ─── */
const extractMaterials = (products) => {
    const mats = new Set();
    products.forEach(p => {
        if (p.details) {
            p.details
                .filter(d => MATERIAL_LABELS.some(l => d.label.includes(l)))
                .forEach(d => {
                    // Разбиваем значение — но аккуратно: не ломаем скобки
                    // «Массив дуба, фанера» → [«Массив дуба», «фанера»]
                    // «Итальянский бархат (Martindale > 50,000)» → целиком
                    const raw = d.value;
                    // Если есть скобки — убираем техническую часть в скобках
                    const stripped = raw.replace(/\s*\([^)]*\)/g, '').trim();
                    if (stripped.includes(',')) {
                        stripped.split(',').forEach(v => {
                            const clean = v.trim();
                            if (clean.length > 0) mats.add(capitalize(clean));
                        });
                    } else if (stripped.length > 0) {
                        mats.add(capitalize(stripped));
                    }
                });
        }
    });
    return Array.from(mats).sort();
};

/* ─── Извлечение уникальных цветов ─── */
const extractColors = (products) => {
    const colorMap = new Map();
    products.forEach(p => {
        if (p.colors) {
            p.colors.forEach(c => {
                if (!colorMap.has(c.hex)) {
                    colorMap.set(c.hex, c.name);
                }
            });
        }
    });
    return Array.from(colorMap.entries()).map(([hex, name]) => ({ hex, name }));
};

/* ─── Склонение «товар/товара/товаров» ─── */
const pluralProducts = (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'товар';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара';
    return 'товаров';
};

/* ═════════════════════════════════════════════════════════
   SVG-иконки (инлайн для скорости, без внешних зависимостей)
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

const ChevronIcon = ({ open }) => (
    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const FilterIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
);

const GridIcon = ({ active }) => (
    <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

const ListIcon = ({ active }) => (
    <svg className={`w-4 h-4 ${active ? 'text-accent' : 'text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);

/* ═════════════════════════════════════════════════════════
   Компонент: Боковой фильтр — раскрывающаяся секция
═════════════════════════════════════════════════════════ */
const FilterSection = ({ title, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    const bodyRef = useRef(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!bodyRef.current) return;
        // Skip animation on first mount — just set the correct state
        if (!initializedRef.current) {
            initializedRef.current = true;
            if (!defaultOpen) {
                gsap.set(bodyRef.current, { height: 0, opacity: 0 });
            }
            return;
        }
        if (open) {
            gsap.killTweensOf(bodyRef.current);
            gsap.set(bodyRef.current, { height: 'auto', opacity: 1 });
            const fullHeight = bodyRef.current.scrollHeight;
            gsap.fromTo(bodyRef.current,
                { height: 0, opacity: 0 },
                { height: fullHeight, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'height' }
            );
        } else {
            gsap.killTweensOf(bodyRef.current);
            gsap.to(bodyRef.current,
                { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut' }
            );
        }
    }, [open]);

    return (
        <div className="border-b border-primary/8">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-4 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
                <span className="text-[11px] uppercase tracking-[0.2em] text-primary/80 group-hover:text-accent transition-colors duration-300">{title}</span>
                <ChevronIcon open={open} />
            </button>
            <div ref={bodyRef} className="overflow-hidden" style={{ height: defaultOpen ? 'auto' : 0, opacity: defaultOpen ? 1 : 0 }}>
                <div className="pb-5">
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ═════════════════════════════════════════════════════════
   Компонент: Чекбокс фильтра
═════════════════════════════════════════════════════════ */
const FilterCheckbox = ({ label, checked, onChange, count }) => (
    <label className="flex items-center gap-3 py-1.5 group cursor-pointer select-none">
        <div className={`w-4 h-4 rounded border transition-colors duration-200 flex items-center justify-center ${
            checked
                ? 'bg-accent border-accent'
                : 'border-primary/20 group-hover:border-accent/50'
        }`}>
            {checked && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className={`text-xs transition-colors duration-200 ${checked ? 'text-primary' : 'text-secondary group-hover:text-primary/80'}`}>
            {label}
        </span>
        {count !== undefined && (
            <span className="text-[10px] text-secondary/60 ml-auto">{count}</span>
        )}
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </label>
);

/* ═════════════════════════════════════════════════════════
   Компонент: Цветовой фильтр (кружок)
═════════════════════════════════════════════════════════ */
const ColorSwatch = ({ hex, name, selected, onClick }) => (
    <button
        onClick={onClick}
        title={name}
        className="group relative w-10 h-10 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        style={{
            backgroundColor: hex,
            boxShadow: selected
                ? `0 0 0 2.5px rgb(var(--color-background)), 0 0 0 4.5px rgb(var(--color-accent))`
                : 'none',
            transition: 'box-shadow 0.3s ease-out, transform 0.3s ease-out',
        }}
        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
        {/* Тултип */}
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-surface text-primary text-[10px] px-2 py-1 rounded-md shadow-elevated opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
            {name}
        </span>
    </button>
);

/* Определить светлый цвет */
const isLightColor = (hex) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 155;
};

/* ═════════════════════════════════════════════════════════
   Компонент: Выпадающий список сортировки
═════════════════════════════════════════════════════════ */
const SortDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const dropdownRef = useRef(null);

    const currentLabel = SORT_OPTIONS.find(o => o.value === value)?.label || 'По популярности';

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!dropdownRef.current) return;
        if (open) {
            gsap.killTweensOf(dropdownRef.current);
            gsap.fromTo(dropdownRef.current,
                { opacity: 0, y: 6, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
            );
        }
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface rounded-xl border border-primary/8 text-xs text-primary/80 hover:border-accent/30 transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
                <span>{currentLabel}</span>
                <ChevronIcon open={open} />
            </button>
            {open && (
                <div
                    ref={dropdownRef}
                    className="absolute bottom-full right-0 mb-2 bg-surface border border-primary/8 rounded-xl shadow-floating overflow-hidden z-30 min-w-[200px]"
                >
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-xs transition-colors duration-200 cursor-pointer ${
                                value === opt.value
                                    ? 'text-accent bg-accent/5'
                                    : 'text-primary/70 hover:bg-primary/5 hover:text-primary'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

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
const ProductCard = ({ product, viewMode, categoryMap = {} }) => {
    if (viewMode === 'list') {
        return (
            <Link
                to={`/product/${product.slug}`}
                className="product-card group flex gap-6 md:gap-10 opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl p-4 hover:bg-surface/50 transition-colors duration-300"
            >
                <div className="w-40 md:w-56 flex-shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-surface shadow-elevated group-hover:shadow-floating transition-shadow duration-500 relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        width="224"
                        height="168"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span className="text-[10px] text-secondary uppercase tracking-widest mb-2">{categoryMap[product.category] || product.category}</span>
                    <h3 className="text-xl md:text-2xl font-serif text-primary group-hover:text-accent transition-colors duration-300 mb-2 truncate">{product.name}</h3>
                    <p className="text-sm text-secondary leading-relaxed mb-3 line-clamp-2 hidden md:block">{product.description}</p>
                    <span className="text-lg font-serif text-primary/90">{product.price.toLocaleString()} ₽</span>
                </div>
            </Link>
        );
    }

    return (
        <Link
            to={`/product/${product.slug}`}
            className="product-card group block opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl transition-transform duration-500 ease-spring hover:-translate-y-2"
        >
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
            <div className="pt-4 px-2">
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent transition-colors duration-300 ease-spring">{product.name}</h3>
                    <span className="text-lg font-serif text-primary/90">{product.price.toLocaleString()} ₽</span>
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

    // ── Состояния фильтров ──
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('popular');
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Извлечение данных для фильтров ──
    const categories = useMemo(() => Object.keys(CATEGORY_MAP), [CATEGORY_MAP]);
    const allMaterials = useMemo(() => extractMaterials(products), [products]);
    const allColors = useMemo(() => extractColors(products), [products]);

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

        // Материалы
        if (selectedMaterials.length > 0) {
            result = result.filter(p => {
                if (!p.details) return false;
                return selectedMaterials.some(mat =>
                    p.details.some(d => d.value.includes(mat))
                );
            });
        }

        // Цвета
        if (selectedColors.length > 0) {
            result = result.filter(p => {
                if (!p.colors) return false;
                return selectedColors.some(hex =>
                    p.colors.some(c => c.hex === hex)
                );
            });
        }

        // Сортировка
        switch (sort) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default: // 'popular' — оригинальный порядок
                break;
        }

        return result;
    }, [products, search, category, selectedMaterials, selectedColors, sort]);

    // ── Активные теги фильтров ──
    const activeFilters = useMemo(() => {
        const tags = [];
        if (category !== 'All') {
            tags.push({ type: 'category', value: category, label: CATEGORY_MAP[category] || category });
        }
        selectedMaterials.forEach(mat => {
            tags.push({ type: 'material', value: mat, label: mat });
        });
        selectedColors.forEach(hex => {
            const c = allColors.find(c => c.hex === hex);
            tags.push({ type: 'color', value: hex, label: c?.name || hex });
        });
        if (search.trim()) {
            tags.push({ type: 'search', value: search, label: `«${search}»` });
        }
        return tags;
    }, [category, selectedMaterials, selectedColors, search, allColors]);

    const removeFilter = useCallback((filter) => {
        switch (filter.type) {
            case 'category': setCategory('All'); break;
            case 'material': setSelectedMaterials(prev => prev.filter(m => m !== filter.value)); break;
            case 'color': setSelectedColors(prev => prev.filter(c => c !== filter.value)); break;
            case 'search': setSearch(''); break;
        }
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearch('');
        setCategory('All');
        setSelectedMaterials([]);
        setSelectedColors([]);
    }, []);

    // ── Тоглы материалов и цветов ──
    const toggleMaterial = useCallback((mat) => {
        setSelectedMaterials(prev =>
            prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
        );
    }, []);

    const toggleColor = useCallback((hex) => {
        setSelectedColors(prev =>
            prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
        );
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
    }, [filteredProducts, viewMode]);

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

    // ── Закрытие мобильного сайдбара ──
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

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

                {/* ═══ TOOLBAR: Счётчик + Вид + Сортировка + Кнопка фильтров (mobile) ═══ */}
                <div className="flex items-center justify-between mb-8 catalog-reveal">
                    <div className="flex items-center gap-4">
                        {/* Мобильная кнопка фильтров */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-surface border border-primary/8 rounded-xl text-xs text-primary/70 hover:border-accent/30 transition-colors duration-300 cursor-pointer"
                        >
                            <FilterIcon />
                            <span>Фильтры</span>
                            {(selectedMaterials.length + selectedColors.length) > 0 && (
                                <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                                    {selectedMaterials.length + selectedColors.length}
                                </span>
                            )}
                        </button>

                        {/* Счётчик товаров */}
                        <p className="text-sm text-secondary">
                            <span className="text-primary font-medium">{filteredProducts.length}</span>{' '}
                            {pluralProducts(filteredProducts.length)}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Переключатель вида: сетка / список */}
                        <div className="hidden md:flex items-center gap-1 bg-surface border border-primary/8 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${viewMode === 'grid' ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                                title="Сетка"
                            >
                                <GridIcon active={viewMode === 'grid'} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer ${viewMode === 'list' ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                                title="Список"
                            >
                                <ListIcon active={viewMode === 'list'} />
                            </button>
                        </div>

                        {/* Сортировка */}
                        <SortDropdown value={sort} onChange={setSort} />
                    </div>
                </div>

                {/* Активные теги фильтров */}
                <ActiveFilters
                    filters={activeFilters}
                    onRemove={removeFilter}
                    onClearAll={clearAllFilters}
                />

                {/* ═══ ОСНОВНОЙ КОНТЕНТ: Сайдбар + Сетка товаров ═══ */}
                <div className="flex gap-10 lg:gap-14">

                    {/* ── Десктопный сайдбар (скрыт на мобилках) ── */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 catalog-reveal">
                        <div className="sticky top-32">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6">Фильтры</h3>

                            {/* Фильтр: Тип мебели */}
                            <FilterSection title="Тип мебели" defaultOpen={true}>
                                <div className="space-y-0.5">
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <FilterCheckbox
                                            key={cat}
                                            label={CATEGORY_MAP[cat]}
                                            checked={category === cat}
                                            onChange={() => setCategory(category === cat ? 'All' : cat)}
                                            count={categoryCounts[cat]}
                                        />
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Фильтр: Материал */}
                            {allMaterials.length > 0 && (
                                <FilterSection title="Материал" defaultOpen={true}>
                                    <div className="space-y-0.5">
                                        {allMaterials.map(mat => (
                                            <FilterCheckbox
                                                key={mat}
                                                label={mat}
                                                checked={selectedMaterials.includes(mat)}
                                                onChange={() => toggleMaterial(mat)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Фильтр: Цвет */}
                            {allColors.length > 0 && (
                                <FilterSection title="Цвет" defaultOpen={true}>
                                    <div className="flex flex-wrap gap-3.5 py-1">
                                        {allColors.map(c => (
                                            <ColorSwatch
                                                key={c.hex}
                                                hex={c.hex}
                                                name={c.name}
                                                selected={selectedColors.includes(c.hex)}
                                                onClick={() => toggleColor(c.hex)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Кнопка сброса */}
                            {activeFilters.length > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="mt-6 w-full py-3 text-[11px] uppercase tracking-[0.15em] text-secondary hover:text-accent border border-primary/8 rounded-xl hover:border-accent/30 transition-colors duration-300 cursor-pointer"
                                >
                                    Сбросить все фильтры
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ── Мобильный сайдбар (оверлей) ── */}
                    <>
                        {/* Backdrop */}
                        <div
                            className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-400 ease-out ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={closeSidebar}
                        />
                        {/* Панель */}
                        <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background z-50 lg:hidden overflow-y-auto shadow-floating p-6 pt-8 transition-transform duration-400 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent">Фильтры</h3>
                                    <button
                                        onClick={closeSidebar}
                                        className="p-2 hover:bg-primary/5 rounded-lg transition-colors duration-200 cursor-pointer"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>

                                {/* Тип мебели */}
                                <FilterSection title="Тип мебели" defaultOpen={true}>
                                    <div className="space-y-0.5">
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <FilterCheckbox
                                                key={cat}
                                                label={CATEGORY_MAP[cat]}
                                                checked={category === cat}
                                                onChange={() => setCategory(category === cat ? 'All' : cat)}
                                                count={categoryCounts[cat]}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Материал */}
                                {allMaterials.length > 0 && (
                                    <FilterSection title="Материал" defaultOpen={true}>
                                        <div className="space-y-0.5">
                                            {allMaterials.map(mat => (
                                                <FilterCheckbox
                                                    key={mat}
                                                    label={mat}
                                                    checked={selectedMaterials.includes(mat)}
                                                    onChange={() => toggleMaterial(mat)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>
                                )}

                                {/* Цвет */}
                                {allColors.length > 0 && (
                                    <FilterSection title="Цвет" defaultOpen={true}>
                                        <div className="flex flex-wrap gap-3.5 py-1">
                                            {allColors.map(c => (
                                                <ColorSwatch
                                                    key={c.hex}
                                                    hex={c.hex}
                                                    name={c.name}
                                                    selected={selectedColors.includes(c.hex)}
                                                    onClick={() => toggleColor(c.hex)}
                                                />
                                            ))}
                                        </div>
                                    </FilterSection>
                                )}

                                {/* Кнопки */}
                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={closeSidebar}
                                        className="w-full py-3 bg-accent text-white text-[11px] uppercase tracking-[0.15em] rounded-xl hover:bg-accent/90 transition-colors duration-300 cursor-pointer"
                                    >
                                        Показать {filteredProducts.length} {pluralProducts(filteredProducts.length)}
                                    </button>
                                    {activeFilters.length > 0 && (
                                        <button
                                            onClick={() => { clearAllFilters(); closeSidebar(); }}
                                            className="w-full py-3 text-[11px] uppercase tracking-[0.15em] text-secondary hover:text-accent border border-primary/8 rounded-xl hover:border-accent/30 transition-colors duration-300 cursor-pointer"
                                        >
                                            Сбросить все фильтры
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>

                    {/* ── Сетка товаров ── */}
                    <div className="flex-1 min-w-0">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} viewMode="grid" categoryMap={CATEGORY_MAP} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} viewMode="list" categoryMap={CATEGORY_MAP} />
                                ))}
                            </div>
                        )}

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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
