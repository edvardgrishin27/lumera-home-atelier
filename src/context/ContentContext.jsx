import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as defaultProducts } from '../data/products';

// Default content for editable sections
const defaultContent = {
    // Home Page
    home: {
        heroTitle1: 'LIVING',
        heroTitle2: 'ART',
        heroTitle3: 'FORMS',
        heroImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2669', // Bright, airy premium space
        heroDescription: 'Мы находим и доставляем предметы коллекционного дизайна, которые меняют восприятие пространства.',
        quoteText: 'Мебель не должна доминировать над пространством. Она должна создавать тишину, в которой слышен голос вашей жизни.',
        hitsTitle: 'Хиты продаж',
        hitsLink: 'Перейти в каталог',
        productView: 'Подробнее',
    },
    // Content Pages
    about: {
        title: 'О нас',
        subtitle: 'Коллекционный дизайн как образ жизни',
        description1: 'Мы не просто продаем мебель. Мы курируем эстетику вашего пространства. Lumera была основана с идеей объединить вневременной дизайн и безупречное качество.',
        description2: 'Каждый предмет в нашей коллекции проходит строгий отбор. Мы работаем напрямую с фабриками, которые разделяют наши ценности: уважение к материалу, любовь к форме и внимание к деталям.',
        image1: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2600', // Premium light minimal interior
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
        image1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2600', // Premium luxury restaurant interior
        image2: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2600', // Dark premium office
        formTitle: 'Стать партнером',
        formSubtitle: 'Заполните форму, и ваш персональный менеджер свяжется с вами сегодня',
    },
    blog: {
        title: 'Блог',
        subtitle: 'Журнал',
        mainTitle: 'Заметки\nоб эстетике',
        readMoreBtn: 'Читать статью',
        posts: [
            {
                id: 1,
                title: "Тренды 2026: Возвращение к тактильности",
                date: "12 Февраля, 2026",
                category: "Интерьер",
                image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2600",
                excerpt: "Как цифровизация заставляет нас искать спасение в натуральных фактурах: букле, необработанном шелке и брашированном дубе."
            },
            {
                id: 2,
                title: "Философия пустоты. Меньше, но лучше.",
                date: "05 Февраля, 2026",
                category: "Лайфстайл",
                image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=2600",
                excerpt: "Почему премиальные интерьеры отказываются от лишнего декора в пользу архитектурности форм и правильного света."
            },
            {
                id: 3,
                title: "Коллекционный дизайн в ресторане",
                date: "28 Января, 2026",
                category: "HoReCa",
                image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=2600",
                excerpt: "Инвестиции в эмоции: как мебель лимитированных тиражей становится центром притяжения гостей."
            },
            {
                id: 4,
                title: "Эргономика лобби-баров",
                date: "15 Января, 2026",
                category: "Архитектура",
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2600",
                excerpt: "Создаем пространство для работы и отдыха, которое не уступает по статусу пятизвездочным отелям."
            }
        ]
    },
    contactPage: {
        title: 'Свяжитесь с нами',
        subtitle: 'Ждем вас в гости',
        image1: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=2600',
        quote: '"Красота рождается в диалоге."',
        connectLabel: 'Связь',
        formTitle: 'Напишите нам',
        formName: 'Имя',
        formPhone: 'Телефон',
        formSubmit: 'Отправить',
    },
    // Site Settings
    settings: {
        phone: '8 (499) 877-16-78',
        email: 'info@lumera.su',
        scheduleMSK: 'Пн-Пт 10:00 - 20:00, Сб-Вс 11:00 - 19:00',
        scheduleSPB: 'Пн-Вс 11:00 - 19:00',
        whatsapp: 'https://whatsapp.com',
        telegram: 'https://t.me/lumera',
        footerAddressLabel: 'Флагманский салон',
        footerAddress: 'г. Москва, ул. Примерная, 10',
    },
    // Products (full array)
    products: defaultProducts,
};

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(() => {
        try {
            const saved = localStorage.getItem('lumera_content');
            if (saved) {
                let parsed = JSON.parse(saved);

                // Migration: Force update premium AI images BACK to bright Unsplash images based on user feedback.
                // If it contains /images/premium/, we replace it with default.
                const revertImgUrl = (url) => url && url.includes('/images/premium/') ? null : url;

                if (parsed.home && revertImgUrl(parsed.home.heroImage) === null) parsed.home.heroImage = defaultContent.home.heroImage;
                if (parsed.about && revertImgUrl(parsed.about.image1) === null) parsed.about.image1 = defaultContent.about.image1;
                if (parsed.b2b && revertImgUrl(parsed.b2b.image1) === null) parsed.b2b.image1 = defaultContent.b2b.image1;
                if (parsed.b2b && revertImgUrl(parsed.b2b.image2) === null) parsed.b2b.image2 = defaultContent.b2b.image2;
                if (parsed.contactPage) {
                    // Always use the latest contact image
                    parsed.contactPage.image1 = defaultContent.contactPage.image1;
                }
                // Merge colors and sizes from defaultProducts into saved products (in case cache is outdated)
                if (parsed.products) {
                    parsed.products = parsed.products.map(savedProd => {
                        const defaultProd = defaultProducts.find(p => p.id === savedProd.id);
                        return {
                            ...savedProd,
                            colors: savedProd.colors?.length ? savedProd.colors : (defaultProd?.colors || []),
                            sizes: savedProd.sizes?.length ? savedProd.sizes : (defaultProd?.sizes || []),
                        };
                    });
                }

                return { ...defaultContent, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load saved content', e);
        }
        return defaultContent;
    });

    // Save to localStorage whenever content changes
    useEffect(() => {
        try {
            localStorage.setItem('lumera_content', JSON.stringify(content));
        } catch (e) {
            console.error('Failed to save content', e);
        }
    }, [content]);

    const updateHome = (field, value) => {
        setContent(prev => ({
            ...prev,
            home: { ...prev.home, [field]: value }
        }));
    };

    const updateSettings = (field, value) => {
        setContent(prev => ({
            ...prev,
            settings: { ...prev.settings, [field]: value }
        }));
    };

    const updateContentPage = (pageName, field, value) => {
        setContent(prev => ({
            ...prev,
            [pageName]: { ...prev[pageName], [field]: value }
        }));
    };

    const updateProduct = (productId, updates) => {
        setContent(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId ? { ...p, ...updates } : p
            )
        }));
    };

    const addProduct = (product) => {
        const newId = Math.max(...content.products.map(p => p.id), 0) + 1;
        setContent(prev => ({
            ...prev,
            products: [...prev.products, { ...product, id: newId }]
        }));
    };

    const deleteProduct = (productId) => {
        setContent(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== productId)
        }));
    };

    const reorderProducts = (newOrder) => {
        setContent(prev => ({
            ...prev,
            products: newOrder
        }));
    };

    const resetToDefaults = () => {
        setContent(defaultContent);
        localStorage.removeItem('lumera_content');
    };

    return (
        <ContentContext.Provider value={{
            content,
            updateHome,
            updateSettings,
            updateContentPage,
            updateProduct,
            addProduct,
            deleteProduct,
            reorderProducts,
            resetToDefaults
        }}>
            {children}
        </ContentContext.Provider>
    );
};
