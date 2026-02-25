import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginAdmin } from '../utils/api';

// ─── Session Management ───

const SESSION_KEY = 'lumera_session';

const saveSession = (token, expiresAt) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        token,
        expires: new Date(expiresAt).getTime(),
        created: Date.now(),
    }));
};

export const isSessionValid = () => {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
        return session.token && session.expires && Date.now() < session.expires;
    } catch {
        return false;
    }
};

export const destroySession = () => {
    localStorage.removeItem(SESSION_KEY);
};

// ─── Login Component ───

const Login = () => {
    const { uuid } = useParams();
    const [step, setStep] = useState('password'); // 'password' | 'totp'
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lockMinutes, setLockMinutes] = useState(0);
    const navigate = useNavigate();
    const totpInputRef = useRef(null);

    // Validate UUID — if wrong, show 404-like page
    const validUuid = import.meta.env.VITE_ADMIN_UUID;
    const isValidAccess = uuid === validUuid;

    // If already authenticated, redirect to admin
    useEffect(() => {
        if (isValidAccess && isSessionValid()) {
            navigate(`/panel/${uuid}/admin`, { replace: true });
        }
    }, [isValidAccess, uuid, navigate]);

    // If UUID is wrong — render a fake 404
    if (!isValidAccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans gap-6">
                <h1 className="text-8xl font-serif font-thin text-primary/20">404</h1>
                <p className="text-sm uppercase tracking-[0.2em] text-secondary">Страница не найдена</p>
                <a href="/" className="text-xs uppercase tracking-widest text-accent hover:underline mt-4">На главную</a>
            </div>
        );
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!password) return;

        // Move to TOTP step — password stays in state until final submit
        setStep('totp');
        setError('');
        setTimeout(() => totpInputRef.current?.focus(), 100);
    };

    const handleTotpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Send both password + TOTP to server for validation
            const data = await loginAdmin(password, totpCode);

            // Success! Save session token and redirect
            saveSession(data.token, data.expiresAt);
            navigate(`/panel/${uuid}/admin`, { replace: true });
        } catch (err) {
            const errData = err.data || {};

            if (errData.error === 'locked') {
                setLockMinutes(errData.lockedMinutes || 15);
                setStep('password');
                setPassword('');
                setTotpCode('');
            } else if (errData.error === 'invalid_password') {
                // Wrong password — go back to password step
                setStep('password');
                setTotpCode('');
                setError(errData.message || 'Неверный пароль');
            } else if (errData.error === 'invalid_totp') {
                setTotpCode('');
                setError(errData.message || 'Неверный код');
            } else {
                setError(err.message || 'Ошибка авторизации');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-format TOTP input
    const handleTotpChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setTotpCode(val);
        // Auto-submit when 6 digits entered
        if (val.length === 6) {
            setTimeout(() => {
                const form = e.target.closest('form');
                if (form) form.requestSubmit();
            }, 100);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background font-sans">
            <div className="bg-surface p-10 rounded-[40px] shadow-xl w-full max-w-md border border-primary/5">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-primary mb-2">LUMERA</h1>
                    <p className="text-xs uppercase tracking-widest text-secondary">
                        {step === 'password' ? 'Авторизация' : 'Двухфакторная проверка'}
                    </p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 'password' ? 'bg-accent scale-125' : 'bg-accent/30'}`} />
                    <div className="w-8 h-[1px] bg-primary/10" />
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 'totp' ? 'bg-accent scale-125' : 'bg-primary/10'}`} />
                </div>

                {lockMinutes > 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">🔒</div>
                        <p className="text-sm text-secondary mb-2">Слишком много попыток</p>
                        <p className="text-xs text-secondary">Подождите ~{lockMinutes} мин.</p>
                    </div>
                ) : step === 'password' ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Пароль"
                                className="w-full border-b border-primary/10 py-3 text-primary placeholder-secondary/50 focus:outline-none focus:border-accent transition-colors text-center text-lg rounded-none bg-transparent"
                                autoFocus
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs text-center uppercase tracking-wider">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full bg-accent text-white py-4 rounded-full text-xs uppercase tracking-widest hover:bg-accent/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)]"
                        >
                            {isLoading ? 'Проверка...' : 'Далее →'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleTotpSubmit} className="space-y-6">
                        <div className="text-center mb-4">
                            <p className="text-xs text-secondary leading-relaxed">
                                Введите 6-значный код<br />из Google Authenticator
                            </p>
                        </div>

                        <div>
                            <input
                                ref={totpInputRef}
                                type="text"
                                inputMode="numeric"
                                value={totpCode}
                                onChange={handleTotpChange}
                                placeholder="000000"
                                className="w-full border-b border-primary/10 py-3 text-primary placeholder-secondary/30 focus:outline-none focus:border-accent transition-colors text-center text-3xl tracking-[0.5em] rounded-none bg-transparent font-mono"
                                maxLength={6}
                                disabled={isLoading}
                                autoComplete="one-time-code"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs text-center uppercase tracking-wider">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || totpCode.length < 6}
                            className="w-full bg-accent text-white py-4 rounded-full text-xs uppercase tracking-widest hover:bg-accent/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(196,162,101,0.25)] hover:shadow-[0_0_25px_rgba(196,162,101,0.55)]"
                        >
                            {isLoading ? 'Проверка...' : 'Войти'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('password'); setError(''); setTotpCode(''); }}
                            className="w-full text-xs text-secondary hover:text-primary transition-colors uppercase tracking-widest py-2"
                        >
                            ← Назад
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
