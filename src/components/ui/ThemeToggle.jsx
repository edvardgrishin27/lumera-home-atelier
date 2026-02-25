import { Moon, Sun } from 'lucide-react';

/**
 * Premium theme toggle switch for Lumera Home Atelier.
 *
 * Props:
 *   isDark   – current dark-mode state
 *   onToggle – callback fired on click
 *   className – optional extra classes on the outer wrapper
 */
const ThemeToggle = ({ isDark, onToggle, className = '' }) => {
    return (
        <div
            className={[
                'flex w-16 h-8 p-1 rounded-full cursor-pointer',
                'transition-all duration-300 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                isDark
                    ? 'bg-[rgb(var(--color-surface))] border border-primary/15'
                    : 'bg-white border border-primary/10',
                className,
            ].join(' ')}
            onClick={onToggle}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
            role="switch"
            aria-checked={isDark}
            aria-label="Переключить тему"
            tabIndex={0}
        >
            <div className="flex justify-between items-center w-full">
                {/* Active indicator — slides left/right */}
                <div
                    className={[
                        'flex justify-center items-center w-6 h-6 rounded-full',
                        'transition-transform duration-300 ease-out',
                        isDark
                            ? 'translate-x-0 bg-accent/20'
                            : 'translate-x-8 bg-accent/15',
                    ].join(' ')}
                >
                    {isDark ? (
                        <Moon className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    ) : (
                        <Sun className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    )}
                </div>

                {/* Inactive icon — opposite side */}
                <div
                    className={[
                        'flex justify-center items-center w-6 h-6 rounded-full',
                        'transition-transform duration-300 ease-out',
                        isDark
                            ? 'bg-transparent'
                            : '-translate-x-8',
                    ].join(' ')}
                >
                    {isDark ? (
                        <Sun className="w-3.5 h-3.5 text-secondary/60" strokeWidth={1.5} />
                    ) : (
                        <Moon className="w-3.5 h-3.5 text-secondary/60" strokeWidth={1.5} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThemeToggle;
