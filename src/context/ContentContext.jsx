import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as defaultProducts } from '../data/products';

// Default content for editable sections
const defaultContent = {
    // Home Page
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
    },
    // Content Pages
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
            {
                id: 1,
                slug: "trendy-2026-vozvrashhenie-k-taktilnosti",
                title: "Тренды 2026: Возвращение к тактильности",
                date: "12 Февраля, 2026",
                category: "Интерьер",
                image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/trendy-2026.jpg",
                excerpt: "Как цифровизация заставляет нас искать спасение в натуральных фактурах: букле, необработанном шелке и брашированном дубе."
            },
            {
                id: 2,
                slug: "filosofiya-pustoty",
                title: "Философия пустоты. Меньше, но лучше.",
                date: "05 Февраля, 2026",
                category: "Лайфстайл",
                image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/filosofiya-pustoty.jpg",
                excerpt: "Почему премиальные интерьеры отказываются от лишнего декора в пользу архитектурности форм и правильного света."
            },
            {
                id: 3,
                slug: "kollekcionnyj-dizajn-v-restorane",
                title: "Коллекционный дизайн в ресторане",
                date: "28 Января, 2026",
                category: "HoReCa",
                image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/blog/kollekcionnyj-dizajn.jpg",
                excerpt: "Инвестиции в эмоции: как мебель лимитированных тиражей становится центром притяжения гостей."
            },
            {
                id: 4,
                slug: "ergonomika-lobbi-barov",
                title: "Эргономика лобби-баров",
                date: "15 Января, 2026",
                category: "Архитектура",
                image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/b2b-office.jpg",
                excerpt: "Создаем пространство для работы и отдыха, которое не уступает по статусу пятизвездочным отелям."
            }
        ]
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
    // Site Settings
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

                // Migration: Move all images from Unsplash/premium to S3
                const needsS3 = (url) => url && (url.includes('images.unsplash.com') || url.includes('/images/premium/'));
                if (parsed.home && needsS3(parsed.home.heroImage)) parsed.home.heroImage = defaultContent.home.heroImage;
                if (parsed.about && needsS3(parsed.about.image1)) parsed.about.image1 = defaultContent.about.image1;
                if (parsed.b2b && needsS3(parsed.b2b.image1)) parsed.b2b.image1 = defaultContent.b2b.image1;
                if (parsed.b2b && needsS3(parsed.b2b.image2)) parsed.b2b.image2 = defaultContent.b2b.image2;
                // Migration: Update email from lumera.su to lumerahome.ru
                if (parsed.settings && parsed.settings.email && parsed.settings.email.includes('lumera.su')) parsed.settings.email = defaultContent.settings.email;
                // Migration: Add slug + migrate images to S3 for blog posts
                if (parsed.blog?.posts) {
                    parsed.blog.posts = parsed.blog.posts.map(savedPost => {
                        const defaultPost = defaultContent.blog.posts.find(p => p.id === savedPost.id);
                        if (defaultPost && !savedPost.slug) savedPost.slug = defaultPost.slug;
                        if (defaultPost && needsS3(savedPost.image)) savedPost.image = defaultPost.image;
                        return savedPost;
                    });
                }
                if (parsed.contactPage) {
                    // Always use the latest contact image
                    parsed.contactPage.image1 = defaultContent.contactPage.image1;
                }
                // Merge colors and sizes from defaultProducts into saved products (in case cache is outdated)
                if (parsed.products) {
                    parsed.products = parsed.products.map(savedProd => {
                        const defaultProd = defaultProducts.find(p => p.id === savedProd.id);
                        // Migration: Move images from Unsplash to S3
                        if (defaultProd && needsS3(savedProd.image)) savedProd.image = defaultProd.image;
                        if (defaultProd && savedProd.gallery) {
                            savedProd.gallery = defaultProd.gallery || savedProd.gallery;
                        }
                        if (defaultProd && savedProd.video && savedProd.video.includes('pexels.com')) {
                            savedProd.video = defaultProd.video;
                        }
                        // Migration: Add slug field if missing
                        if (defaultProd && !savedProd.slug) savedProd.slug = defaultProd.slug;
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
