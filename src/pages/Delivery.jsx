import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import SEO from '../components/SEO';

const Delivery = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-16 md:pt-40 pb-24 md:pb-20 px-6 md:px-20 min-h-screen bg-background w-full overflow-hidden">
            <SEO
                title="Доставка мебели из Китая по России — сроки, стоимость, города"
                description="Доставка мебели из Китая в Москву, СПб и регионы России. Сроки от 45 дней, бесплатная доставка от 100 000 ₽. Оплата, гарантия, возврат — Lumera Home Atelier."
                url="/delivery"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Доставка и оплата' },
                ]}
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Доставка и оплата — Lumera Home Atelier",
                        "description": "Условия доставки мебели из Китая по России, способы оплаты, гарантия и возврат",
                        "url": "https://lumerahome.ru/delivery"
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Сколько стоит доставка мебели из Китая?",
                                "acceptedAnswer": { "@type": "Answer", "text": "Бесплатная доставка по Москве при заказе от 100 000 ₽. Доставка в регионы рассчитывается индивидуально в зависимости от объёма и адреса." }
                            },
                            {
                                "@type": "Question",
                                "name": "Какие сроки доставки мебели из Китая?",
                                "acceptedAnswer": { "@type": "Answer", "text": "Стандартная мебель — 30–45 дней, мебель на заказ — 45–60 дней, сложные индивидуальные проекты — 60–90 дней. Сроки включают производство, контроль качества и логистику." }
                            },
                            {
                                "@type": "Question",
                                "name": "Какие способы оплаты доступны?",
                                "acceptedAnswer": { "@type": "Answer", "text": "Для физических лиц: банковский перевод, оплата картой. Для юридических лиц: безналичный расчёт с НДС. Также доступна рассрочка от банков-партнёров на срок до 24 месяцев." }
                            },
                            {
                                "@type": "Question",
                                "name": "Есть ли гарантия на мебель?",
                                "acceptedAnswer": { "@type": "Answer", "text": "Да, на всю мебель предоставляется гарантия 24 месяца от производителя. Гарантия покрывает дефекты каркаса, наполнителя и фурнитуры." }
                            },
                            {
                                "@type": "Question",
                                "name": "Можно ли вернуть мебель?",
                                "acceptedAnswer": { "@type": "Answer", "text": "Возврат возможен в течение 14 дней при сохранении товарного вида. Мебель, изготовленная по индивидуальному заказу, обмену и возврату не подлежит." }
                            }
                        ]
                    }
                ]}
            />

            <div className="max-w-[1600px] mx-auto content-layer">

                {/* Header */}
                <div className="mb-24 reveal">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 block">Условия</span>
                    <h1 className="text-6xl md:text-8xl font-serif font-thin text-primary tracking-tightest leading-[0.9] mb-8">
                        Доставка<br />и оплата
                    </h1>
                    <p className="text-xl md:text-2xl font-serif max-w-2xl text-primary/70 leading-relaxed">
                        Мы берём на себя все этапы логистики — от контроля на фабрике до сборки в вашей квартире. Прозрачные сроки, честные цены, полная страховка.
                    </p>
                </div>

                {/* How it works — Process Steps */}
                <div className="mb-32 reveal">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary mb-16 tracking-tight">Как это работает</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                        {[
                            { step: '01', title: 'Заказ и предоплата', desc: 'Вы выбираете мебель, согласовываете детали с менеджером. Предоплата 50% — и заказ отправляется на фабрику.' },
                            { step: '02', title: 'Производство', desc: 'Изготовление от 30 до 60 дней в зависимости от сложности. Фотоотчёт на каждом этапе: каркас, обивка, финиш.' },
                            { step: '03', title: 'Контроль и отправка', desc: 'Проверка качества перед отправкой. Фото готового изделия. Оплата остатка 50%. Страхование груза.' },
                            { step: '04', title: 'Доставка и сборка', desc: 'Доставка до двери, подъём на этаж, профессиональная сборка. Вы принимаете идеальную мебель.' },
                        ].map((item) => (
                            <div key={item.step} className="group">
                                <span className="text-5xl md:text-6xl font-serif text-accent/20 group-hover:text-accent/50 transition-colors duration-500 block mb-4">{item.step}</span>
                                <h3 className="text-lg font-serif text-primary mb-3">{item.title}</h3>
                                <p className="text-sm text-primary/60 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery by Region */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary mb-16 tracking-tight reveal">География доставки</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* Moscow */}
                        <div className="bg-surface p-10 md:p-14 rounded-3xl shadow-elevated reveal group hover:shadow-hover-glow transition-shadow duration-500">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-serif text-primary mb-2">Москва и Московская область</h3>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Основной регион</span>
                                </div>
                                <span className="text-4xl font-serif text-accent/30">МСК</span>
                            </div>
                            <div className="space-y-4 text-sm text-primary/70 leading-relaxed">
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Стоимость доставки</span>
                                    <span className="font-serif text-primary">Бесплатно от 100 000 ₽</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>При заказе до 100 000 ₽</span>
                                    <span className="font-serif text-primary">3 500 ₽</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Подъём на этаж (лифт)</span>
                                    <span className="font-serif text-primary">Бесплатно</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Подъём без лифта</span>
                                    <span className="font-serif text-primary">500 ₽/этаж</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Сборка</span>
                                    <span className="font-serif text-primary">Включена</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span>Срок после готовности</span>
                                    <span className="font-serif text-primary">3–7 дней</span>
                                </div>
                            </div>
                        </div>

                        {/* SPB */}
                        <div className="bg-surface p-10 md:p-14 rounded-3xl shadow-elevated reveal group hover:shadow-hover-glow transition-shadow duration-500">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-serif text-primary mb-2">Санкт-Петербург</h3>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Прямая доставка</span>
                                </div>
                                <span className="text-4xl font-serif text-accent/30">СПБ</span>
                            </div>
                            <div className="space-y-4 text-sm text-primary/70 leading-relaxed">
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Стоимость доставки</span>
                                    <span className="font-serif text-primary">от 5 000 ₽</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Бесплатно при заказе</span>
                                    <span className="font-serif text-primary">от 150 000 ₽</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Подъём и сборка</span>
                                    <span className="font-serif text-primary">Включены от 150 000 ₽</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-primary/5">
                                    <span>Сборка (заказ до 150 000 ₽)</span>
                                    <span className="font-serif text-primary">2 500 ₽</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span>Срок после готовности</span>
                                    <span className="font-serif text-primary">5–10 дней</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Regions */}
                    <div className="bg-surface p-10 md:p-14 rounded-3xl shadow-elevated reveal">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4">
                            <div>
                                <h3 className="text-2xl font-serif text-primary mb-2">Регионы России</h3>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Транспортная компания</span>
                            </div>
                            <span className="text-4xl font-serif text-accent/30">РФ</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            <div>
                                <h4 className="text-xs uppercase tracking-[0.2em] text-primary/40 mb-4">Основные города</h4>
                                <ul className="space-y-2 text-sm text-primary/70">
                                    <li className="flex justify-between"><span>Екатеринбург</span><span className="font-serif text-primary">от 8 000 ₽</span></li>
                                    <li className="flex justify-between"><span>Новосибирск</span><span className="font-serif text-primary">от 10 000 ₽</span></li>
                                    <li className="flex justify-between"><span>Краснодар</span><span className="font-serif text-primary">от 7 000 ₽</span></li>
                                    <li className="flex justify-between"><span>Казань</span><span className="font-serif text-primary">от 7 500 ₽</span></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase tracking-[0.2em] text-primary/40 mb-4">Также доставляем</h4>
                                <ul className="space-y-2 text-sm text-primary/70">
                                    <li>Нижний Новгород</li>
                                    <li>Самара</li>
                                    <li>Ростов-на-Дону</li>
                                    <li>Воронеж</li>
                                    <li>Тюмень</li>
                                    <li>Сочи</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase tracking-[0.2em] text-primary/40 mb-4">Условия</h4>
                                <ul className="space-y-3 text-sm text-primary/70 leading-relaxed">
                                    <li>Доставка транспортной компанией до терминала или до двери</li>
                                    <li>Точную стоимость рассчитаем после оформления заказа</li>
                                    <li>Срок: 7–20 дней после готовности изделия</li>
                                    <li>Страхование груза включено</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-xs text-primary/40 italic">* Доставка в любой город России. Для удалённых регионов стоимость рассчитывается индивидуально.</p>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary mb-16 tracking-tight reveal">Оплата</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-surface p-10 rounded-3xl shadow-elevated reveal group hover:shadow-hover-glow transition-shadow duration-500">
                            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                                <span className="text-accent text-2xl font-serif">₽</span>
                            </div>
                            <h3 className="text-xl font-serif text-primary mb-4">Для физических лиц</h3>
                            <ul className="space-y-3 text-sm text-primary/70 leading-relaxed">
                                <li>Предоплата 50% при оформлении заказа</li>
                                <li>Остаток 50% после фотоотчёта готового изделия</li>
                                <li>Оплата банковской картой или переводом</li>
                                <li>Рассрочка от банков-партнёров</li>
                            </ul>
                        </div>

                        <div className="bg-surface p-10 rounded-3xl shadow-elevated reveal group hover:shadow-hover-glow transition-shadow duration-500">
                            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                                <span className="text-accent text-2xl font-serif">B</span>
                            </div>
                            <h3 className="text-xl font-serif text-primary mb-4">Для юридических лиц</h3>
                            <ul className="space-y-3 text-sm text-primary/70 leading-relaxed">
                                <li>Безналичный расчёт по счёту</li>
                                <li>Работаем с НДС и без НДС</li>
                                <li>Договор поставки, полный пакет документов</li>
                                <li>Индивидуальные условия для крупных заказов</li>
                            </ul>
                        </div>

                        <div className="bg-surface p-10 rounded-3xl shadow-elevated reveal group hover:shadow-hover-glow transition-shadow duration-500">
                            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                                <span className="text-accent text-2xl font-serif">%</span>
                            </div>
                            <h3 className="text-xl font-serif text-primary mb-4">Рассрочка</h3>
                            <ul className="space-y-3 text-sm text-primary/70 leading-relaxed">
                                <li>Рассрочка 0% до 6 месяцев</li>
                                <li>Кредит до 24 месяцев через банки-партнёры</li>
                                <li>Быстрое одобрение онлайн</li>
                                <li>Без скрытых комиссий</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Guarantee & Returns */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary mb-16 tracking-tight reveal">Гарантия и возврат</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="reveal">
                            <div className="border-t border-primary/10 pt-8">
                                <h3 className="text-2xl font-serif text-primary mb-6">Гарантия — 2 года</h3>
                                <ul className="space-y-4 text-sm text-primary/70 leading-relaxed">
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Гарантия распространяется на все элементы мебели: каркас, обивку, механизмы, фурнитуру</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Бесплатный ремонт или замена при производственном браке</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Фотоотчёт с фабрики на каждом этапе производства</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Полное страхование груза на время доставки</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Проверка качества перед отправкой с фабрики — фото и видео финального изделия</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="reveal">
                            <div className="border-t border-primary/10 pt-8">
                                <h3 className="text-2xl font-serif text-primary mb-6">Возврат и обмен</h3>
                                <ul className="space-y-4 text-sm text-primary/70 leading-relaxed">
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Возврат в течение 14 дней при сохранении товарного вида (согласно закону о защите прав потребителей)</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Полный возврат средств при обнаружении производственного брака</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Бесплатный обмен при несоответствии заказанным параметрам (цвет, размер, материал)</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-accent mt-1 shrink-0">—</span>
                                        <span>Индивидуальные изделия (по размерам заказчика) обмену и возврату не подлежат, за исключением случаев брака</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Сроки производства */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary mb-16 tracking-tight reveal">Сроки производства</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal">
                        <div className="border-t-2 border-accent/20 pt-8">
                            <span className="text-5xl font-serif text-accent/40 block mb-4">30–45</span>
                            <h3 className="text-lg font-serif text-primary mb-2">дней — стандартные модели</h3>
                            <p className="text-sm text-primary/60 leading-relaxed">Диваны, кресла, столы и стулья по каталогу с выбором обивки и цвета</p>
                        </div>
                        <div className="border-t-2 border-accent/30 pt-8">
                            <span className="text-5xl font-serif text-accent/50 block mb-4">45–60</span>
                            <h3 className="text-lg font-serif text-primary mb-2">дней — индивидуальные размеры</h3>
                            <p className="text-sm text-primary/60 leading-relaxed">Мебель по вашим размерам, нестандартные конфигурации и модификации</p>
                        </div>
                        <div className="border-t-2 border-accent/40 pt-8">
                            <span className="text-5xl font-serif text-accent/60 block mb-4">60–90</span>
                            <h3 className="text-lg font-serif text-primary mb-2">дней — сложные проекты</h3>
                            <p className="text-sm text-primary/60 leading-relaxed">Комплексные B2B-проекты, мебель для отелей и ресторанов, крупные заказы</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-32">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary mb-16 tracking-tight reveal">Частые вопросы</h2>

                    <div className="space-y-0 reveal">
                        {[
                            { q: 'Можно ли приехать посмотреть образцы вживую?', a: 'Да, вы можете посетить наш шоурум в Москве по предварительной записи. Также мы бесплатно отправляем образцы тканей и материалов по всей России.' },
                            { q: 'Что если мебель повредится при доставке?', a: 'Весь груз застрахован на полную стоимость. В случае повреждения при доставке мы полностью компенсируем ущерб: бесплатный ремонт или замена изделия.' },
                            { q: 'Как я могу отслеживать статус заказа?', a: 'Ваш персональный менеджер будет присылать фотоотчёты с фабрики на каждом этапе: каркас, обивка, финишная отделка, упаковка. Также вы получите трек-номер для отслеживания доставки.' },
                            { q: 'Делаете ли вы мебель по моим чертежам?', a: 'Да, мы производим мебель по индивидуальным чертежам и эскизам. Наш дизайнер поможет адаптировать ваши идеи под технические возможности фабрики.' },
                            { q: 'Какая минимальная сумма заказа?', a: 'Минимальной суммы заказа нет — вы можете заказать один предмет мебели. Однако при заказе от 100 000 ₽ доставка по Москве бесплатна.' },
                            { q: 'Работаете ли вы с дизайнерами и архитекторами?', a: 'Да, у нас есть специальная программа для профессионалов. Скидки до 15%, приоритетное обслуживание, выделенный менеджер. Подробности на странице B2B.' },
                        ].map((item, i) => (
                            <div key={i} className="border-b border-primary/10 py-8 first:border-t">
                                <h3 className="text-lg font-serif text-primary mb-3">{item.q}</h3>
                                <p className="text-sm text-primary/60 leading-relaxed max-w-3xl">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center reveal pb-12">
                    <p className="font-serif text-2xl md:text-3xl text-primary/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Остались вопросы? Свяжитесь с нами — ответим в течение 15 минут.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/request"
                            className="px-12 py-5 bg-accent text-white text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-accent/80 transition-transform duration-500 ease-spring shadow-lg hover:shadow-[0_0_25px_rgba(196,162,101,0.4)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                        >
                            Оставить заявку
                        </Link>
                        <Link
                            to="/contact"
                            className="px-12 py-5 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] rounded-full hover:border-accent hover:text-accent transition-all duration-500 ease-spring hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                        >
                            Контакты
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Delivery;
