import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { products as defaultProductsList } from '../data/products';
import * as api from '../utils/api';

// Default content (used as fallback when API is unavailable)
const defaultContent = {
    home: {
        heroTitle1: 'LIVING',
        heroTitle2: 'ART',
        heroTitle3: 'FORMS',
        heroImage: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/home-hero.jpg',
        heroDescription: 'Мы находим и доставляем предметы коллекционного дизайна, которые меняют восприятие пространства.',
        quoteText: 'Мебель не должна доминировать над пространством. Она должна создавать тишину, в которой слышен голос вашей жизни.',
        hitsTitle: 'Хиты продаж',
        hitsLink: 'Перейти в каталог',
        productView: 'Подробнее',
        reviewsTitle: 'Отзывы клиентов',
        reviewsLink: 'Все отзывы',
        reviews: [
            {
                id: 1,
                name: 'Александр Петров',
                date: 'январь 2026 г.',
                rating: 5,
                text: 'Заказывали диван Milano для нашего загородного дома. Качество превзошло все ожидания — кожа мягкая, швы идеальные. Доставили точно в срок.',
            },
            {
                id: 2,
                name: 'Марина Козлова',
                date: 'февраль 2026 г.',
                rating: 5,
                text: 'Обставили весь ресторан мебелью от Lumera. Гости постоянно спрашивают, где мы нашли такие стулья. Рекомендую для коммерческих проектов.',
            },
            {
                id: 3,
                name: 'Дмитрий Волков',
                date: 'январь 2026 г.',
                rating: 5,
                text: 'Кровать Toscana — это произведение искусства. Изголовье каретной стяжки выглядит потрясающе. Спим как в пятизвёздочном отеле.',
            },
        ],
        whyTitle: 'Почему Lumera',
        whyItems: [
            {
                number: '01',
                title: 'Ручная работа',
                description: 'Каждое изделие создаётся мастерами с 20-летним опытом. Внимание к деталям на каждом этапе производства.',
            },
            {
                number: '02',
                title: 'Премиальные материалы',
                description: 'Только лучшие породы дерева, натуральная кожа и ткани от проверенных поставщиков.',
            },
            {
                number: '03',
                title: 'Индивидуальный проект',
                description: 'Мебель по вашим размерам и пожеланиям. Бесплатная консультация дизайнера на каждом этапе.',
            },
            {
                number: '04',
                title: 'Гарантия 10 лет',
                description: 'Уверены в качестве каждого предмета. Полное сервисное обслуживание на весь гарантийный срок.',
            },
        ],
    },
    about: {
        title: 'О нас',
        subtitle: 'Коллекционный дизайн как образ жизни',
        description1: 'Мы не просто продаем мебель. Мы курируем эстетику вашего пространства. Lumera была основана с идеей объединить вневременной дизайн и безупречное качество.',
        description2: 'Каждый предмет в нашей коллекции проходит строгий отбор. Мы работаем напрямую с фабриками, которые разделяют наши ценности: уважение к материалу, любовь к форме и внимание к деталям.',
        image1: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/about.jpg',
        stats1Value: '12+',
        stats1Label: 'Лет опыта',
        stats2Value: '500+',
        stats2Label: 'Проектов',
        stats3Value: 'Эксклюзив',
        stats3Label: 'Бренды',
    },
    b2b: {
        title: 'Бизнесу',
        subtitle: 'Архитекторам, Дизайнерам и Рестораторам',
        description: 'Особое направление Lumera — комплексные интерьерные решения для бизнеса. Мы комплектуем премиальные рестораны, бутик-отели, представительские офисы и любые коммерческие пространства, где важна атмосфера. Наша команда обеспечивает прямые поставки с ведущих европейских фабрик, эксклюзивные коммерческие условия и строгую логистику под ключ.',
        image1: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/b2b-restaurant.jpg',
        image2: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/b2b-office.jpg',
        formTitle: 'Стать партнером',
        formSubtitle: 'Заполните форму, и ваш персональный менеджер свяжется с вами сегодня',
    },
    blog: {
        title: 'Блог',
        subtitle: 'Журнал',
        mainTitle: 'Заметки\nоб эстетике',
        readMoreBtn: 'Читать статью',
        posts: [
            { id: 1, slug: "trendy-2026-vozvrashhenie-k-taktilnosti", title: "Тренды 2026: Возвращение к тактильности", date: "12 Февраля, 2026", category: "Интерьер", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/trendy-2026.jpg", excerpt: "Как цифровизация заставляет нас искать спасение в натуральных фактурах: букле, необработанном шелке и брашированном дубе." },
            { id: 2, slug: "filosofiya-pustoty", title: "Философия пустоты. Меньше, но лучше.", date: "05 Февраля, 2026", category: "Лайфстайл", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/filosofiya-pustoty.jpg", excerpt: "Почему премиальные интерьеры отказываются от лишнего декора в пользу архитектурности форм и правильного света." },
            { id: 3, slug: "kollekcionnyj-dizajn-v-restorane", title: "Коллекционный дизайн в ресторане", date: "28 Января, 2026", category: "HoReCa", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/kollekcionnyj-dizajn.jpg", excerpt: "Инвестиции в эмоции: как мебель лимитированных тиражей становится центром притяжения гостей." },
            { id: 4, slug: "ergonomika-lobbi-barov", title: "Эргономика лобби-баров", date: "15 Января, 2026", category: "Архитектура", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/b2b-office.jpg", excerpt: "Создаем пространство для работы и отдыха, которое не уступает по статусу пятизвездочным отелям." },
        ],
    },
    contactPage: {
        title: 'Свяжитесь с нами',
        subtitle: 'Ждем вас в гости',
        image1: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/contact.jpg',
        quote: '"Красота рождается в диалоге."',
        connectLabel: 'Связь',
        formTitle: 'Напишите нам',
        formName: 'Имя',
        formPhone: 'Телефон',
        formSubmit: 'Отправить',
    },
    settings: {
        phone: '8 (499) 877-16-78',
        email: 'info@lumerahome.ru',
        scheduleMSK: 'Пн-Пт 10:00 - 20:00, Сб-Вс 11:00 - 19:00',
        scheduleSPB: 'Пн-Вс 11:00 - 19:00',
        whatsapp: 'https://whatsapp.com',
        telegram: 'https://t.me/lumera',
        footerAddressLabel: 'Флагманский салон',
        footerAddress: 'г. Москва, ул. Примерная, 10',
    },
    products: defaultProductsList,
};

const CACHE_KEY = 'lumera_content';

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(() => {
        // Initial render: use localStorage cache or defaults
        try {
            const saved = localStorage.getItem(CACHE_KEY);
            if (saved) return { ...defaultContent, ...JSON.parse(saved) };
        } catch (e) {
            console.error('[content] Failed to load localStorage cache', e);
        }
        return defaultContent;
    });

    const [loading, setLoading] = useState(true);
    const fetchedRef = useRef(false);

    // Fetch from API on mount
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        api.fetchContent()
            .then((data) => {
                const merged = { ...defaultContent, ...data };
                setContent(merged);
                try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch {}
                console.log('[content] Loaded from API');
            })
            .catch((err) => {
                console.warn('[content] API unavailable, using cache/defaults:', err.message);
            })
            .finally(() => setLoading(false));
    }, []);

    // Save to localStorage whenever content changes (cache for offline)
    useEffect(() => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(content));
        } catch (e) {
            console.error('[content] Failed to save cache', e);
        }
    }, [content]);

    // ─── Section update (optimistic UI + API call) ───
    const updateHome = useCallback((field, value) => {
        setContent(prev => {
            const updated = { ...prev, home: { ...prev.home, [field]: value } };
            api.updateSection('home', updated.home).catch(err =>
                console.error('[content] Failed to save home:', err.message)
            );
            return updated;
        });
    }, []);

    const updateSettings = useCallback((field, value) => {
        setContent(prev => {
            const updated = { ...prev, settings: { ...prev.settings, [field]: value } };
            api.updateSection('settings', updated.settings).catch(err =>
                console.error('[content] Failed to save settings:', err.message)
            );
            return updated;
        });
    }, []);

    const updateContentPage = useCallback((pageName, field, value) => {
        setContent(prev => {
            const updated = { ...prev, [pageName]: { ...prev[pageName], [field]: value } };
            api.updateSection(pageName, updated[pageName]).catch(err =>
                console.error(`[content] Failed to save ${pageName}:`, err.message)
            );
            return updated;
        });
    }, []);

    // ─── Product operations (optimistic UI + API call) ───
    const updateProduct = useCallback((productId, updates) => {
        setContent(prev => {
            const product = prev.products.find(p => p.id === productId);
            if (!product) return prev;

            const merged = { ...product, ...updates };
            const { id, ...data } = merged;
            api.updateProduct(productId, { slug: merged.slug, ...data }).catch(err =>
                console.error('[content] Failed to update product:', err.message)
            );

            return {
                ...prev,
                products: prev.products.map(p => p.id === productId ? merged : p),
            };
        });
    }, []);

    const addProduct = useCallback((product) => {
        // Generate a temporary ID for optimistic UI
        const tempId = Date.now();
        const newProduct = { ...product, id: tempId };

        setContent(prev => ({
            ...prev,
            products: [...prev.products, newProduct],
        }));

        // Call API and update with real ID
        const { id, ...data } = newProduct;
        api.createProduct({ slug: product.slug, ...data })
            .then((res) => {
                setContent(prev => ({
                    ...prev,
                    products: prev.products.map(p =>
                        p.id === tempId ? { ...p, id: res.id } : p
                    ),
                }));
            })
            .catch(err => {
                console.error('[content] Failed to create product:', err.message);
                // Rollback
                setContent(prev => ({
                    ...prev,
                    products: prev.products.filter(p => p.id !== tempId),
                }));
            });
    }, []);

    const deleteProduct = useCallback((productId) => {
        setContent(prev => {
            api.deleteProduct(productId).catch(err =>
                console.error('[content] Failed to delete product:', err.message)
            );
            return {
                ...prev,
                products: prev.products.filter(p => p.id !== productId),
            };
        });
    }, []);

    const reorderProducts = useCallback((newOrder) => {
        setContent(prev => {
            const ids = newOrder.map(p => p.id);
            api.reorderProducts(ids).catch(err =>
                console.error('[content] Failed to reorder products:', err.message)
            );
            return { ...prev, products: newOrder };
        });
    }, []);

    const resetToDefaults = useCallback(() => {
        setContent(defaultContent);
        localStorage.removeItem(CACHE_KEY);
        api.resetContent().catch(err =>
            console.error('[content] Failed to reset on server:', err.message)
        );
    }, []);

    return (
        <ContentContext.Provider value={{
            content,
            loading,
            updateHome,
            updateSettings,
            updateContentPage,
            updateProduct,
            addProduct,
            deleteProduct,
            reorderProducts,
            resetToDefaults,
        }}>
            {children}
        </ContentContext.Provider>
    );
};
