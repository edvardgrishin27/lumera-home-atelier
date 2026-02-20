import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;

        // Check if device is touch
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const moveCursor = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.2, // slight lag
                ease: 'power2.out'
            });
        };

        const hoverElements = document.querySelectorAll('a, button, .hover-trigger');

        const onHover = () => cursor.classList.add('hovered');
        const onLeave = () => cursor.classList.remove('hovered');

        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', onHover);
            el.addEventListener('mouseleave', onLeave);
        });

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            hoverElements.forEach(el => {
                el.removeEventListener('mouseenter', onHover);
                el.removeEventListener('mouseleave', onLeave);
            });
        };
    }, []); // Re-run on route change would be better in a real app hook

    return (
        <div ref={cursorRef} className="custom-cursor fixed pointer-events-none z-[9999] hidden md:block" />
    );
};

export default CustomCursor;
