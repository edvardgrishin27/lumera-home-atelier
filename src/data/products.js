const S3 = 'https://s3.twcstorage.ru/0a6d6471-klikai-screenshots/lumera';

export const products = [
    {
        id: 1,
        slug: "milano-sofa",
        name: "Milano Sofa",
        category: "Sofas",
        price: 145000,
        image: `${S3}/products/milano-sofa.jpg`,
        description: "Этот диван — воплощение итальянского подхода к комфорту «дольче вита». Глубокая посадка, мягкие подушки и обивка из премиального бархата создают ощущение обволакивающего уюта. Геометрическая строгость линий уравновешивается тактильной мягкостью материалов.",
        specs: "Ширина: 240 см | Глубина: 95 см | Высота: 75 см",
        details: [
            { label: "Материал каркаса", value: "Массив дуба, фанера" },
            { label: "Наполнитель", value: "Гусиный пух, Memory Foam" },
            { label: "Обивка", value: "Итальянский бархат (Martindale > 50,000)" }
        ],
        gallery: [
            `${S3}/products/milano-sofa.jpg`,
            `${S3}/products/milano-gallery-2.jpg`,
            `${S3}/products/milano-gallery-3.jpg`,
            `${S3}/products/milano-gallery-4.jpg`
        ],
        colors: [
            { name: "Пыльная роза", hex: "#C8A99A" },
            { name: "Тёмный графит", hex: "#3A3A3A" },
            { name: "Слоновая кость", hex: "#F5F0E8" },
            { name: "Оливковый", hex: "#7A8C6E" }
        ],
        sizes: [
            { label: "200×90", value: "200 × 90 × 75 см" },
            { label: "220×95", value: "220 × 95 × 75 см" },
            { label: "240×100", value: "240 × 100 × 75 см" },
            { label: "260×100", value: "260 × 100 × 75 см" }
        ],
        video: `${S3}/video/milano-sofa.mp4`
    },
    {
        id: 2,
        slug: "zenit-armchair",
        name: "Zenit Armchair",
        category: "Armchairs",
        price: 85000,
        image: `${S3}/products/zenit-armchair.jpg`,
        description: "Минималистичное кресло с каркасом из массива дуба и обивкой букле.",
        specs: "Ширина: 80 см | Глубина: 85 см | Высота: 70 см"
    },
    {
        id: 3,
        slug: "marble-blocks",
        name: "Marble Blocks",
        category: "Tables",
        price: 120000,
        image: `${S3}/products/marble-blocks.jpg`,
        description: "Журнальный стол из каррарского мрамора с геометрическим основанием.",
        specs: "Диаметр: 100 см | Высота: 35 см"
    },
    {
        id: 4,
        slug: "oak-wave-chair",
        name: "Oak Wave Chair",
        category: "Chairs",
        price: 45000,
        image: `${S3}/products/oak-wave-chair.jpg`,
        description: "Обеденный стул из массива дуба с изогнутой спинкой.",
        specs: "Ширина: 50 см | Высота: 80 см"
    },
    {
        id: 5,
        slug: "cloud-sectional",
        name: "Cloud Sectional",
        category: "Sofas",
        price: 280000,
        image: `${S3}/products/milano-gallery-2.jpg`,
        description: "Модульный диван для максимального комфорта.",
        specs: "Ширина: 320 см | Глубина: 120 см"
    },
    {
        id: 6,
        slug: "travertine-table",
        name: "Travertine Table",
        category: "Tables",
        price: 65000,
        image: `${S3}/products/travertine-table.jpg`,
        description: "Приставной столик из натурального травертина.",
        specs: "Диаметр: 45 см | Высота: 50 см"
    }
];
