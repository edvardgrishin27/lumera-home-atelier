import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background font-sans">
                    <div className="text-center max-w-md px-8">
                        <h1 className="text-4xl font-serif text-primary mb-4">Что-то пошло не так</h1>
                        <p className="text-secondary text-sm mb-8 leading-relaxed">
                            Произошла непредвиденная ошибка. Попробуйте обновить страницу.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 border border-primary/20 bg-transparent text-xs font-sans uppercase tracking-widest hover:bg-primary hover:text-white transition-colors duration-300 rounded-sm"
                        >
                            Обновить страницу
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
