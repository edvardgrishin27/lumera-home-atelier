import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useContent } from '../context/ContentContext';
import { submitForm } from '../utils/submitForm';
import SEO from '../components/SEO';

const Contact = () => {
    const containerRef = useRef(null);
    const { content } = useContent();
    const cPage = content.contactPage;
    const s = content.settings;
    const [form, setForm] = useState({ name: '', phone: '' });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setStatus('sending');
        try {
            await submitForm({ ...form, email: '', company: '', message: '', page: 'Контакты' });
            setStatus('success');
            setForm({ name: '', phone: '' });
        } catch {
            setStatus('error');
        }
    };

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background w-full relative pt-32 lg:pt-0">
            <SEO
                title="Контакты"
                description="Свяжитесь с Lumera Home Atelier — телефон, email, адрес шоурума в Москве. Оставьте заявку на консультацию."
                url="/contact"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "Lumera Home Atelier",
                    "telephone": "8 (499) 877-16-78",
                    "email": "info@lumerahome.ru",
                    "url": "https://lumerahome.ru",
                    "address": { "@type": "PostalAddress", "addressLocality": "Москва", "addressCountry": "RU" }
                }}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen content-layer relative">

                {/* Visual Left Side */}
                <div className="hidden lg:block relative overflow-hidden bg-surface group cursor-crosshair">
                    <img
                        src={cPage.image1}
                        alt="Contact Studio"
                        className="w-full h-full object-cover reveal transform scale-105 transition-transform duration-1000 ease-spring group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent mix-blend-multiply reveal" />
                    <div className="absolute inset-0 rounded-2xl shadow-elevated group-hover:shadow-hover-glow pointer-events-none transition-shadow duration-500 m-8" />
                    <div className="absolute bottom-20 left-20 reveal">
                        <h2 className="text-white text-5xl font-serif italic max-w-md leading-tight">{cPage.quote}</h2>
                    </div>
                </div>

                {/* Content Right Side */}
                <div className="flex flex-col justify-center px-6 md:px-20 lg:px-32 py-20 bg-background relative z-10 w-full">
                    <div className="max-w-xl w-full mx-auto lg:mx-0">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-accent mb-6 block reveal">{cPage.subtitle}</span>
                        <h1 className="text-6xl md:text-8xl font-serif font-thin mb-16 text-primary tracking-tightest leading-[0.9] reveal">
                            {cPage.title}
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 reveal">
                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-secondary">{s.footerAddressLabel}</h3>
                                <p className="font-serif text-xl text-primary leading-relaxed whitespace-pre-line">{s.footerAddress}</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-secondary">{cPage.connectLabel}</h3>
                                <p className="font-serif text-xl text-primary mb-1 block hover:text-accent transition-colors cursor-pointer">{s.phone}</p>
                                <p className="font-serif text-xl text-primary block hover:text-accent transition-colors cursor-pointer">{s.email}</p>
                            </div>
                        </div>

                        {/* Elevated Form */}
                        <div className="bg-surface p-8 md:p-12 rounded-3xl shadow-floating reveal relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-background via-accent to-background opacity-50"></div>
                            <h3 className="font-serif text-3xl mb-8 text-primary">{cPage.formTitle || 'Оставить заявку'}</h3>
                            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                                <div className="relative group">
                                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={cPage.formName || 'ИМЯ'} required aria-label={cPage.formName || 'Имя'} className="w-full bg-transparent border-b border-primary/10 py-3 text-lg font-serif outline-none focus:border-primary transition-colors duration-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase" />
                                </div>
                                <div className="space-y-4 relative group">
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder={cPage.formPhone || 'ТЕЛЕФОН'} aria-label={cPage.formPhone || 'Телефон'} className="w-full bg-transparent border-b border-primary/10 py-3 text-lg font-serif outline-none focus:border-primary transition-colors duration-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase" />
                                </div>
                                {status === 'success' && (
                                    <p className="text-accent font-serif text-base">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
                                )}
                                {status === 'error' && (
                                    <p className="text-red-500 font-serif text-base">Произошла ошибка. Попробуйте ещё раз.</p>
                                )}
                                <button type="submit" disabled={status === 'sending'} aria-label="Отправить форму" className="self-start px-12 py-5 bg-accent text-white text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-accent/80 transition-opacity transition-transform duration-500 ease-spring mt-4 shadow-lg hover:shadow-[0_0_25px_rgba(196,162,101,0.4)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50">
                                    {status === 'sending' ? 'ОТПРАВКА...' : (cPage.formSubmit || 'ОТПРАВИТЬ')}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Contact;
