import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { submitForm } from '../utils/submitForm';
import SEO from '../components/SEO';

const Request = () => {
    const containerRef = useRef(null);
    const [contactMethod, setContactMethod] = useState('WhatsApp');
    const [form, setForm] = useState({ name: '', phone: '' });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) return;
        setStatus('sending');
        try {
            await submitForm({ ...form, email: '', company: '', message: `Способ связи: ${contactMethod}`, page: 'Заявка' });
            setStatus('success');
            setForm({ name: '', phone: '' });
        } catch {
            setStatus('error');
        }
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.reveal',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-background flex flex-col items-center justify-center px-4 md:px-0 pt-16 md:pt-32 pb-32">
            <SEO
                title="Заявка на подбор мебели из Китая — бесплатная консультация"
                description="Оставьте заявку на подбор мебели из Китая — бесплатная консультация от Lumera Home Atelier. Ответим в течение 15 минут. Индивидуальный подбор."
                url="/request"
                breadcrumbs={[
                    { name: 'Главная', url: '/' },
                    { name: 'Заявка' },
                ]}
            />
            <div className="max-w-xl w-full content-layer bg-surface p-12 md:p-16 rounded-3xl shadow-floating relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-background via-primary to-background opacity-20"></div>

                <h1 className="text-4xl md:text-5xl font-serif text-center mb-6 reveal tracking-tight text-primary">Оставить заявку</h1>
                <p className="text-center text-secondary font-serif mb-12 reveal text-sm px-4">
                    Заполните форму, и мы свяжемся с вами в течение 15 минут для уточнения деталей.
                </p>

                <form className="space-y-12 reveal" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="relative group">
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ваше имя"
                            required
                            className="w-full bg-transparent border-b border-primary/10 py-4 text-xl font-serif text-primary outline-none focus:border-primary transition-colors duration-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase"
                        />
                    </div>

                    {/* Phone */}
                    <div className="relative group">
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Телефон"
                            required
                            className="w-full bg-transparent border-b border-primary/10 py-4 text-xl font-serif text-primary outline-none focus:border-primary transition-colors duration-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.2em] placeholder:text-secondary placeholder:uppercase"
                        />
                    </div>

                    {/* Contact Method */}
                    <div className="space-y-6">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-secondary">Где удобно обсудить детали?</label>
                        <div className="flex gap-3 flex-wrap">
                            {['WhatsApp', 'Telegram', 'Звонок'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setContactMethod(method)}
                                    className={`px-6 py-3 text-[10px] uppercase tracking-[0.2em] rounded-full transition-opacity transition-transform duration-500 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${contactMethod === method ? 'bg-accent text-white shadow-elevated scale-105' : 'bg-surface text-primary border border-primary/20 hover:border-accent/50 hover:bg-primary/5'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {status === 'success' && (
                        <p className="text-accent font-serif text-lg text-center">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
                    )}
                    {status === 'error' && (
                        <p className="text-red-500 font-serif text-lg text-center">Произошла ошибка. Попробуйте ещё раз.</p>
                    )}

                    {/* Submit */}
                    <div className="pt-8">
                        <button type="submit" disabled={status === 'sending'} className="w-full py-5 bg-accent text-white text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-accent/80 transition-opacity transition-transform duration-500 ease-spring shadow-lg hover:shadow-[0_0_25px_rgba(196,162,101,0.4)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50">
                            {status === 'sending' ? 'Отправка...' : 'Отправить заявку'}
                        </button>
                        <p className="text-[10px] text-center text-secondary mt-6 uppercase tracking-[0.2em]">
                            Нажимая кнопку, вы соглашаетесь с <a href="#" className="border-b border-secondary/50 hover:text-primary transition-colors">политикой конфиденциальности</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Request;
