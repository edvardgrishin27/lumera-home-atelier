import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import SEO from '../components/SEO';

const Returns = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.ret-header', { opacity: 0, y: 50, duration: 1.2, ease: 'power3.out', delay: 0.2 });
            gsap.from('.ret-section', { opacity: 0, y: 40, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.5 });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-background min-h-screen">
            <SEO
                title="Возврат и обмен — условия | Lumera Home Atelier"
                description="Условия возврата и обмена мебели. Индивидуальные заказы, права потребителей и порядок обращения."
                url="/returns"
            />

            <section className="pt-40 md:pt-48 pb-16 md:pb-20 px-6 md:px-20">
                <div className="ret-header max-w-4xl">
                    <span className="text-accent text-[10px] md:text-xs uppercase tracking-[0.3em] font-sans block mb-6">
                        Покупателям
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-primary leading-[1.05] tracking-tight mb-8">
                        Возврат и обмен
                    </h1>
                </div>
            </section>

            <section className="px-6 md:px-20 pb-32">
                <div className="max-w-3xl space-y-12">

                    {/* Section 1 */}
                    <div className="ret-section">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Общие положения</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                Lumera Home Atelier работает в соответствии с Законом РФ &laquo;О защите прав потребителей&raquo; от 07.02.1992 &#8470; 2300-1 (ст. 26.1).
                            </p>
                            <p>
                                Вся продукция Lumera изготавливается по индивидуальному заказу клиента: с учётом выбранных размеров, материалов, цвета обивки и конфигурации. Такие товары имеют индивидуально-определённые свойства.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="ret-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Товары надлежащего качества</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                Согласно законодательству РФ, товары надлежащего качества, изготовленные по индивидуальному заказу, возврату и обмену не подлежат.
                            </p>
                            <p>
                                Это относится к мебели, произведённой с учётом персональных пожеланий клиента: выбранная ткань, размер, конфигурация, цвет и материалы.
                            </p>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="ret-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Товары ненадлежащего качества</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                Если при получении вы обнаружили производственный брак или несоответствие заказу, мы гарантируем:
                            </p>
                            <ul className="space-y-3 pl-0">
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>Бесплатную замену изделия на аналогичное или идентичное</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>При отсутствии необходимого варианта отделки &mdash; подбор схожего решения или полный возврат стоимости</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>Рассмотрение обращения в течение 5 рабочих дней</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="ret-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Порядок обращения</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                Для оформления возврата или обмена свяжитесь с нами любым удобным способом:
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">1.</span>
                                    <span>Напишите на <a href="mailto:info@lumerahome.ru" className="text-accent hover:underline">info@lumerahome.ru</a> с описанием проблемы и фотографиями</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">2.</span>
                                    <span>Укажите номер заказа и дату получения</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">3.</span>
                                    <span>Мы рассмотрим обращение и предложим решение</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Back link */}
                    <div className="ret-section pt-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-accent text-sm font-sans hover:underline transition-colors">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            На главную
                        </Link>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Returns;
