import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as OTPAuth from 'otpauth';

// ─── Security Utilities ───

const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

// Rate limiting: max 5 attempts, 15 min lockout
const RATE_LIMIT_KEY = 'lumera_rl';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const getRateLimit = () => {
    try {
        const data = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
        return { attempts: data.a || 0, lockedUntil: data.l || 0 };
    } catch {
        return { attempts: 0, lockedUntil: 0 };
    }
};

const incrementAttempts = () => {
    const rl = getRateLimit();
    const newAttempts = rl.attempts + 1;
    const lockout = newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ a: newAttempts, l: lockout }));
    return { attempts: newAttempts, lockedUntil: lockout };
};

const resetAttempts = () => {
    localStorage.removeItem(RATE_LIMIT_KEY);
};

const isLocked = () => {
    const rl = getRateLimit();
    if (rl.lockedUntil && Date.now() < rl.lockedUntil) {
        return Math.ceil((rl.lockedUntil - Date.now()) / 60000);
    }
    if (rl.lockedUntil && Date.now() >= rl.lockedUntil) {
        resetAttempts();
    }
    return 0;
};

// Session: 24-hour expiration
const SESSION_KEY = 'lumera_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const createSession = () => {
    const session = {
        token: crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), ''),
        expires: Date.now() + SESSION_DURATION,
        created: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
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
    const lockTimerRef = useRef(null);

    // Validate UUID — if wrong, show 404-like page
    const validUuid = import.meta.env.VITE_ADMIN_UUID;
    const isValidAccess = uuid === validUuid;

    // Check lock status periodically
    useEffect(() => {
        const checkLock = () => {
            const mins = isLocked();
            setLockMinutes(mins);
        };
        checkLock();
        lockTimerRef.current = setInterval(checkLock, 10000);
        return () => clearInterval(lockTimerRef.current);
    }, []);

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

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Check rate limit
        const mins = isLocked();
        if (mins > 0) {
            setError(`Слишком много попыток. Подождите ${mins} мин.`);
            setLockMinutes(mins);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Artificial delay to slow brute force
            await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

            const inputHash = await hashPassword(password);
            const storedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

            if (inputHash === storedHash) {
                // Password correct — move to TOTP step
                setStep('totp');
                setError('');
                setTimeout(() => totpInputRef.current?.focus(), 100);
            } else {
                const rl = incrementAttempts();
                const remaining = MAX_ATTEMPTS - rl.attempts;
                if (rl.lockedUntil) {
                    setError('Аккаунт заблокирован на 15 минут');
                    setLockMinutes(15);
                } else {
                    setError(`Неверный пароль (${remaining} ${remaining === 1 ? 'попытка' : remaining < 5 ? 'попытки' : 'попыток'})`);
                }
            }
        } catch {
            setError('Ошибка авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTotpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await new Promise(r => setTimeout(r, 300));

            const totp = new OTPAuth.TOTP({
                issuer: 'Lumera',
                label: 'Admin',
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(import.meta.env.VITE_TOTP_SECRET),
            });

            // Validate with ±1 window (allows 30s before/after)
            const delta = totp.validate({ token: totpCode.replace(/\s/g, ''), window: 1 });

            if (delta !== null) {
                // Success! Create session and redirect
                resetAttempts();
                createSession();
                navigate(`/panel/${uuid}/admin`, { replace: true });
            } else {
                const rl = incrementAttempts();
                if (rl.lockedUntil) {
                    setError('Аккаунт заблокирован на 15 минут');
                    setStep('password');
                    setPassword('');
                    setTotpCode('');
                    setLockMinutes(15);
                } else {
                    setError('Неверный код. Попробуйте ещё.');
                    setTotpCode('');
                }
            }
        } catch {
            setError('Ошибка проверки кода');
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
                            {isLoading ? 'Проверка...' : 'Далее \u2192'}
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
                            \u2190 Назад
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
