import React, { useEffect, useState } from 'react';
import { submitForm } from '../utils/submitForm';

const RequestModal = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ name: '', phone: '' });
    const [contactMethod, setContactMethod] = useState('WhatsApp');
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) return;
        setStatus('sending');

        const message = `Способ связи: ${contactMethod}\nИсточник: блок «Не нашли что искали»`;

        try {
            await submitForm({
                ...form,
                email: '',
                company: '',
                message,
                page: 'Индивидуальный запрос',
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
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

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Desktop: center panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Оставить заявку"
                className={`fixed inset-0 z-[61] hidden md:flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div
                    className={`relative bg-background w-full max-w-lg rounded-3xl shadow-floating overflow-hidden transition-transform duration-300 ease-out ${isOpen ? 'scale-100' : 'scale-95'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />

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
                            <SuccessState />
                        ) : (
                            <FormContent
                                form={form}
                                contactMethod={contactMethod}
                                status={status}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                setContactMethod={setContactMethod}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile: bottom sheet */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Оставить заявку"
                className={`fixed bottom-0 left-0 right-0 z-[61] md:hidden bg-background rounded-t-3xl shadow-floating overflow-hidden transition-transform duration-400 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '90vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-primary/15" />
                </div>

                {/* Close */}
                <div className="flex items-center justify-between px-6 pb-3">
                    <span />
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors duration-200"
                        aria-label="Закрыть"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                    {status === 'success' ? (
                        <SuccessState />
                    ) : (
                        <FormContent
                            form={form}
                            contactMethod={contactMethod}
                            status={status}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            setContactMethod={setContactMethod}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

/* ─── Success State ─── */
const SuccessState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-primary mb-3">Спасибо за заявку!</h2>
        <p className="text-sm text-secondary font-sans">Мы свяжемся с вами в ближайшее время</p>
    </div>
);

/* ─── Form ─── */
const FormContent = ({ form, contactMethod, status, handleChange, handleSubmit, setContactMethod }) => (
    <>
        <h2 className="text-2xl md:text-3xl font-serif text-primary mb-2 pr-10">Оставить заявку</h2>
        <p className="text-xs text-secondary font-sans mb-8">Опишите, что ищете — мы подберём и рассчитаем стоимость</p>

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
                {status === 'sending' ? 'Отправка...' : 'Отправить заявку'}
            </button>

            <p className="text-[9px] text-center text-secondary uppercase tracking-[0.15em]">
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
        </form>
    </>
);

export default RequestModal;
