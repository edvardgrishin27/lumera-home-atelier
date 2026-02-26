import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { products as defaultProductsList } from '../data/products';
import { blogContent } from '../data/blogContent';
import * as api from '../utils/api';
import { useToast } from '../components/Toast';

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
        foundersLabel: 'Основатели',
        foundersTitle: 'За каждым\nвеликим брендом',
        foundersSubtitle: 'стоят люди, которые превращают видение в реальность',
        founder1Name: 'Вероника Миллер',
        founder1Role: 'Сооснователь бренда',
        founder1Image: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/founder-veronika.jpg',
        founder1Quote: 'Я не продаю шкафы и кухни. Я создаю пространство, которое отражает статус владельца, его вкус и его уровень жизни.',
        founder1Bio: 'Более 7 лет в e-commerce и премиальном сегменте. Работала с элитной недвижимостью в компании Vesper — опыт, который невозможно получить в массовом рынке. Основала консалтинговую компанию «Маркетактив» и образовательную платформу с государственной лицензией. Магистр МГУ им. Ломоносова.',
        founder1FullBio: 'Меня зовут Вероника Миллер. Более 7 лет я работаю в e-commerce и премиальном сегменте. Моя профессиональная среда — клиенты, которые выбирают не дешевле, а лучше.\n\nЯ работала с элитной недвижимостью в компании Vesper. Это опыт, который невозможно получить в массовом рынке. Здесь клиент мыслит иначе: он оценивает уровень, детали, эстетику, сервис и глубину подхода. Я понимаю эту логику выбора и знаю, какие стандарты являются по-настоящему высокими.\n\nЯ основала консалтинговую компанию «Маркетактив» и образовательную платформу с государственной лицензией. Более 250 выпускников — предприниматели, которые масштабируют бизнес и работают в системном подходе.\n\nЯ магистр МГУ им. Ломоносова, и для меня фундаментальность и качество — не слова, а принцип работы.\n\nМои экспертные материалы публикуют РБК, «Секреты фирмы», «Бизнес-Секреты». Это подтверждение профессиональной репутации и экспертности на федеральном уровне.\n\nМебель для меня — это не предмет. Это среда, в которой человек живет каждый день. Работая с премиальным сегментом, я четко понимаю, что в интерьере важны три вещи: точность исполнения, безупречный сервис и ощущение уровня.\n\nНастоящий премиум — это когда качество не обсуждается, сроки соблюдаются, а процесс взаимодействия комфортен и предсказуем.',
        founder1Expertise: 'Премиальный сервис • Стратегическое управление • E-commerce • Построение бренда',
        founder2Name: 'Эдвард Гришин',
        founder2Role: 'Сооснователь бренда',
        founder2Image: 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/pages/founder-edward.jpg',
        founder2Quote: 'Наша задача — создавать не просто мебель на заказ, а продукт, который соответствует уровню клиентов, привыкших к лучшему.',
        founder2Bio: 'Более 13 лет в крупнейших компаниях страны — «Технопарк», «Купер», «Sunlight», «Яндекс Маркет». Формировал и масштабировал бизнесы федерального уровня с миллиардными оборотами. Глубоко изучил, что такое настоящая премиальность — не как маркетинговый термин, а как системный подход к продукту, сервису и клиентскому опыту.',
        founder2FullBio: 'Меня зовут Эдвард Гришин. Более 13 лет я работаю в крупнейших компаниях страны, формируя и масштабируя бизнесы федерального уровня. Мой опыт охватывает ритейл, e-commerce, маркетплейсы, цифровые продукты и операционное управление.\n\nЯ работал в таких компаниях, как «Технопарк», «Купер», «Sunlight» и «Яндекс Маркет», где отвечал за развитие направлений с миллиардными оборотами. За эти годы я глубоко изучил, что такое настоящая премиальность — не как маркетинговый термин, а как системный подход к продукту, сервису и клиентскому опыту.\n\nПремиальность — это безупречное качество материалов и исполнения, внимание к деталям на каждом этапе, прозрачность процессов, сервис, который превосходит ожидания, и ощущение статуса и уверенности, которое получает клиент.\n\nРаботая с ювелирным сегментом и высокомаржинальными категориями, я научился выстраивать продукт таким образом, чтобы он воспринимался не как покупка, а как инвестиция в стиль жизни.\n\nЯ занимался развитием бизнеса на маркетплейсах, запуском новых направлений, цифровой трансформацией и масштабированием e-commerce. Управлял большими кросс-функциональными командами — от маркетинга и продукта до IT и логистики.\n\nМое ключевое преимущество — системное понимание того, как строится устойчивый бизнес: экономика продукта, операционная эффективность, контроль качества, бренд-позиционирование, работа с клиентским опытом.\n\nМебель — это не просто предмет интерьера. Это пространство, в котором живет человек. Это ежедневный контакт с качеством, формой, тактильностью и комфортом. Создавая этот бренд, я объединил свой опыт в премиальном ритейле, системном управлении и глубоком понимании клиентского ожидания.',
        founder2Expertise: 'Экономика продукта • Операционная эффективность • Бренд-позиционирование • Работа с клиентским опытом',
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
            { id: 5, slug: "kak-vybrat-divan-polnoe-rukovodstvo", title: "Как выбрать диван: полное руководство по размерам, наполнителю и обивке", date: "20 Февраля, 2026", category: "Гид по выбору", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/products/milano-sofa.jpg", excerpt: "Как выбрать диван для гостиной или спальни — размеры, типы наполнителей, обивка, механизмы трансформации. Подробный гид от экспертов Lumera Home Atelier.", content: blogContent['kak-vybrat-divan-polnoe-rukovodstvo'] },
            { id: 6, slug: "kak-vybrat-krovat-razmer-matras-material", title: "Как выбрать кровать: размеры, тип матраса и материалы каркаса", date: "18 Февраля, 2026", category: "Гид по выбору", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/products/milano-gallery-3.jpg", excerpt: "Полное руководство по выбору кровати — стандартные размеры, какой матрас выбрать, из чего должен быть каркас. Советы от дизайнеров Lumera Home Atelier.", content: blogContent['kak-vybrat-krovat-razmer-matras-material'] },
            { id: 7, slug: "razmery-divanov-tablitsa-standarty", title: "Размеры диванов: стандартные габариты, таблица и как выбрать по комнате", date: "22 Февраля, 2026", category: "Гид по выбору", image: "https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera/products/milano-gallery-4.jpg", excerpt: "Все стандартные размеры диванов в одной таблице — прямые, угловые, модульные. Как рассчитать размер дивана для вашей комнаты. Советы от Lumera.", content: blogContent['razmery-divanov-tablitsa-standarty'] },
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
    workflow: {
        label: 'Как мы работаем',
        title: '5 прозрачных этапов',
        titleAccent: 'от идеи до интерьера',
        description: 'Каждый этап согласовывается с вами. Вы всегда знаете, что происходит с вашим заказом, получаете фотоотчёты и полный контроль на каждом шаге.',
        steps: [
            { number: '01', title: 'Консультация и подбор', description: 'Обсуждаем ваши пожелания, стиль интерьера и бюджет. Подбираем оптимальные варианты мебели из каталога или по индивидуальным параметрам. Отвечаем на все вопросы о материалах, сроках и доставке.' },
            { number: '02', title: 'Договор и предоплата', description: 'Заключаем договор с полным описанием заказа: наименования, размеры, материалы, сроки. Вы вносите предоплату 50% и мы приступаем к оформлению заказа на фабрике.' },
            { number: '03', title: 'Производство и контроль', description: 'Мебель изготавливается на фабрике в Китае. Наш представитель контролирует качество на каждом этапе: от подбора материалов до финальной сборки. Отправляем фото- и видеоотчёты.' },
            { number: '04', title: 'Доставка до двери', description: 'Организуем логистику от фабрики до вашего адреса. Мебель упаковывается в защитную тару, проходит таможенное оформление и доставляется транспортной компанией по всей России.' },
            { number: '05', title: 'Приёмка и гарантия', description: 'Вы проверяете мебель при получении. Вносите оставшиеся 50%. На всю продукцию предоставляется гарантия 12 месяцев. Мы остаёмся на связи для любых вопросов по уходу и эксплуатации.' },
        ],
        ctaTitle: 'Готовы начать?',
        ctaDescription: 'Оставьте заявку, и мы свяжемся с вами для бесплатной консультации. Поможем подобрать мебель под ваш интерьер и бюджет.',
        ctaButton: 'Оставить заявку',
    },
    returns: {
        label: 'Покупателям',
        title: 'Возврат и обмен',
        sections: [
            { title: 'Общие положения', text: 'Lumera Home Atelier работает в соответствии с Законом РФ «О защите прав потребителей» от 07.02.1992 № 2300-1 (ст. 26.1).\n\nВся продукция Lumera изготавливается по индивидуальному заказу клиента: с учётом выбранных размеров, материалов, цвета обивки и конфигурации. Такие товары имеют индивидуально-определённые свойства.' },
            { title: 'Товары надлежащего качества', text: 'Согласно законодательству РФ, товары надлежащего качества, изготовленные по индивидуальному заказу, возврату и обмену не подлежат.\n\nЭто относится к мебели, произведённой с учётом персональных пожеланий клиента: выбранная ткань, размер, конфигурация, цвет и материалы.' },
            { title: 'Товары ненадлежащего качества', text: 'Если при получении вы обнаружили производственный брак или несоответствие заказу, мы гарантируем:\n• Бесплатную замену изделия на аналогичное или идентичное\n• При отсутствии необходимого варианта отделки — подбор схожего решения или полный возврат стоимости\n• Рассмотрение обращения в течение 5 рабочих дней' },
            { title: 'Порядок обращения', text: 'Для оформления возврата или обмена свяжитесь с нами:\n1. Напишите на info@lumerahome.ru с описанием проблемы и фотографиями\n2. Укажите номер заказа и дату получения\n3. Мы рассмотрим обращение и предложим решение' },
        ],
    },
    guarantee: {
        label: 'Покупателям',
        title: 'Гарантии',
        sections: [
            { title: 'Гарантийный срок', text: 'На всю продукцию Lumera Home Atelier предоставляется гарантия 12 месяцев со дня передачи товара покупателю.\n\nВ течение гарантийного срока мы несём полную ответственность за производственные дефекты и скрытые недостатки изделия.' },
            { title: 'Что покрывает гарантия', text: '• Дефекты каркаса и несущих конструкций\n• Неисправности механизмов трансформации\n• Отклонения обивочных материалов от заявленных характеристик\n• Несоответствие размеров или комплектации договору' },
            { title: 'Ограничения гарантии', text: 'Гарантия не распространяется на:\n— Повреждения, вызванные нарушением условий эксплуатации\n— Естественный износ материалов при регулярном использовании\n— Механические повреждения, нанесённые после получения\n— Следствия самостоятельного ремонта или модификации' },
            { title: 'Гарантийное обслуживание', text: 'В случае подтверждения гарантийного случая:\n1. Изделие будет заменено на аналогичное или идентичное\n2. При отсутствии необходимых материалов — подбираем схожий вариант или оформляем полный возврат стоимости\n3. Срок рассмотрения обращения — до 5 рабочих дней' },
            { title: 'Рекомендации по уходу', text: 'Для продления срока службы мебели рекомендуем соблюдать инструкцию по эксплуатации, которая является частью договора. Подробные рекомендации по уходу за конкретными материалами предоставляются при покупке.' },
        ],
    },
    catalog: {
        categories: [
            { key: 'Sofas', label: 'Диваны' },
            { key: 'Armchairs', label: 'Кресла' },
            { key: 'Tables', label: 'Столы' },
            { key: 'Chairs', label: 'Стулья' },
            { key: 'Beds', label: 'Кровати' },
            { key: 'Wardrobes', label: 'Шкафы' },
            { key: 'Dressers', label: 'Комоды' },
            { key: 'Shelves', label: 'Стеллажи' },
        ],
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
const CACHE_VERSION_KEY = 'lumera_content_v';
const CACHE_VERSION = 9; // bump to invalidate stale localStorage cache

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
    let toast;
    try { toast = useToast(); } catch { toast = { success: () => {}, error: () => {}, info: () => {} }; }

    const [content, setContent] = useState(() => {
        // Initial render: use localStorage cache or defaults
        try {
            const ver = localStorage.getItem(CACHE_VERSION_KEY);
            if (parseInt(ver) !== CACHE_VERSION) {
                // Cache is stale — clear and use fresh defaults
                localStorage.removeItem(CACHE_KEY);
                localStorage.setItem(CACHE_VERSION_KEY, String(CACHE_VERSION));
                return defaultContent;
            }
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
                // Deep merge: ensure default fields are always present even when API returns partial data
                const merged = { ...defaultContent, ...data };

                // Merge home: keep API fields but preserve default-only fields (reviews, whyItems, etc.)
                if (defaultContent.home) {
                    merged.home = {
                        ...defaultContent.home,
                        ...(data.home || {}),
                    };
                }

                // Merge about: preserve new founder fields when API returns older data without them
                if (defaultContent.about) {
                    merged.about = {
                        ...defaultContent.about,
                        ...(data.about || {}),
                    };
                }

                // Merge workflow/returns/guarantee: keep defaults when API doesn't have them
                ['workflow', 'returns', 'guarantee'].forEach(key => {
                    if (defaultContent[key]) {
                        merged[key] = {
                            ...defaultContent[key],
                            ...(data[key] || {}),
                        };
                    }
                });

                // Merge catalog: preserve default categories when API doesn't have them yet
                if (defaultContent.catalog) {
                    merged.catalog = {
                        ...defaultContent.catalog,
                        ...(data.catalog || {}),
                    };
                    // If API has categories, use them; otherwise keep defaults
                    if (data.catalog?.categories) {
                        merged.catalog.categories = data.catalog.categories;
                    }
                }

                // Merge blog posts: keep API posts, add any defaults missing from API
                if (defaultContent.blog?.posts) {
                    const apiPosts = data.blog?.posts || [];
                    const apiSlugs = new Set(apiPosts.map(p => p.slug));
                    const missingDefaults = defaultContent.blog.posts.filter(p => !apiSlugs.has(p.slug));
                    merged.blog = {
                        ...defaultContent.blog,
                        ...(data.blog || {}),
                        posts: [...apiPosts, ...missingDefaults],
                    };
                }

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

    // ─── Debounced save timer for rapid edits (e.g. typing in text fields) ───
    const saveTimers = useRef({});

    const debouncedSave = useCallback((key, saveFn, delay = 800) => {
        if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
        saveTimers.current[key] = setTimeout(() => {
            saveFn()
                .then(() => toast.success('Сохранено'))
                .catch(err => {
                    console.error(`[content] Failed to save ${key}:`, err.message);
                    toast.error('Ошибка сохранения');
                });
        }, delay);
    }, [toast]);

    // ─── Section update (optimistic UI + debounced API call) ───
    const updateHome = useCallback((field, value) => {
        setContent(prev => {
            const updated = { ...prev, home: { ...prev.home, [field]: value } };
            debouncedSave('home', () => api.updateSection('home', updated.home));
            return updated;
        });
    }, [debouncedSave]);

    const updateSettings = useCallback((field, value) => {
        setContent(prev => {
            const updated = { ...prev, settings: { ...prev.settings, [field]: value } };
            debouncedSave('settings', () => api.updateSection('settings', updated.settings));
            return updated;
        });
    }, [debouncedSave]);

    const updateContentPage = useCallback((pageName, field, value) => {
        setContent(prev => {
            const updated = { ...prev, [pageName]: { ...prev[pageName], [field]: value } };
            debouncedSave(pageName, () => api.updateSection(pageName, updated[pageName]));
            return updated;
        });
    }, [debouncedSave]);

    // ─── Product operations (optimistic UI + API call + toast + rollback) ───
    const updateProduct = useCallback((productId, updates) => {
        setContent(prev => {
            const product = prev.products.find(p => p.id === productId);
            if (!product) return prev;

            const merged = { ...product, ...updates };
            const { id, ...data } = merged;
            debouncedSave(`product-${productId}`, () =>
                api.updateProduct(productId, { slug: merged.slug, ...data })
                    .then(res => {
                        // Server is canonical source of slug — update frontend state
                        if (res?.slug && res.slug !== merged.slug) {
                            setContent(prev2 => ({
                                ...prev2,
                                products: prev2.products.map(p =>
                                    p.id === productId ? { ...p, slug: res.slug } : p
                                ),
                            }));
                        }
                        return res;
                    })
            );

            return {
                ...prev,
                products: prev.products.map(p => p.id === productId ? merged : p),
            };
        });
    }, [debouncedSave]);

    const addProduct = useCallback((product) => {
        const tempId = Date.now();
        const newProduct = { ...product, id: tempId };

        setContent(prev => ({
            ...prev,
            products: [...prev.products, newProduct],
        }));

        const { id, ...data } = newProduct;
        api.createProduct({ slug: product.slug, ...data })
            .then((res) => {
                setContent(prev => ({
                    ...prev,
                    products: prev.products.map(p =>
                        p.id === tempId ? { ...p, id: res.id, slug: res.slug || p.slug } : p
                    ),
                }));
                toast.success('Товар добавлен');
            })
            .catch(err => {
                console.error('[content] Failed to create product:', err.message);
                toast.error('Ошибка создания товара');
                setContent(prev => ({
                    ...prev,
                    products: prev.products.filter(p => p.id !== tempId),
                }));
            });
    }, [toast]);

    const deleteProduct = useCallback((productId) => {
        // Save previous state for rollback
        setContent(prev => {
            const prevProducts = prev.products;
            const updated = { ...prev, products: prev.products.filter(p => p.id !== productId) };

            api.deleteProduct(productId)
                .then(() => toast.success('Товар удалён'))
                .catch(err => {
                    console.error('[content] Failed to delete product:', err.message);
                    toast.error('Ошибка удаления');
                    // Rollback
                    setContent(p => ({ ...p, products: prevProducts }));
                });

            return updated;
        });
    }, [toast]);

    const reorderProducts = useCallback((newOrder) => {
        setContent(prev => {
            const prevProducts = prev.products;
            const ids = newOrder.map(p => p.id);

            api.reorderProducts(ids)
                .then(() => toast.success('Порядок сохранён'))
                .catch(err => {
                    console.error('[content] Failed to reorder products:', err.message);
                    toast.error('Ошибка сортировки');
                    // Rollback
                    setContent(p => ({ ...p, products: prevProducts }));
                });

            return { ...prev, products: newOrder };
        });
    }, [toast]);

    const resetToDefaults = useCallback(() => {
        setContent(defaultContent);
        localStorage.removeItem(CACHE_KEY);
        api.resetContent()
            .then(() => toast.success('Сброшено к настройкам по умолчанию'))
            .catch(err => {
                console.error('[content] Failed to reset on server:', err.message);
                toast.error('Ошибка сброса');
            });
    }, [toast]);

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
