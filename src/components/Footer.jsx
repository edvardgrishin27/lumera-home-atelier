import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

const Footer = () => {
    const { content } = useContent();
    const s = content.settings;

    return (
        <footer className="bg-background text-primary pt-20 pb-12 px-6 md:px-20 overflow-hidden border-t border-primary/5">
            {/* Top Heading */}
            <div className="mb-20">
                <h2 className="text-5xl md:text-7xl font-sans uppercase tracking-widest font-normal text-primary">Контакты</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
                {/* Image (Mood) - Left Side */}
                <div className="md:col-span-4 self-end">
                    <div className="aspect-[4/3] overflow-hidden opacity-90 hover:opacity-100 transition-all duration-700">
                        <img
                            src="https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=2000"
                            alt="Interior Detail"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Spacing */}
                <div className="md:col-span-1"></div>

                {/* Info Columns */}
                <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-12 font-sans text-sm tracking-wide leading-relaxed text-primary/70">

                    {/* Column 1: Schedule */}
                    <div>
                        <h3 className="text-primary/40 text-xs uppercase tracking-widest mb-6">График</h3>
                        <div className="space-y-4">
                            <div>
                                <span className="block text-primary">МСК</span>
                                <span className="block mt-1">{s.scheduleMSK}</span>
                            </div>
                            <div>
                                <span className="block text-primary mt-4">СПБ</span>
                                <span className="block mt-1">{s.scheduleSPB}</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Contacts */}
                    <div>
                        <h3 className="text-primary/40 text-xs uppercase tracking-widest mb-6">Контакты</h3>
                        <div className="space-y-4 flex flex-col items-start">
                            <a href={`tel:${s.phone.replace(/[^+\d]/g, '')}`} className="hover:text-accent transition-colors">
                                {s.phone}
                            </a>
                            <a href={`mailto:${s.email}`} className="hover:text-accent transition-colors">
                                {s.email}
                            </a>
                            <div className="pt-4 flex flex-col gap-2">
                                <a href={s.whatsapp} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">WhatsApp</a>
                                <a href={s.telegram} target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Telegram</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Documents */}
                    <div>
                        <h3 className="text-primary/40 text-xs uppercase tracking-widest mb-6">Документы</h3>
                        <div className="space-y-4 flex flex-col items-start">
                            <Link to="/offer" className="hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                                Публичная оферта
                            </Link>
                            <Link to="/privacy" className="hover:text-accent transition-colors border-b border-transparent hover:border-accent">
                                Политика конфиденциальности
                            </Link>
                            <Link to="/requisites" className="hover:text-accent transition-colors border-b border-transparent hover:border-accent mt-4">
                                Реквизиты
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-primary/10 pt-8 flex justify-center items-center text-[10px] uppercase tracking-widest text-primary/40">
                <span>© 2026</span>
            </div>

        </footer>
    );
};

export default Footer;
