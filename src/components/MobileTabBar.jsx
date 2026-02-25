import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutGrid, Briefcase, Users, BookOpen } from 'lucide-react';

const TABS = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/catalog', label: 'Каталог', icon: LayoutGrid },
    { path: '/b2b', label: 'Бизнесу', icon: Briefcase },
    { path: '/about', label: 'О нас', icon: Users },
    { path: '/blog', label: 'Блог', icon: BookOpen },
];

const MobileTabBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleTabClick = (path) => {
        if (location.pathname === path) {
            window.dispatchEvent(new CustomEvent('scrollToTop', { detail: { smooth: true } }));
        } else {
            navigate(path);
        }
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-[48] md:hidden"
            aria-label="Мобильная навигация"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="mx-3 mb-2">
                <div className="flex items-center justify-around bg-surface/95 backdrop-blur-xl rounded-2xl shadow-floating border border-primary/5 px-1.5 py-1.5">
                    {TABS.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleTabClick(tab.path)}
                                className="relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                                aria-label={tab.label}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileTabPill"
                                        className="absolute inset-0 bg-accent/10 dark:bg-accent/15 rounded-xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon
                                    className={`relative z-10 w-5 h-5 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-secondary'}`}
                                    strokeWidth={isActive ? 2 : 1.5}
                                />
                                <AnimatePresence mode="wait">
                                    {isActive && (
                                        <motion.span
                                            key={tab.path}
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 'auto', opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className="relative z-10 text-[10px] font-sans font-medium tracking-wide text-accent whitespace-nowrap overflow-hidden"
                                        >
                                            {tab.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default MobileTabBar;
