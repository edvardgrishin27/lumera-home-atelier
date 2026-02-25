import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import SEO from '../components/SEO';

const Guarantee = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.gar-header', { opacity: 0, y: 50, duration: 1.2, ease: 'power3.out', delay: 0.2 });
            gsap.from('.gar-section', { opacity: 0, y: 40, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.5 });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-background min-h-screen">
            <SEO
                title="Гарантии на мебель — условия | Lumera Home Atelier"
                description="Гарантийные обязательства Lumera: 12 месяцев гарантии, контроль качества, сервисная поддержка."
                url="/guarantee"
            />

            <section className="pt-40 md:pt-48 pb-16 md:pb-20 px-6 md:px-20">
                <div className="gar-header max-w-4xl">
                    <span className="text-accent text-[10px] md:text-xs uppercase tracking-[0.3em] font-sans block mb-6">
                        Покупателям
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-primary leading-[1.05] tracking-tight mb-8">
                        Гарантии
                    </h1>
                </div>
            </section>

            <section className="px-6 md:px-20 pb-32">
                <div className="max-w-3xl space-y-12">

                    {/* Section 1 */}
                    <div className="gar-section">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Гарантийный срок</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                На всю продукцию Lumera Home Atelier предоставляется гарантия <strong className="text-primary">12 месяцев</strong> со дня передачи товара покупателю.
                            </p>
                            <p>
                                В течение гарантийного срока мы несём полную ответственность за производственные дефекты и скрытые недостатки изделия.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="gar-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Что покрывает гарантия</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>Дефекты каркаса и несущих конструкций</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>Неисправности механизмов трансформации</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>Отклонения обивочных материалов от заявленных характеристик</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">&#10003;</span>
                                    <span>Несоответствие размеров или комплектации договору</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="gar-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Ограничения гарантии</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed">
                            <p className="mb-4">Гарантия не распространяется на:</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary/30 mt-1 shrink-0">&mdash;</span>
                                    <span>Повреждения, вызванные нарушением условий эксплуатации</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary/30 mt-1 shrink-0">&mdash;</span>
                                    <span>Естественный износ материалов при регулярном использовании</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary/30 mt-1 shrink-0">&mdash;</span>
                                    <span>Механические повреждения, нанесённые после получения</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary/30 mt-1 shrink-0">&mdash;</span>
                                    <span>Следствия самостоятельного ремонта или модификации</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="gar-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Гарантийное обслуживание</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                В случае подтверждения гарантийного случая:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">1.</span>
                                    <span>Изделие будет заменено на аналогичное или идентичное</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">2.</span>
                                    <span>При отсутствии необходимых материалов &mdash; подбираем схожий вариант или оформляем полный возврат стоимости</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-accent mt-1 shrink-0">3.</span>
                                    <span>Срок рассмотрения обращения &mdash; до 5 рабочих дней</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="gar-section border-t border-primary/8 pt-10">
                        <h2 className="text-xl md:text-2xl font-serif font-light text-primary mb-4">Рекомендации по уходу</h2>
                        <div className="text-sm md:text-base text-secondary font-sans leading-relaxed space-y-4">
                            <p>
                                Для продления срока службы мебели рекомендуем соблюдать инструкцию по эксплуатации, которая является частью договора. Подробные рекомендации по уходу за конкретными материалами предоставляются при покупке.
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="gar-section border-t border-primary/8 pt-10">
                        <p className="text-sm text-secondary font-sans leading-relaxed">
                            По вопросам гарантийного обслуживания пишите на{' '}
                            <a href="mailto:info@lumerahome.ru" className="text-accent hover:underline">info@lumerahome.ru</a>
                            {' '}или свяжитесь с нами через{' '}
                            <Link to="/contact" className="text-accent hover:underline">контактную форму</Link>.
                        </p>
                    </div>

                    {/* Back link */}
                    <div className="gar-section pt-4">
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

export default Guarantee;
