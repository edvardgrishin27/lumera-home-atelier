import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const removeToast = useCallback((id) => {
        // First mark as exiting for animation
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        // Then remove after animation
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            delete timersRef.current[id];
        }, 300);
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = ++toastIdCounter;
        setToasts(prev => [...prev.slice(-4), { id, message, type, exiting: false }]); // max 5

        timersRef.current[id] = setTimeout(() => removeToast(id), duration);

        return id;
    }, [removeToast]);

    const toast = {
        success: (msg) => addToast(msg, 'success', 3000),
        error: (msg) => addToast(msg, 'error', 5000),
        info: (msg) => addToast(msg, 'info', 3000),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container */}
            <div
                aria-live="polite"
                className="fixed bottom-24 md:bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => removeToast(t.id)}
                        className={`
                            pointer-events-auto cursor-pointer
                            px-5 py-3 rounded-2xl shadow-lg
                            text-sm font-medium max-w-sm
                            transition-all duration-300 ease-out
                            ${t.exiting
                                ? 'opacity-0 translate-x-8'
                                : 'opacity-100 translate-x-0'
                            }
                            ${t.type === 'success'
                                ? 'bg-[#1a1a1a] text-[#C4A265] border border-[#C4A265]/20'
                                : t.type === 'error'
                                    ? 'bg-[#1a1a1a] text-red-400 border border-red-500/20'
                                    : 'bg-[#1a1a1a] text-gray-300 border border-gray-600/20'
                            }
                        `}
                        style={{
                            animation: t.exiting ? 'none' : 'toast-slide-in 0.3s ease-out',
                        }}
                    >
                        <span className="mr-2">
                            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
                        </span>
                        {t.message}
                    </div>
                ))}
            </div>

            {/* Inline animation keyframes */}
            <style>{`
                @keyframes toast-slide-in {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
