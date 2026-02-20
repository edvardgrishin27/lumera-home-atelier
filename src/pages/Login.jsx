import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const inputHash = await hashPassword(password);
            const storedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

            if (inputHash === storedHash) {
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/admin');
            } else {
                setError('Неверный пароль');
            }
        } catch {
            setError('Ошибка авторизации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background font-sans">
            <div className="bg-surface p-10 rounded-[40px] shadow-xl w-full max-w-md border border-primary/5">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-primary mb-2">LUMERA</h1>
                    <p className="text-xs uppercase tracking-widest text-secondary">Admin Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            className="w-full border-b border-primary/10 py-3 text-primary placeholder-secondary/50 focus:outline-none focus:border-accent transition-colors text-center text-lg rounded-none bg-transparent"
                            autoFocus
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs text-center uppercase tracking-wider">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-4 rounded-full text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Проверка...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
