import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../context/ContentContext';
import { submitForm } from '../utils/submitForm';
import SEO from '../components/SEO';

const B2B = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const b = content.b2b;
    const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' });
    const [contactMethod, setContactMethod] = useState('WhatsApp');
    const [status, setStatus] = useState('idle'); // idle | sending | success | error

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) return;
        setStatus('sending');
        try {
            await submitForm({ ...form, message: `Способ связи: ${contactMethod}`, page: 'B2B' });
            setStatus('success');
            setForm({ name: '', company: '', email: '', phone: '' });
            setContactMethod('WhatsApp');
        } catch {
            setStatus('error');
        }
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Ensure elements are visible immediately if JS fails, but animate from opacity 0
            gsap.fromTo('.reveal-item',
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="bg-background min-h-screen w-full relative pt-16 md:pt-40 px-6 md:px-20 pb-24 md:pb-20">
            <SEO
                title="Мебель для отелей и ресторанов оптом из Китая — B2B"
                description="Мебель оптом из Китая для отелей, ресторанов, офисов и коворкингов. Мебель для HoReCa от Lumera Home Atelier — индивидуальные проекты, доставка по РФ."
                url="/b2b"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Для бизнеса' },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "Какой минимальный объём заказа мебели для бизнеса?",
                            "acceptedAnswer": { "@type": "Answer", "text": "Минимальный заказ — от 5 единиц одной позиции или комплексный проект от 500 000 ₽. Для архитекторов и дизайнеров действуют специальные условия." }
                        },
                        {
                            "@type": "Question",
                            "name": "Какие сроки поставки мебели для HoReCa?",
                            "acceptedAnswer": { "@type": "Answer", "text": "Стандартные сроки производства и доставки — от 45 до 90 дней в зависимости от сложности проекта. Для срочных заказов возможна ускоренная доставка." }
                        },
                        {
                            "@type": "Question",
                            "name": "Работаете ли вы с дизайнерами интерьеров?",
                            "acceptedAnswer": { "@type": "Answer", "text": "Да, мы предлагаем партнёрскую программу для дизайнеров и архитекторов с персональными скидками, приоритетным обслуживанием и выделенным менеджером." }
                        }
                    ]
                }}
            />

            {/* Hero Text */}
            <div className="max-w-4xl mb-10 md:mb-32 content-layer relative">
                <h1 className="text-4xl md:text-8xl font-serif font-thin leading-[0.9] text-primary mb-6 md:mb-12 reveal-item tracking-tightest whitespace-pre-line">
                    {b.title}
                </h1>
                <div className="h-[1px] w-full bg-primary/20 mb-6 md:mb-12 reveal-item origin-left"></div>
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 reveal-item">
                    <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-accent md:w-1/4 pt-2">{b.subtitle}</p>
                    <p className="font-serif text-xl md:text-3xl leading-relaxed text-primary/80 md:w-3/4">
                        {b.description}
                    </p>
                </div>
            </div>

            {/* Grid with 2026 Photos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-40 mb-10 md:mb-40 content-layer">
                <div className="reveal-item group">
                    <div className="aspect-[3/2] md:aspect-[4/5] bg-surface overflow-hidden relative mb-4 md:mb-8 rounded-2xl shadow-elevated group-hover:shadow-hover-glow transition-shadow duration-500">
                        <img src={b.image1} className="w-full h-full object-cover transition-transform duration-1000 ease-spring group-hover:scale-105" alt="Мебель для ресторанов из Китая — интерьер с дизайнерской мебелью Lumera" loading="eager" fetchpriority="high" decoding="sync" width="800" height="1000" style={{ opacity: 0, transition: 'opacity 0.6s ease' }} onLoad={e => { e.target.style.opacity = '1'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                </div>
                <div className="hidden md:block md:pt-40 reveal-item group">
                    <div className="aspect-[4/5] bg-surface overflow-hidden relative mb-8 rounded-2xl shadow-elevated group-hover:shadow-hover-glow transition-shadow duration-500">
                        <img src={b.image2} className="w-full h-full object-cover transition-transform duration-1000 ease-spring group-hover:scale-105" alt="Мебель для офисов и коворкингов — дизайнерские решения Lumera Home Atelier" loading="eager" fetchpriority="high" decoding="async" width="800" height="1000" style={{ opacity: 0, transition: 'opacity 0.6s ease' }} onLoad={e => { e.target.style.opacity = '1'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Form Section Elevated */}
            <div className="w-full bg-surface p-5 md:p-24 reveal-item relative overflow-hidden shadow-floating rounded-2xl md:rounded-3xl content-layer">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-50"></div>
                <div className="flex flex-col md:flex-row gap-6 md:gap-20">
                    <div className="md:w-1/3">
                        <h2 className="text-2xl md:text-5xl font-serif mb-3 md:mb-6 tracking-tight text-primary">{b.formTitle}</h2>
                        <p className="text-secondary text-sm leading-relaxed">
                            {b.formSubtitle}
                        </p>
                    </div>
                    <div className="md:w-2/3">
                        <form className="flex flex-col gap-6 md:gap-12" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Имя *" required className="w-full border-b border-primary/20 py-3 md:py-4 outline-none focus:border-primary transition-colors duration-300 bg-transparent font-serif text-lg md:text-xl text-primary placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase" />
                                <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Компания" className="w-full border-b border-primary/20 py-3 md:py-4 outline-none focus:border-primary transition-colors duration-300 bg-transparent font-serif text-lg md:text-xl text-primary placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Телефон *" required className="w-full border-b border-primary/20 py-3 md:py-4 outline-none focus:border-primary transition-colors duration-300 bg-transparent font-serif text-lg md:text-xl text-primary placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase" />
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border-b border-primary/20 py-3 md:py-4 outline-none focus:border-primary transition-colors duration-300 bg-transparent font-serif text-lg md:text-xl text-primary placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-secondary">Где удобно обсудить детали?</label>
                                <div className="flex gap-3 flex-wrap">
                                    {['WhatsApp', 'Telegram', 'Звонок'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setContactMethod(method)}
                                            className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] rounded-full transition-opacity transition-transform duration-500 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${contactMethod === method ? 'bg-accent text-white shadow-elevated scale-105' : 'bg-background text-primary border border-primary/20 hover:border-accent/50 hover:bg-primary/5'}`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {status === 'success' && (
                                <p className="text-accent font-serif text-base md:text-lg">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
                            )}
                            {status === 'error' && (
                                <p className="text-red-500 font-serif text-base md:text-lg">Произошла ошибка. Попробуйте ещё раз.</p>
                            )}
                            <button type="submit" disabled={status === 'sending'} className="self-start px-8 md:px-12 py-4 md:py-5 bg-accent text-white text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-accent/80 transition-opacity transition-transform duration-500 ease-spring mt-2 md:mt-8 shadow-lg hover:shadow-[0_0_25px_rgba(196,162,101,0.4)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50">
                                {status === 'sending' ? 'Отправка...' : 'Отправить запрос'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default B2B;
