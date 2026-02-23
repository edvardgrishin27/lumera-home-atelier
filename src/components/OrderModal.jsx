import React, { useEffect, useRef, useState } from 'react';
import { submitForm } from '../utils/submitForm';

const OrderModal = ({ isOpen, onClose, product, selectedColor, selectedSize }) => {
    const [form, setForm] = useState({ name: '', phone: '' });
    const [contactMethod, setContactMethod] = useState('WhatsApp');
    const [status, setStatus] = useState('idle');
    const backdropRef = useRef(null);
    const panelRef = useRef(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) return;
        setStatus('sending');

        const colorName = product.colors?.[selectedColor]?.name || '—';
        const sizeName = product.sizes?.[selectedSize]?.value || product.specs || '—';
        const productUrl = `https://lumerahome.ru/product/${product.slug}`;

        const message = [
            `Товар: ${product.name}`,
            `Цена: ${product.price?.toLocaleString()} ₽`,
            `Цвет: ${colorName}`,
            `Габариты: ${sizeName}`,
            `Категория: ${product.category}`,
            `Ссылка: ${productUrl}`,
            `Способ связи: ${contactMethod}`,
        ].join('\n');

        try {
            await submitForm({
                ...form,
                email: '',
                company: '',
                message,
                page: 'Заказ товара',
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
                // Reset after close animation completes
                setTimeout(() => {
                    setStatus('idle');
                    setForm({ name: '', phone: '' });
                }, 300);
            }, 2500);
        } catch {
            setStatus('error');
        }
    };

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!product) return null;

    const colorName = product.colors?.[selectedColor]?.name;
    const colorHex = product.colors?.[selectedColor]?.hex;
    const sizeLabel = product.sizes?.[selectedSize]?.label;

    return (
        <>
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Оформление заказа"
                className={`fixed inset-0 z-[61] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div
                    className={`relative bg-background w-full max-w-lg rounded-3xl shadow-floating overflow-hidden transition-transform duration-300 ease-out ${isOpen ? 'scale-100' : 'scale-95'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full border border-primary/10 text-secondary hover:text-primary hover:border-primary/30 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="p-8 md:p-10">
                        {status === 'success' ? (
                            /* -------- Success State -------- */
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-serif text-primary mb-3">Благодарим за ваш заказ!</h2>
                                <p className="text-sm text-secondary font-sans">Мы свяжемся с вами в ближайшее время</p>
                            </div>
                        ) : (
                            /* -------- Form State -------- */
                            <>
                                <h2 className="text-2xl md:text-3xl font-serif text-primary mb-2 pr-10">Оформить заказ</h2>
                                <p className="text-xs text-secondary font-sans mb-8">Заполните форму, и мы свяжемся для подтверждения</p>

                                {/* Product summary */}
                                <div className="flex items-center gap-4 p-4 bg-surface rounded-2xl mb-8">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                        width="64"
                                        height="64"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-serif text-primary truncate">{product.name}</p>
                                        <p className="text-lg font-serif text-primary">{product.price?.toLocaleString()} ₽</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            {colorName && (
                                                <span className="flex items-center gap-1.5 text-[10px] text-secondary uppercase tracking-wider">
                                                    <span className="w-3 h-3 rounded-full border border-primary/10 flex-shrink-0" style={{ backgroundColor: colorHex }} />
                                                    {colorName}
                                                </span>
                                            )}
                                            {sizeLabel && (
                                                <span className="text-[10px] text-secondary uppercase tracking-wider">{sizeLabel}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Ваше имя"
                                        required
                                        className="w-full bg-transparent border-b border-primary/10 py-3 text-base font-serif text-primary outline-none focus:border-primary transition-colors duration-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.15em] placeholder:text-secondary placeholder:uppercase"
                                    />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Телефон"
                                        required
                                        className="w-full bg-transparent border-b border-primary/10 py-3 text-base font-serif text-primary outline-none focus:border-primary transition-colors duration-300 placeholder:font-sans placeholder:text-xs placeholder:tracking-[0.15em] placeholder:text-secondary placeholder:uppercase"
                                    />

                                    {/* Contact method */}
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[10px] uppercase tracking-[0.15em] text-secondary block">Где удобно обсудить?</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['WhatsApp', 'Telegram', 'Звонок'].map((method) => (
                                                <button
                                                    key={method}
                                                    type="button"
                                                    onClick={() => setContactMethod(method)}
                                                    className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.15em] rounded-full transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${contactMethod === method ? 'bg-accent text-white shadow-elevated scale-105' : 'bg-surface text-primary border border-primary/15 hover:border-accent/40'}`}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-red-500 font-serif text-sm text-center">Ошибка отправки. Попробуйте ещё раз.</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-4 bg-accent text-white text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-accent/85 transition-transform duration-300 ease-out shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50 disabled:hover:translate-y-0"
                                    >
                                        {status === 'sending' ? 'Отправка...' : 'Подтвердить заказ'}
                                    </button>

                                    <p className="text-[9px] text-center text-secondary uppercase tracking-[0.15em]">
                                        Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderModal;
