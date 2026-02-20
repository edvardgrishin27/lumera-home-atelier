import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const NotFound = () => {
    useEffect(() => {
        gsap.fromTo('.not-found-anim',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }
        );
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
            <h1 className="not-found-anim text-[15vw] leading-none font-serif text-primary opacity-10">404</h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="not-found-anim text-lg md:text-xl uppercase tracking-widest text-[#999999] mb-4">Страница не найдена</p>
                <h2 className="not-found-anim text-3xl md:text-5xl font-serif text-primary mb-8">
                    Возможно, она была<br />перемещена или удалена
                </h2>
                <Link
                    to="/"
                    className="not-found-anim inline-block bg-primary text-white px-8 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-accent transition-colors"
                >
                    Вернуться на главную
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
